import type { HtmlChange } from '../../../lib/edit/changes';
import {
  EMPTY_EDIT_STATE,
  type EditableRule,
  type EditResult,
  type EditState,
  type RuleChange,
  type RulePayload,
} from '../../../lib/edit/types';
import type { ElementDetails } from '../../../lib/element/types';
import { sendToFrame, type ContentApi } from '../../../lib/messaging';
import { panel, toPage } from '../store.svelte';

export interface Changes {
  rules: RuleChange[];
  html: HtmlChange[];
}

export const edit = $state({
  payload: null as RulePayload | null,
  inherited: [] as EditableRule[],
  /** `@media …` wrapper → whether it holds now (media_activity overrides the payload's view). */
  mediaActive: {} as Record<string, boolean>,
  editState: { ...EMPTY_EDIT_STATE } as EditState,
  classes: '',
  /** null: not loaded, or stale since the last refresh_changes / page_updated. */
  changes: null as Changes | null,
});

/** Kept even while the inspect view is on screen, so the edit view draws it once it mounts (6.50). */
export function takeEditDetails(d: ElementDetails): void {
  edit.payload = d.edit?.payload ?? null;
  edit.classes = d.edit?.classes ?? '';
  edit.inherited = [];
  edit.mediaActive = {};
}

export function takeExtras(paySeq: number, inherited: EditableRule[]): void {
  if (edit.payload?.paySeq !== paySeq) return;
  edit.inherited = Array.isArray(inherited) ? inherited : [];
}

export function clearEdit(): void {
  edit.payload = null;
  edit.inherited = [];
  edit.classes = '';
}

const isResult = (r: unknown): r is EditResult =>
  !!r && typeof r === 'object' && 'canUndo' in r && 'editCount' in r;

export function takeState(r: EditState): void {
  edit.editState = {
    canUndo: r.canUndo,
    canRedo: r.canRedo,
    editCount: r.editCount,
    hasClipboard: r.hasClipboard,
  };
}

type EditCommand = {
  [K in keyof ContentApi]: ReturnType<ContentApi[K]> extends EditResult ? K : never;
}[keyof ContentApi];

/** Every edit command replies with its EditState, so the header never asks again (Review Focus 6). */
export async function command<K extends EditCommand>(
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<EditResult | undefined> {
  const r = (await toPage(type, ...data)) as unknown;
  if (isResult(r)) takeState(r);
  return isResult(r) ? r : undefined;
}

/** Like toPage but rejects when the tab cannot be reached: the Changes tab says so (6.46). */
export function strict<K extends keyof ContentApi>(
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]>> {
  if (panel.tabId === null) return Promise.reject(new Error('No tab'));
  return sendToFrame(panel.tabId, 0, type, ...data);
}

export async function loadChanges(): Promise<void> {
  const r = await toPage('get_all_flattened_changes');
  edit.changes = {
    rules: Array.isArray(r?.rules) ? r.rules : [],
    html: Array.isArray(r?.html) ? r.html : [],
  };
}

/** 6.39: the Changes tab reloads at once; otherwise the list is fetched when it opens. */
export function changesInvalidated(): void {
  if (panel.selectedTab === 'changes') void loadChanges();
  else edit.changes = null;
}

/** After a selector edit, an added rule or a class change the addresses move: read them again. */
export async function refreshPayload(): Promise<void> {
  const r = await toPage('get_rule_edit_payload');
  if (r && Array.isArray(r.rules)) edit.payload = r;
}
