import type { EditResult } from '../../lib/edit/types';
import { addKeyHandler } from '../core/keys';
import { items } from '../core/registry.svelte';
import { onStop, sessionSignal } from '../core/session';
import { state } from '../core/state.svelte';
import type { HtmlEditor } from './engine';
import {
  editor,
  onEditChange,
  onEditExit,
  ruleTracker,
  setEditMode,
  stopEditMode,
} from './mode.svelte';
import { editHandlers, initEditHandlers, resendSelection } from './handlers';
import { persistNow, restorePersisted, schedulePersist } from './persist';

export { editor, ruleTracker, setEditMode } from './mode.svelte';
export { editHandlers };

type Command = 'copy' | 'cut' | 'paste' | 'duplicate' | 'delete' | 'undo' | 'redo';

export function runEditCommand(cmd: Command): EditResult | null {
  const e: HtmlEditor | null = editor();
  if (!e) return null;
  const r = e[cmd]();
  return cmd === 'undo' || cmd === 'redo' ? resendSelection(r) : r;
}

const isMac = /mac/i.test(navigator.platform);
/** ⌘ on mac, Ctrl elsewhere; never both. */
const mod = (e: KeyboardEvent) => (isMac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey);

/** Port of the edit branch of onDocumentKeydown (:47311; 5.03). routeKey already skips typing. */
function onKey(e: KeyboardEvent): boolean {
  if (!state.editOn || !editor() || e.altKey) return false;
  const k = e.key.toLowerCase();
  if (mod(e)) {
    if (k === 'z') return !!runEditCommand(e.shiftKey ? 'redo' : 'undo');
    if (k === 'y' && !e.shiftKey) return !!runEditCommand('redo');
    if (!state.selected || e.shiftKey) return false;
    // a text selection keeps the browser's own copy (D9)
    if ((k === 'c' || k === 'x') && !getSelection()?.isCollapsed) return false;
    const cmd = ({ c: 'copy', x: 'cut', v: 'paste', d: 'duplicate' } as const)[k as 'c'];
    return !!cmd && !!runEditCommand(cmd);
  }
  if ((e.key === 'Backspace' || e.key === 'Delete') && !e.ctrlKey && !e.metaKey && state.selected)
    return !!runEditCommand('delete');
  return false;
}

let inspectWrapped = false;

/** Inspect/edit switch and edit keys; the edit buttons live in the panel's Edit tab (1.20, 1.44, 5.02–5.04). Called once per session. */
export function initEdit(): void {
  // one inspect button: while editing, it leaves edit mode and inspects
  const inspect = items.find((i) => i.id === 'inspect');
  if (inspect && !inspectWrapped) {
    inspectWrapped = true; // items outlive sessions; initEdit runs per session
    const toggle = inspect.run;
    inspect.run = () => {
      if (!state.editOn) return toggle();
      void setEditMode(false);
      if (!state.inspectOn) toggle();
    };
    inspect.isActive = () => state.inspectOn && !state.editOn;
  }
  onStop(addKeyHandler(onKey));
  onStop(stopEditMode);
  initEditHandlers();

  const signal = sessionSignal();
  onStop(onEditChange(schedulePersist));
  onStop(onEditExit(() => void persistNow()));
  window.addEventListener('pagehide', () => void persistNow(), { signal });
  void restorePersisted(ruleTracker()).then((stop) => (signal.aborted ? stop() : onStop(stop)));
}
