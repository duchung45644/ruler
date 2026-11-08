/** HTML edit engine (port of the editor class, content.js:14660–15600; 5.12–5.17). */
import {
  changeCount,
  dropRecord,
  recordChange,
  toHtmlChanges,
  type ChangeLog,
  type HtmlChange,
  type HtmlChangeKind,
  type Snapshot,
} from '../../lib/edit/changes';
import { mergeDecls, parseDecls, serializeDecls, type Decl } from '../../lib/edit/decls';
import { History, type Action } from '../../lib/edit/history';
import { PROTECTED_TAGS, sanitizeHtml } from '../../lib/edit/sanitize';
import type { EditResult, EditState, InsertPosition } from '../../lib/edit/types';
import { parentOf, siblingOf } from '../../lib/dom/dom';
import {
  displaySelector,
  ensureElementId,
  ID_ATTR,
  resolveElementById,
  uniquePath,
} from '../../lib/dom/selector';

export interface HtmlEditorOptions {
  extId: string;
  /** Shared id map (bridge), so the panel and the engine resolve the same ids. */
  ids?: Map<string, WeakRef<Element>>;
  isOwn(el: Element): boolean;
  selected(): Element | null;
  select(el: Element | null): void;
  onChange(): void;
}

/** Panel styles may carry these; inline style cannot express them (5.17). */
export type StyleDecl = Decl & { state?: string; media?: string; pseudo?: string };

/** What clearByIds puts back: attributes and children as first seen. */
interface Original {
  cls: string | null;
  style: string | null;
  children: Node[] | null;
  added: Node[];
}

const protectedTag = (el: Element) => PROTECTED_TAGS.has(el.localName);

const restoreAttr = (el: Element, name: string, v: string | null) =>
  v === null ? el.removeAttribute(name) : el.setAttribute(name, v);

export class HtmlEditor {
  private history = new History(50);
  private log: ChangeLog = new Map();
  private originals = new Map<string, Original>();
  /** Ids this engine attached; removed again when their element has no change left (2.24). */
  private ownIds = new Set<string>();
  private clipboard: Element | null = null;
  private ids: Map<string, WeakRef<Element>>;
  private attr: string;
  /** Ids that existed before edit mode; any other id was attached for this session's edits. */
  private preexisting: Set<string>;
  private textEdits = new Map<Element, Node[]>();

  constructor(private opts: HtmlEditorOptions) {
    this.ids = opts.ids ?? new Map();
    this.attr = ID_ATTR(opts.extId);
    this.preexisting = new Set(this.ids.keys());
  }

  // ---- ids, snapshots, change log ----

  private idOf(el: Element): string {
    const had = el.hasAttribute(this.attr);
    const id = ensureElementId(el, this.attr, this.ids);
    // the bridge may have tagged the selection just before (panel open): still ours to remove
    if (!had || !this.preexisting.has(id)) this.ownIds.add(id);
    return id;
  }

  private byId = (id: string) => resolveElementById(id, this.attr, this.ids);

  private stripIds(node: Element): Element {
    const c = node.cloneNode(true) as Element;
    c.removeAttribute(this.attr);
    for (const d of c.querySelectorAll(`[${this.attr}]`)) d.removeAttribute(this.attr);
    return c;
  }

  private snapshot(el: Element): Snapshot {
    return {
      selector: displaySelector(el),
      cssSelector: uniquePath(el),
      html: this.stripIds(el).outerHTML,
    };
  }

  private original(el: Element, id: string, children = false): Original {
    let o = this.originals.get(id);
    if (!o) {
      o = {
        cls: el.getAttribute('class'),
        style: el.getAttribute('style'),
        children: null,
        added: [],
      };
      this.originals.set(id, o);
    }
    if (children && !o.children) o.children = [...el.childNodes].map((n) => n.cloneNode(true));
    return o;
  }

  /** Call before mutating `el`. */
  private track(el: Element, kind: HtmlChangeKind): string {
    const id = this.idOf(el);
    // recordChange keeps the first snapshot only: don't clone + serialise the subtree again
    const known = this.log.get(id);
    recordChange(this.log, id, known ? known.original : this.snapshot(el), kind);
    return id;
  }

  private untrack(id: string): void {
    const rec = this.log.get(id);
    if (!rec) return;
    if (--rec.count > 0) return;
    this.forget(id);
  }

  private forget(id: string): void {
    dropRecord(this.log, id);
    this.originals.delete(id);
    if (!this.ownIds.delete(id)) return;
    this.byId(id)?.removeAttribute(this.attr);
    this.ids.delete(id);
  }

  // ---- results ----

  historyState(): EditState {
    return {
      ...this.history.state(),
      editCount: this.log.size,
      hasClipboard: !!this.clipboard,
    };
  }

  private result(ok: boolean, error?: string): EditResult {
    const sel = this.opts.selected();
    const r: EditResult = { ...this.historyState(), ok };
    if (error) r.error = error;
    // only report ids that exist: attaching one here would outlive undo (2.24)
    const id = ok && sel?.isConnected ? sel.getAttribute(this.attr) : null;
    if (id) r.selectedId = id;
    return r;
  }

  private fail = (error: string) => this.result(false, error);

  private done(a: Action | null): EditResult {
    if (a) this.history.push(a);
    this.opts.onChange();
    return this.result(true);
  }

  private nextAfterRemoval(el: Element): Element | null {
    const own = (n: Element) => this.opts.isOwn(n);
    return siblingOf(el, 1, own) ?? siblingOf(el, -1, own) ?? parentOf(el);
  }

  private guard(verb: string): Element | EditResult {
    const el = this.opts.selected();
    if (!el?.isConnected) return this.fail('No element selected');
    if (this.opts.isOwn(el)) return this.fail('Cannot edit extension UI');
    if (protectedTag(el)) return this.fail(`Cannot ${verb} <${el.localName}>.`);
    return el;
  }

  // ---- inserting nodes (paste / duplicate / insertHtml) ----

  /** One undoable insert; `owner` is the element whose content changes. */
  private insertAction(owner: Element, nodes: Node[], put: () => void, kind: HtmlChangeKind) {
    const ownerId = this.track(owner, kind);
    const orig = this.original(owner, ownerId);
    put();
    orig.added.push(...nodes);
    const first = nodes.find((n): n is Element => n instanceof Element) ?? null;
    let parents: { node: Node; parent: Node; next: Node | null }[] = [];
    return {
      elementIds: [ownerId],
      at: Date.now(),
      undo: () => {
        parents = nodes.map((n) => ({ node: n, parent: n.parentNode!, next: n.nextSibling }));
        for (const n of nodes) (n as ChildNode).remove();
        this.untrack(ownerId);
        return owner;
      },
      redo: () => {
        this.track(owner, kind);
        this.original(owner, ownerId).added.push(...nodes);
        for (const p of parents) p.parent.insertBefore(p.node, p.next);
        return first;
      },
    } satisfies Action;
  }

  // ---- commands (5.12, 5.13) ----

  copy(): EditResult {
    const el = this.guard('copy');
    if (!(el instanceof Element)) return el;
    this.clipboard = this.stripIds(el);
    this.opts.onChange();
    return this.result(true);
  }

  cut(): EditResult {
    const el = this.guard('cut');
    if (!(el instanceof Element)) return el;
    this.clipboard = this.stripIds(el);
    return this.delete();
  }

  paste(): EditResult {
    const target = this.opts.selected();
    if (!this.clipboard) return this.fail('Clipboard is empty');
    if (!target?.isConnected) return this.fail('No element selected');
    if (this.opts.isOwn(target)) return this.fail('Cannot edit extension UI');
    const node = this.clipboard.cloneNode(true) as Element;
    // one paste per copy (5.13)
    this.clipboard = null;
    const a = this.insertAction(target, [node], () => target.appendChild(node), 'paste');
    this.opts.select(node);
    return this.done(a);
  }

  duplicate(): EditResult {
    const el = this.guard('duplicate');
    if (!(el instanceof Element)) return el;
    const parent = el.parentElement!;
    const copy = this.stripIds(el);
    const a = this.insertAction(parent, [copy], () => el.after(copy), 'duplicate');
    this.opts.select(copy);
    return this.done(a);
  }

  delete(): EditResult {
    const el = this.guard('delete');
    if (!(el instanceof Element)) return el;
    const h = el as HTMLElement;
    const id = this.track(el, 'delete');
    this.original(el, id);
    const before = el.getAttribute('style');
    const hide = () => h.style.setProperty('display', 'none', 'important');
    hide();
    const after = el.getAttribute('style');
    const next = this.nextAfterRemoval(el);
    this.opts.select(next);
    return this.done({
      elementIds: [id],
      at: Date.now(),
      undo: () => {
        restoreAttr(el, 'style', before);
        this.untrack(id);
        return el;
      },
      redo: () => {
        this.track(el, 'delete');
        restoreAttr(el, 'style', after);
        return this.nextAfterRemoval(el);
      },
    });
  }

  private step(a: Action | null, run: (a: Action) => Element | null): EditResult {
    if (!a) return this.fail('Nothing to do');
    const prev = this.opts.selected();
    const hit = run(a);
    const pick =
      [hit, prev].find((e) => e?.isConnected) ??
      (prev && (siblingOf(prev, 1, this.opts.isOwn) ?? parentOf(prev))) ??
      null;
    this.opts.select(pick);
    this.opts.onChange();
    return this.result(true);
  }

  undo = (): EditResult => this.step(this.history.undo(), (a) => a.undo());
  redo = (): EditResult => this.step(this.history.redo(), (a) => a.redo());

  // ---- attribute edits (5.14, 5.17) ----

  private attrAction(el: Element, name: string, value: string | null, kind: HtmlChangeKind) {
    const id = this.track(el, kind);
    this.original(el, id);
    const before = el.getAttribute(name);
    restoreAttr(el, name, value);
    const a: Action & { after: string | null } = {
      elementIds: [id],
      at: Date.now(),
      after: value,
      undo: () => {
        restoreAttr(el, name, before);
        this.untrack(id);
        return el;
      },
      redo: () => {
        this.track(el, kind);
        restoreAttr(el, name, a.after);
        return el;
      },
    };
    return a;
  }

  setClasses(el: Element, cls: string): EditResult {
    if (this.opts.isOwn(el)) return this.fail('Cannot edit extension UI');
    const id = this.idOf(el);
    const key = `cls:${id}`;
    const now = Date.now();
    const value = cls.trim().split(/\s+/).filter(Boolean).join(' ');
    const last = this.history.coalesce(key, now, 600) as (Action & { after: string | null }) | null;
    if (last) {
      last.after = value;
      last.at = now;
      el.setAttribute('class', value);
      return this.done(null);
    }
    const a = this.attrAction(el, 'class', value, 'class');
    a.coalesceKey = key;
    return this.done(a);
  }

  setStyles(el: Element, decls: StyleDecl[]): EditResult {
    if (this.opts.isOwn(el)) return this.fail('Cannot edit extension UI');
    if (decls.some((d) => d.state || d.media || d.pseudo))
      return this.fail('Inline styles cannot target states, media queries or pseudo-elements');
    const merged = mergeDecls(parseDecls(el.getAttribute('style') ?? ''), decls);
    const text = serializeDecls(merged);
    return this.done(this.attrAction(el, 'style', text || null, 'style'));
  }

  // ---- content edits (5.15) ----

  private contentAction(el: Element, kind: HtmlChangeKind, apply: () => void): Action {
    const id = this.track(el, kind);
    this.original(el, id, true);
    const before = [...el.childNodes];
    apply();
    const after = [...el.childNodes];
    return {
      elementIds: [id],
      at: Date.now(),
      undo: () => {
        el.replaceChildren(...before);
        this.untrack(id);
        return el;
      },
      redo: () => {
        this.track(el, kind);
        el.replaceChildren(...after);
        return el;
      },
    };
  }

  setText(el: Element, t: string): EditResult {
    if (this.opts.isOwn(el)) return this.fail('Cannot edit extension UI');
    return this.done(this.contentAction(el, 'text', () => (el.textContent = t)));
  }

  setInnerHtml(el: Element, html: string): EditResult {
    if (this.opts.isOwn(el)) return this.fail('Cannot edit extension UI');
    const frag = sanitizeHtml(html, el.ownerDocument);
    return this.done(this.contentAction(el, 'html', () => el.replaceChildren(frag)));
  }

  insertHtml(el: Element, pos: InsertPosition, html: string): EditResult {
    if (this.opts.isOwn(el)) return this.fail('Cannot edit extension UI');
    const outside = pos === 'beforebegin' || pos === 'afterend';
    if (outside && protectedTag(el)) return this.fail(`Cannot insert around <${el.localName}>.`);
    const owner = outside ? el.parentElement : el;
    if (!owner) return this.fail('Element has no parent');
    const frag = sanitizeHtml(html, el.ownerDocument);
    const nodes = [...frag.childNodes];
    if (!nodes.length) return this.fail('Nothing to insert');
    const put = () => {
      if (pos === 'beforebegin') el.before(frag);
      else if (pos === 'afterend') el.after(frag);
      else if (pos === 'afterbegin') el.prepend(frag);
      else el.append(frag);
    };
    return this.done(this.insertAction(owner, nodes, put, 'insert'));
  }

  // ---- text edit mode (5.06) ----

  snapshotForTextEdit(el: Element): void {
    if (!this.textEdits.has(el))
      this.textEdits.set(
        el,
        [...el.childNodes].map((n) => n.cloneNode(true)),
      );
  }

  /** One undo step per edited element; nothing when the text did not change. */
  commitTextEdit(el: Element): EditResult | null {
    const before = this.textEdits.get(el);
    this.textEdits.delete(el);
    if (!before) return null;
    const now = [...el.childNodes];
    const changed = before.length !== now.length || before.some((n, i) => !n.isEqualNode(now[i]!));
    if (!changed) return null;
    const after = now;
    // track against the pre-edit content
    el.replaceChildren(...before);
    return this.done(this.contentAction(el, 'text', () => el.replaceChildren(...after)));
  }

  // ---- reporting / clearing (5.16) ----

  changeCount = (el: Element): number => {
    const id = el.getAttribute(this.attr);
    return id ? changeCount(this.log, id) : 0;
  };

  htmlChanges(): HtmlChange[] {
    return toHtmlChanges(this.log, (id) => {
      const el = this.byId(id);
      return el ? this.snapshot(el) : null;
    });
  }

  private restore(id: string): void {
    const o = this.originals.get(id);
    const el = this.byId(id);
    if (o && el) {
      for (const n of o.added) (n as ChildNode).remove();
      if (o.children) el.replaceChildren(...o.children);
      restoreAttr(el, 'class', o.cls);
      restoreAttr(el, 'style', o.style);
    }
    this.forget(id);
  }

  clearByIds(ids: string[], scope: 'all' | 'html' | 'css' = 'all'): EditResult {
    if (scope !== 'css') {
      const hit = ids.filter((id) => this.log.has(id));
      for (const id of hit) this.restore(id);
      // actions may span the cleared elements; replaying them later would be wrong
      if (hit.length) this.history.clear();
    }
    this.opts.onChange();
    return this.result(true);
  }

  clearAll(): EditResult {
    for (const id of [...this.log.keys()].reverse()) this.restore(id);
    this.history.clear();
    this.clipboard = null;
    this.opts.onChange();
    return this.result(true);
  }

  dispose(): void {
    this.history.clear();
    this.textEdits.clear();
    this.clipboard = null;
  }
}
