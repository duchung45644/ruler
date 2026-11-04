/** Edit mode on the page (port of setEditMode :34709, updateEditModeUiOnly :34774, ensureEditorEngine :34806; 5.05). */
import { browser } from '#imports';
import { EMPTY_EDIT_STATE, type EditState } from '../../lib/edit/types';
import { sendToBackground, sendToSidePanel } from '../../lib/messaging';
import { getSettings } from '../../lib/settings';
import { requestPaint } from '../core/overlay';
import { state } from '../core/state.svelte';
import { elementIdMap, sendElement } from '../sidepanel/bridge.svelte';
import { clearFind } from '../tools/find';
import { selectElement } from '../tools/inspector';
import { clearPins } from '../tools/inspector/pins.svelte';
import { setXray } from '../tools/xray';
import { HtmlEditor } from './engine';
import { cancelScheduledExtras, unwatchMedia } from './payload';
import { RuleTracker } from './rules';
import { StateForcer } from './states';
import { setTextEdit } from './text';

export const isOwn = (el: Element): boolean => el.localName === 'bo-doi-ui';

let engine: HtmlEditor | null = null;
let tracker: RuleTracker | null = null;
let forcer: StateForcer | null = null;
/** Inspect state before edit mode forced it on (edit mode selects through the inspector). */
let inspectBefore = false;
const changeListeners: (() => void)[] = [];
const exitListeners: (() => void)[] = [];

/** HTML engine; only alive in edit mode (its history dies on exit, 5.05). */
export const editor = (): HtmlEditor | null => engine;

/** Rule tracker: one per page, outlives edit mode so CSS edits stay applied. */
export function ruleTracker(): RuleTracker {
  return (tracker ??= new RuleTracker(browser.runtime.id, changed));
}

export function stateForcer(): StateForcer {
  return (forcer ??= new StateForcer(browser.runtime.id));
}

/** Any HTML or CSS edit: persist, panel refresh (Tasks 8, 9). Returns the unsubscribe fn. */
export function onEditChange(fn: () => void): () => void {
  changeListeners.push(fn);
  return () => void changeListeners.splice(changeListeners.indexOf(fn) >>> 0, 1);
}

/** Leaving edit mode or stopping the session: flush what must not wait (the save timer). */
export function onEditExit(fn: () => void): () => void {
  exitListeners.push(fn);
  return () => void exitListeners.splice(exitListeners.indexOf(fn) >>> 0, 1);
}

export function editState(): EditState {
  const s = engine?.historyState() ?? { ...EMPTY_EDIT_STATE };
  return { ...s, editCount: s.editCount + (tracker?.flattened().length ?? 0) };
}

function changed(): void {
  state.editState = editState();
  for (const fn of changeListeners) fn();
}

function ensureEngine(): HtmlEditor {
  return (engine ??= new HtmlEditor({
    extId: browser.runtime.id,
    ids: elementIdMap(),
    isOwn,
    selected: () => state.selected,
    select: (el) => {
      if (el) selectElement(el);
      else state.selected = null;
    },
    onChange: changed,
  }));
}

function teardown(): void {
  for (const fn of exitListeners) fn();
  engine?.dispose();
  engine = null;
  forcer?.clear();
  cancelScheduledExtras();
  unwatchMedia();
  tracker?.unwatch();
}

export function setEditMode(on: boolean): Promise<void> {
  if (state.editOn === on) return Promise.resolve();
  // first, inside the click: sidePanel.open needs the user gesture
  const opened = on ? sendToBackground('open_side_panel').catch(() => undefined) : null;
  setTextEdit(false, engine, isOwn);
  state.editOn = on;
  if (on) {
    inspectBefore = state.inspectOn;
    state.inspectOn = true;
    clearPins();
    setXray(false);
    state.popover = null;
    clearFind();
    ensureEngine();
    ruleTracker().watch();
  } else {
    teardown();
    state.inspectOn = inspectBefore;
    if (!inspectBefore) state.hovered = null;
    void getSettings().then((s) => {
      if (s.xrayModeIsOn && !state.editOn && state.active) setXray(true);
    });
  }
  state.editState = editState();
  requestPaint();
  return (async () => {
    await opened;
    await sendToSidePanel('set_mode', on ? 'edit' : 'inspect').catch(() => {});
    if (state.selected) sendElement(state.selected);
  })();
}

export function toggleTextEdit(): void {
  if (!state.editOn) return;
  setTextEdit(!state.textEditOn, engine, isOwn);
}

/** Session stop: leave edit mode quietly; the tracker and its `<style>` stay (CSS edits persist). */
export function stopEditMode(): void {
  if (state.editOn) {
    setTextEdit(false, engine, isOwn);
    teardown();
  }
  state.editOn = false;
  state.textEditOn = false;
  state.editState = { ...EMPTY_EDIT_STATE };
}
