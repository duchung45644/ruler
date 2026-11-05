/** CSS rule edit tracker (port of the rule editor class, content.js:16813–17400; 5.18, 5.19). */
import type { KnownRule } from '../../lib/css/matched';
import { INLINE_SOURCE, sheetsOf } from '../../lib/css/matched';
import { parseDecls, serializeDecls } from '../../lib/edit/decls';
import { addressOf, locate, scopeAddressOf, type RuleAddress } from '../../lib/edit/rule-address';
import type { SerializedEdit } from '../../lib/edit/serialize';
import type { RuleChange } from '../../lib/edit/types';
import { ID_ATTR } from '../../lib/selector';
import { OWN_SOURCE, rulesOf } from '../sidepanel/rules';

type Root = Document | ShadowRoot;

interface PageRecord {
  kind: 'page';
  recordId: string;
  root: Root;
  scopeAddress: string | null;
  /** Address of the untouched rule; what reapply and saved edits look up. */
  origin: RuleAddress;
  rule: CSSStyleRule;
  before: { selector: string; declsText: string };
  current: { selector: string; declsText: string };
}

interface OwnRecord {
  kind: 'own';
  recordId: string;
  root: Root;
  scopeAddress: string | null;
  wrappers: string[];
  rule: CSSStyleRule | null;
  current: { selector: string; declsText: string };
}

interface InlineRecord {
  kind: 'inline';
  recordId: string;
  el: HTMLElement;
  before: string | null;
  current: string;
}

type Rec = PageRecord | OwnRecord | InlineRecord;

export type RuleError = { error: string };

let seq = 0;
const newId = () => `r-${(++seq).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Throws on bad syntax without touching the page. */
export function validSelector(sel: string): boolean {
  if (!sel.trim()) return false;
  try {
    document.createDocumentFragment().querySelector(sel);
    return true;
  } catch {
    return false;
  }
}

const tidy = (text: string) => serializeDecls(parseDecls(text));

/** Root a scope address names: hosts joined with ` >>> `, each queried in the previous root. */
export function rootAt(scopeAddress: string | null): Root | null {
  if (scopeAddress === null) return document;
  let root: Root = document;
  for (const path of scopeAddress.split(' >>> ')) {
    let host: Element | null;
    try {
      host = root.querySelector(path);
    } catch {
      return null;
    }
    if (!host?.shadowRoot) return null;
    root = host.shadowRoot;
  }
  return root;
}

/** 1-based line of `selector` in a `<style>` owner's text; null when unknown. */
export function lineOf(rule: CSSStyleRule, selector: string): number | null {
  const node = rule.parentStyleSheet?.ownerNode;
  const text = node instanceof HTMLStyleElement ? node.textContent : null;
  const at = text?.indexOf(selector) ?? -1;
  return at < 0 || !text ? null : text.slice(0, at).split('\n').length;
}

/** True when the rule sits in a sheet attached to `root` (not a fetched copy) we may write to. */
export function writable(rule: CSSStyleRule, root: Root): boolean {
  let sheet: CSSStyleSheet | null = rule.parentStyleSheet;
  while (sheet?.ownerRule?.parentStyleSheet) sheet = sheet.ownerRule.parentStyleSheet;
  const attached = sheetsOf(root).find((s) => s.sheet === sheet);
  if (!attached || attached.source === 'constructed') return false;
  try {
    void sheet!.cssRules;
    return true;
  } catch {
    return false;
  }
}

export class RuleTracker {
  private recs = new Map<string, Rec>();
  private dormant: SerializedEdit[] = [];
  private observer: MutationObserver | null = null;
  private poll: ReturnType<typeof setInterval> | null = null;
  private adopted = new WeakMap<Root, number>();

  constructor(
    private extId: string,
    private onChange: () => void,
  ) {}

  get styleId(): string {
    return `${OWN_SOURCE}-${this.extId}`;
  }

  private all = (root: Root) => rulesOf(root).rules;

  private rootByAddr(addr: RuleAddress): Root | null {
    return rootAt(addr.scopeAddress);
  }

  private find(addr: RuleAddress): { root: Root; hit: KnownRule; all: KnownRule[] } | null {
    const root = this.rootByAddr(addr);
    if (!root) return null;
    const all = this.all(root);
    const hit = locate(addr, all);
    return hit ? { root, hit, all } : null;
  }

  private recordFor(rule: CSSStyleRule): PageRecord | OwnRecord | undefined {
    for (const r of this.recs.values()) if (r.kind !== 'inline' && r.rule === rule) return r;
    return undefined;
  }

  private changed(): void {
    this.onChange();
  }

  // ---- page rules ----

  private pageRecord(root: Root, hit: KnownRule, all: KnownRule[]): PageRecord {
    const scopeAddress = scopeAddressOf(root);
    const rec: PageRecord = {
      kind: 'page',
      recordId: newId(),
      root,
      scopeAddress,
      origin: addressOf(hit, all, scopeAddress),
      rule: hit.rule,
      before: { selector: hit.rule.selectorText, declsText: tidy(hit.rule.style.cssText) },
      current: { selector: hit.rule.selectorText, declsText: tidy(hit.rule.style.cssText) },
    };
    this.recs.set(rec.recordId, rec);
    return rec;
  }

  editRule(addr: RuleAddress, declsText: string): RuleChange | RuleError {
    const f = this.find(addr);
    if (!f) return { error: 'Rule not found' };
    const known = this.recordFor(f.hit.rule);
    if (known?.kind === 'own') {
      known.current.declsText = tidy(declsText);
      this.refreshOwnRules(known.root);
      this.changed();
      return this.change(known);
    }
    if (!writable(f.hit.rule, f.root)) return { error: 'Rule is not editable' };
    const rec = known ?? this.pageRecord(f.root, f.hit, f.all);
    rec.rule.style.cssText = declsText;
    rec.current.declsText = tidy(rec.rule.style.cssText);
    this.settle(rec);
    return this.change(rec);
  }

  editSelector(addr: RuleAddress, selector: string): RuleChange | RuleError {
    if (!validSelector(selector)) return { error: 'Invalid selector' };
    const f = this.find(addr);
    if (!f) return { error: 'Rule not found' };
    const known = this.recordFor(f.hit.rule);
    if (known?.kind === 'own') {
      known.current.selector = selector;
      this.refreshOwnRules(known.root);
      this.changed();
      return this.change(known);
    }
    if (!writable(f.hit.rule, f.root)) return { error: 'Rule is not editable' };
    const rec = known ?? this.pageRecord(f.root, f.hit, f.all);
    if (!this.setSelector(rec, selector)) return { error: 'Invalid selector' };
    this.settle(rec);
    return this.change(rec);
  }

  /** selectorText first; some engines ignore it, so fall back to replacing the rule in place. */
  private setSelector(rec: PageRecord, selector: string): boolean {
    const rule = rec.rule;
    try {
      rule.selectorText = selector;
    } catch {
      // read-only selectorText in some engines
    }
    if (rule.selectorText === rec.current.selector && selector !== rec.current.selector) {
      const parent = (rule.parentRule as CSSGroupingRule | null) ?? rule.parentStyleSheet;
      if (!parent) return false;
      const i = [...parent.cssRules].indexOf(rule);
      try {
        parent.insertRule(`${selector} { ${rule.style.cssText} }`, i);
      } catch {
        return false;
      }
      parent.deleteRule(i + 1);
      rec.rule = parent.cssRules[i] as CSSStyleRule;
    }
    rec.current.selector = rec.rule.selectorText;
    return true;
  }

  /** Drop records that ended up back where they started. */
  private settle(rec: PageRecord): void {
    if (
      rec.current.selector === rec.before.selector &&
      rec.current.declsText === rec.before.declsText
    )
      this.recs.delete(rec.recordId);
    this.changed();
  }

  // ---- own rules ----

  private ownStyle(root: Root, create: boolean): HTMLStyleElement | null {
    const found = root.querySelector(`#${CSS.escape(this.styleId)}`);
    if (found instanceof HTMLStyleElement) return found;
    if (!create) return null;
    const style = document.createElement('style');
    style.id = this.styleId;
    (root.nodeType === Node.DOCUMENT_NODE ? (root as Document).head : root).append(style);
    return style;
  }

  addRule(scopeRoot: Root, selector = '', wrappers: string[] = []): RuleChange | RuleError {
    const sel = selector.trim() || '.new-rule';
    if (!validSelector(sel)) return { error: 'Invalid selector' };
    const rec: OwnRecord = {
      kind: 'own',
      recordId: newId(),
      root: scopeRoot,
      scopeAddress: scopeAddressOf(scopeRoot),
      wrappers: [...wrappers],
      rule: null,
      current: { selector: sel, declsText: '' },
    };
    this.recs.set(rec.recordId, rec);
    this.refreshOwnRules(scopeRoot);
    this.changed();
    return this.change(rec);
  }

  /** Rewrites each own `<style>` from the records, then re-binds the rule objects. */
  refreshOwnRules(only?: Root): void {
    const roots = new Set<Root>();
    for (const r of this.recs.values()) if (r.kind === 'own') roots.add(r.root);
    if (only) roots.add(only);
    for (const root of roots) {
      if (only && root !== only) continue;
      const own = [...this.recs.values()].filter(
        (r): r is OwnRecord => r.kind === 'own' && r.root === root,
      );
      const style = this.ownStyle(root, own.length > 0);
      if (!style) continue;
      if (!own.length) {
        style.remove();
        continue;
      }
      style.textContent = own
        .map((r) =>
          r.wrappers.reduceRight(
            (inner, w) => `${w} { ${inner} }`,
            `${r.current.selector} { ${r.current.declsText} }`,
          ),
        )
        .join('\n');
      const rules = this.all(root).filter((k) => k.source === OWN_SOURCE);
      own.forEach((r, i) => (r.rule = rules[i]?.rule ?? null));
    }
  }

  // ---- inline style ----

  editInlineStyle(el: HTMLElement, declsText: string): RuleChange {
    let rec = [...this.recs.values()].find(
      (r): r is InlineRecord => r.kind === 'inline' && r.el === el,
    );
    if (!rec) {
      rec = {
        kind: 'inline',
        recordId: newId(),
        el,
        before: el.getAttribute('style'),
        current: '',
      };
      this.recs.set(rec.recordId, rec);
    }
    const text = tidy(declsText);
    if (text) el.setAttribute('style', text);
    else el.removeAttribute('style');
    rec.current = text;
    if ((rec.before ?? '') === (el.getAttribute('style') ?? '')) this.recs.delete(rec.recordId);
    this.changed();
    return this.change(rec);
  }

  // ---- reporting ----

  private change(r: Rec): RuleChange {
    if (r.kind === 'inline')
      return {
        recordId: r.recordId,
        address: null,
        source: INLINE_SOURCE,
        line: null,
        before: r.before ?? '',
        after: r.current,
        // the panel edited it by id, so the element carries one
        elementIds: [r.el.getAttribute(ID_ATTR(this.extId))].filter((id): id is string => !!id),
      };
    const block = (c: { selector: string; declsText: string }) =>
      `${c.selector} { ${c.declsText} }`;
    if (r.kind === 'own')
      return {
        recordId: r.recordId,
        address: null,
        source: OWN_SOURCE,
        line: null,
        before: '',
        after: block(r.current),
        elementIds: [],
        selector: r.current.selector,
        scopeAddress: r.scopeAddress,
      };
    return {
      recordId: r.recordId,
      address: r.origin,
      source: r.origin.stylesheet,
      line: lineOf(r.rule, r.before.selector),
      before: block(r.before),
      after: block(r.current),
      elementIds: [],
      selector: r.current.selector,
      scopeAddress: r.scopeAddress,
    };
  }

  flattened(): RuleChange[] {
    return [...this.recs.values()].map((r) => this.change(r));
  }

  /** Live inline-style edits: the element and its current `style` text. */
  inlineEdits(): { el: HTMLElement; declsText: string }[] {
    const out: { el: HTMLElement; declsText: string }[] = [];
    for (const r of this.recs.values())
      if (r.kind === 'inline') out.push({ el: r.el, declsText: r.current });
    return out;
  }

  hasChanges(): boolean {
    return this.recs.size > 0 || this.dormant.length > 0;
  }

  // ---- persistence (5.19, 5.08) ----

  serialize(): SerializedEdit[] {
    const out: SerializedEdit[] = [];
    for (const r of this.recs.values()) {
      if (r.kind === 'page')
        out.push({
          own: false,
          stylesheet: r.origin.stylesheet,
          scopeAddress: r.scopeAddress,
          wrappers: [...r.origin.wrappers],
          occ: r.origin.occ,
          originalSelector: r.before.selector,
          selector: r.current.selector,
          declsText: r.current.declsText,
        });
      else if (r.kind === 'own')
        out.push({
          own: true,
          recordId: r.recordId,
          wrappers: [...r.wrappers],
          scopePath: r.scopeAddress ? r.scopeAddress.split(' >>> ') : [],
          scopeAddress: r.scopeAddress,
          selector: r.current.selector,
          declsText: r.current.declsText,
        });
    }
    return [...out, ...this.dormant];
  }

  applySerialized(list: SerializedEdit[]): { applied: number; dormant: SerializedEdit[] } {
    const dormant: SerializedEdit[] = [];
    const touched = new Set<Root>();
    let applied = 0;
    for (const e of list) {
      const root = rootAt(e.scopeAddress);
      if (!root) {
        dormant.push(e);
        continue;
      }
      if (e.own) {
        if (this.recs.has(e.recordId)) continue;
        this.recs.set(e.recordId, {
          kind: 'own',
          recordId: e.recordId,
          root,
          scopeAddress: e.scopeAddress,
          wrappers: [...e.wrappers],
          rule: null,
          current: { selector: e.selector, declsText: e.declsText },
        });
        touched.add(root);
        applied++;
        continue;
      }
      const all = this.all(root);
      const hit = locate(
        {
          stylesheet: e.stylesheet,
          selector: e.originalSelector,
          wrappers: e.wrappers,
          occ: e.occ,
          scopeAddress: e.scopeAddress,
        },
        all,
      );
      if (!hit || !writable(hit.rule, root)) {
        dormant.push(e);
        continue;
      }
      const rec = this.recordFor(hit.rule) ?? this.pageRecord(root, hit, all);
      if (rec.kind !== 'page') continue;
      rec.rule.style.cssText = e.declsText;
      rec.current.declsText = tidy(rec.rule.style.cssText);
      if (e.selector !== rec.current.selector && validSelector(e.selector))
        this.setSelector(rec, e.selector);
      applied++;
    }
    for (const root of touched) this.refreshOwnRules(root);
    this.dormant.push(...dormant);
    if (applied) this.changed();
    return { applied, dormant };
  }

  // ---- revert ----

  revert(recordId: string): boolean {
    const r = this.recs.get(recordId);
    if (!r) return false;
    this.recs.delete(recordId);
    if (r.kind === 'inline') {
      if (r.before === null) r.el.removeAttribute('style');
      else r.el.setAttribute('style', r.before);
    } else if (r.kind === 'own') this.refreshOwnRules(r.root);
    else {
      if (r.rule.selectorText !== r.before.selector) this.setSelector(r, r.before.selector);
      r.rule.style.cssText = r.before.declsText;
    }
    this.changed();
    return true;
  }

  revertAll(): void {
    for (const id of [...this.recs.keys()]) this.revert(id);
    this.dormant = [];
    for (const root of [document, ...this.shadowRootsWithOwnStyle()])
      this.ownStyle(root, false)?.remove();
    this.changed();
  }

  private shadowRootsWithOwnStyle(): ShadowRoot[] {
    return [...document.querySelectorAll('*')].flatMap((el) =>
      el.shadowRoot?.querySelector(`#${CSS.escape(this.styleId)}`) ? [el.shadowRoot] : [],
    );
  }

  // ---- page stylesheet churn ----

  /** Re-finds page rules whose sheet went away and retries dormant edits. */
  reapplyAll(): void {
    const lost: SerializedEdit[] = [];
    for (const r of [...this.recs.values()]) {
      if (r.kind === 'own' && !r.root.contains(this.ownStyle(r.root, false))) {
        this.refreshOwnRules(r.root);
        continue;
      }
      if (r.kind !== 'page') continue;
      if (writable(r.rule, r.root)) continue;
      this.recs.delete(r.recordId);
      lost.push({
        own: false,
        stylesheet: r.origin.stylesheet,
        scopeAddress: r.scopeAddress,
        wrappers: r.origin.wrappers,
        occ: r.origin.occ,
        originalSelector: r.before.selector,
        selector: r.current.selector,
        declsText: r.current.declsText,
      });
    }
    const retry = [...lost, ...this.dormant];
    this.dormant = [];
    if (retry.length) this.applySerialized(retry);
  }

  /** While editing: `<head>` mutations and adopted sheet changes trigger reapplyAll. */
  watch(): void {
    if (this.observer) return;
    let queued = false;
    const kick = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        this.reapplyAll();
      });
    };
    this.observer = new MutationObserver((muts) => {
      const ownId = this.styleId;
      if (
        muts.every((m) =>
          [...m.addedNodes, ...m.removedNodes].every((n) => (n as Element).id === ownId),
        )
      )
        return;
      kick();
    });
    this.observer.observe(document.head, { childList: true });
    this.adopted.set(document, document.adoptedStyleSheets?.length ?? 0);
    this.poll = setInterval(() => {
      const n = document.adoptedStyleSheets?.length ?? 0;
      if (n !== this.adopted.get(document)) {
        this.adopted.set(document, n);
        kick();
      }
    }, 1000);
  }

  unwatch(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.poll) clearInterval(this.poll);
    this.poll = null;
  }
}
