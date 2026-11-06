/**
 * Edit commands (10.12, 5.28; legacy content.js:23532–23625, :22156–22460). Every edit goes
 * through the side panel's edit engine, so it joins undo / redo, shows in the panel's change
 * list and is saved per site like a manual edit (Q9 a). There is no "edit mode" to enter (5.28).
 */
import { mergeDecls, parseDecls, serializeDecls, type Decl } from '../../lib/edit/decls';
import { PROTECTED_TAGS } from '../../lib/edit/sanitize';
import type { EditResult, InsertPosition } from '../../lib/edit/types';
import type { McpInsertPosition, Styles } from '../../lib/mcp/protocol';
import { state } from '../core/state.svelte';
import { editHandlers } from '../edit/handlers';
import { ruleTracker } from '../edit/mode.svelte';
import { persistNow } from '../edit/persist';
import { elementId } from '../sidepanel/bridge.svelte';
import { rootOf } from '../sidepanel/rules';
import { selectElement } from '../tools/inspector';
import { elementOf, fail, type Commands } from './command';

const POSITIONS: Record<McpInsertPosition, InsertPosition> = {
  before: 'beforebegin',
  prepend: 'afterbegin',
  append: 'beforeend',
  after: 'afterend',
};
const sender = {} as never; // the edit handlers take the message sender last; unused there

const decls = (s: Styles): Decl[] =>
  Object.entries(s).map(([property, raw]) => {
    const imp = /\s*!\s*important\s*$/i.exec(raw);
    return {
      property: property.startsWith('--') ? property : property.toLowerCase(),
      value: imp ? raw.slice(0, imp.index).trim() : raw.trim(),
      important: !!imp,
    };
  });

/** EditResult → command result: the engine's error is the agent's error. */
function done(r: EditResult | undefined | Promise<EditResult>): unknown {
  const res = r as EditResult | undefined;
  if (!res?.ok) return fail(res?.error ?? 'Edit failed.');
  return { success: true, canUndo: res.canUndo, editCount: res.editCount };
}

/** An element the content edits may touch: not html / head / body (legacy Bg). */
function editable(id: string): Element {
  const el = elementOf(id, `Element ${id} not found.`);
  if (PROTECTED_TAGS.has(el.localName))
    return fail(`Cannot edit <${el.localName}>. Target a child element instead.`);
  return el;
}

/** Engine commands acting on the selection (duplicate / delete) act on `id` here. */
function onSelected(id: string, run: () => EditResult | Promise<EditResult>): unknown {
  const el = elementOf(id, `Element ${id} not found.`);
  if (state.selected !== el) selectElement(el);
  return done(run() as EditResult);
}

export const editCommands: Commands = {
  set_text_content({ elementId: id, text }) {
    editable(id);
    return done(editHandlers.set_text_content!(id, text, sender) as EditResult);
  },
  set_inner_html({ elementId: id, html }) {
    editable(id);
    return done(editHandlers.set_inner_html!(id, html, sender) as EditResult); // sanitized there
  },
  insert_html({ elementId: id, html, position }) {
    const el = elementOf(id, `Element ${id} not found.`);
    if (
      (position === 'before' || position === 'after') &&
      (PROTECTED_TAGS.has(el.localName) || !el.parentElement)
    )
      return fail(
        `Cannot insert before/after <${el.localName}>. Use prepend or append, or target a child element.`,
      );
    return done(editHandlers.insert_html!(id, POSITIONS[position], html, sender) as EditResult);
  },
  apply_styles({ elementId: id, ruleRef, styles, state: st, media, pseudo }) {
    if (st || media || pseudo)
      return fail(
        'state/media/pseudo are no longer supported by apply_styles. Update the Bo doi MCP server.',
      );
    if (ruleRef)
      return done(editHandlers.merge_rule_styles!(ruleRef, decls(styles), sender) as EditResult);
    const el = elementOf(id!, `Element ${id} not found.`);
    if (!(el instanceof HTMLElement)) return fail(`Cannot style <${el.localName}> inline.`);
    const merged = mergeDecls(parseDecls(el.getAttribute('style') ?? ''), decls(styles));
    return done(
      editHandlers.inline_style_edit!(elementId(el), serializeDecls(merged), sender) as EditResult,
    );
  },
  add_rule({ selector, wrappers, styles, elementId: id }) {
    const scope = id ? elementOf(id, `Element ${id} not found.`) : state.selected;
    const t = ruleTracker();
    const added = t.addRule(rootOf(scope ?? null), selector, wrappers);
    if ('error' in added) return fail(added.error);
    if (styles && added.address) {
      const r = t.editRule(added.address, serializeDecls(decls(styles)));
      if ('error' in r) return fail(r.error);
      return { success: true, changeId: r.recordId, ruleRef: r.address };
    }
    return { success: true, changeId: added.recordId, ruleRef: added.address };
  },
  set_rule_selector: ({ ruleRef, selector }) =>
    done(editHandlers.rule_selector_edit!(ruleRef, selector, sender) as EditResult),
  revert_css_change({ changeId }) {
    if (!ruleTracker().revert(changeId))
      return fail(`No CSS change with id ${changeId}. Call get_my_edits for the current ids.`);
    return { success: true };
  },
  async revert_all_edits() {
    const r = editHandlers.revert_all_edits!(sender) as EditResult;
    await persistNow(); // the site's saved edits go too
    return done(r);
  },
  set_element_classes: ({ elementId: id, classes }) => {
    elementOf(id, `Element ${id} not found.`);
    return done(editHandlers.set_element_classes!(id, classes, sender) as EditResult);
  },
  delete_element: ({ elementId: id }) =>
    onSelected(id, () => editHandlers.edit_delete!(sender) as EditResult),
  duplicate_element: ({ elementId: id }) =>
    onSelected(id, () => editHandlers.edit_duplicate!(sender) as EditResult),
};
