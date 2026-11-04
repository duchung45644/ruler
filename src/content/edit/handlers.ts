/** Edit commands on the typed content channel (port of Wg editor :21606, rule_editor :21940, page :23760–23868; 5.07, 5.17, 5.20, 5.21). */
import { mergeDecls, parseDecls, serializeDecls } from '../../lib/edit/decls';
import { locate } from '../../lib/edit/rule-address';
import { isSerializedEdit } from '../../lib/edit/serialize';
import type { EditResult, RuleChange } from '../../lib/edit/types';
import type { ElementDetails } from '../../lib/element/types';
import { sendToSidePanel, type ContentApi, type Handlers } from '../../lib/messaging';
import { requestPaint } from '../core/overlay';
import { onStop } from '../core/session';
import { state } from '../core/state.svelte';
import { elementById, sendElement, setEditHooks } from '../sidepanel/bridge.svelte';
import { rootOf, rulesOf } from '../sidepanel/rules';
import { selectElement } from '../tools/inspector';
import type { HtmlEditor } from './engine';
import {
  editor,
  editState,
  onEditChange,
  ruleTracker,
  setEditMode,
  stateForcer,
} from './mode.svelte';
import {
  buildPayload,
  cancelScheduledExtras,
  ghostProbe,
  scheduleExtras,
  unwatchMedia,
  watchMedia,
} from './payload';
import { schedulePersist } from './persist';
import { rootAt, type RuleError } from './rules';

const MAX_CLASSES = 2000;

const ok = (): EditResult => ({ ...editState(), ok: true });
const fail = (error: string): EditResult => ({ ...editState(), ok: false, error });
const off = () => fail('Edit mode is off');

let queued = false;

/**
 * Port of notifyChangesInvalidated (:27608): one refresh_changes + edit_state per microtask,
 * however many records a command touched (5.07).
 */
export function notifyChanged(): void {
  requestPaint(); // the selection frame follows a moved / hidden element
  if (queued) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    void sendToSidePanel('refresh_changes').catch(() => {});
    void sendToSidePanel('edit_state', editState()).catch(() => {});
  });
}

function withEngine(run: (e: HtmlEditor) => EditResult | null): EditResult {
  const e = editor();
  return e ? (run(e) ?? ok()) : off();
}

function onElement(id: string, run: (e: HtmlEditor, el: Element) => EditResult): EditResult {
  return withEngine((e) => {
    const el = elementById(id);
    return el?.isConnected ? run(e, el) : fail('Element not found');
  });
}

const fromRule = (r: RuleChange | RuleError): EditResult => ('error' in r ? fail(r.error) : ok());

/** Every class name used on the page, sorted, capped (5.17 class autocomplete). */
export function pageClasses(): string[] {
  const out = new Set<string>();
  for (const el of document.querySelectorAll('[class]')) {
    for (const c of el.classList) out.add(c);
    if (out.size >= MAX_CLASSES) break;
  }
  return [...out].sort().slice(0, MAX_CLASSES);
}

/** Selection details in edit mode: the rule payload, inherited rules later (6.49, 2.27). */
function editDetails(el: Element): ElementDetails['edit'] {
  if (!state.editOn) return undefined;
  const payload = buildPayload(el, stateForcer());
  scheduleExtras(el, payload.paySeq);
  watchMedia(payload.rules);
  return { payload, editCount: editor()?.changeCount(el) ?? 0 };
}

function clearDetails(): void {
  cancelScheduledExtras();
  unwatchMedia();
}

/** Wire the edit side of the bridge for one session. */
export function initEditHandlers(): void {
  setEditHooks({ details: editDetails, clear: clearDetails });
  onStop(() => setEditHooks(null));
  onStop(onEditChange(notifyChanged));
}

export const editHandlers: Handlers<ContentApi> = {
  edit_undo: () => withEngine((e) => e.undo()),
  edit_redo: () => withEngine((e) => e.redo()),
  edit_copy: () => withEngine((e) => e.copy()),
  edit_cut: () => withEngine((e) => e.cut()),
  edit_paste: () => withEngine((e) => e.paste()),
  edit_duplicate: () => withEngine((e) => e.duplicate()),
  edit_delete: () => withEngine((e) => e.delete()),
  get_history_state: () => ok(),
  set_element_styles: (id, decls) => onElement(id, (e, el) => e.setStyles(el, decls)),
  set_element_classes: (id, cls) => onElement(id, (e, el) => e.setClasses(el, cls)),
  get_page_classes: () => pageClasses(),
  set_text_content: (id, text) => onElement(id, (e, el) => e.setText(el, text)),
  set_inner_html: (id, html) => onElement(id, (e, el) => e.setInnerHtml(el, html)),
  insert_html: (id, pos, html) => onElement(id, (e, el) => e.insertHtml(el, pos, html)),
  get_rule_edit_payload: () =>
    state.selected ? buildPayload(state.selected, stateForcer()) : null,
  cascade_ghost_probe: () => (state.selected ? ghostProbe(state.selected) : []),
  rule_edit: (addr, text) => fromRule(ruleTracker().editRule(addr, text)),
  inline_style_edit(id, text) {
    const el = elementById(id);
    if (!(el instanceof HTMLElement)) return fail('Element not found');
    return fromRule(ruleTracker().editInlineStyle(el, text));
  },
  merge_rule_styles(addr, decls) {
    const root = rootAt(addr.scopeAddress);
    const hit = root && locate(addr, rulesOf(root).rules);
    if (!hit) return fail('Rule not found');
    const merged = mergeDecls(parseDecls(hit.rule.style.cssText), decls);
    return fromRule(ruleTracker().editRule(addr, serializeDecls(merged)));
  },
  rule_selector_edit: (addr, sel) => fromRule(ruleTracker().editSelector(addr, sel)),
  rule_add(sel) {
    const root = state.selected ? rootOf(state.selected) : document;
    // called without a selector, the sender lands in this slot
    return fromRule(ruleTracker().addRule(root, typeof sel === 'string' ? sel : undefined));
  },
  get_rule_changes: () => ruleTracker().flattened(),
  get_all_flattened_changes: () => ({
    rules: ruleTracker().flattened(),
    html: editor()?.htmlChanges() ?? [],
  }),
  get_html_changes: () => editor()?.htmlChanges() ?? [],
  revert_rule_change: (recordId) =>
    ruleTracker().revert(recordId) ? ok() : fail('Change not found'),
  revert_all_rule_changes() {
    ruleTracker().revertAll();
    return ok();
  },
  revert_all_edits() {
    ruleTracker().revertAll();
    editor()?.clearAll();
    return ok();
  },
  clear_elements_by_ids: (ids, scope) => withEngine((e) => e.clearByIds(ids, scope)),
  clear_changes: () => withEngine((e) => e.clearAll()),
  force_element_state(s) {
    const el = state.selected;
    if (!el) return fail('No element selected');
    stateForcer().forceState(el, s);
    sendElement(el);
    return ok();
  },
  /** Responsive view hand-off (phase 6 calls it); storage-grade validation on the way in. */
  apply_pending_rule_edits(edits) {
    const list = Array.isArray(edits) ? edits.filter(isSerializedEdit) : [];
    ruleTracker().applySerialized(list);
    schedulePersist();
    return ok();
  },
  async set_edit_mode(on) {
    await setEditMode(on);
    return ok();
  },
  select_edited_element(id) {
    const el = elementById(id);
    if (!el?.isConnected) return false;
    selectElement(el, { scroll: true });
    return true;
  },
};
