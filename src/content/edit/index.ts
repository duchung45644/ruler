import type { EditResult } from '../../lib/edit/types';
import { addKeyHandler } from '../core/keys';
import { onStop, sessionSignal } from '../core/session';
import { state } from '../core/state.svelte';
import type { HtmlEditor } from './engine';
import {
  editor,
  getUndoRoute,
  onEditChange,
  onEditExit,
  ruleTracker,
  setEditMode,
  stepHistory,
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
  const r = cmd === 'undo' || cmd === 'redo' ? stepHistory(cmd)! : e[cmd]();
  return cmd === 'undo' || cmd === 'redo' ? resendSelection(r) : r;
}

const isMac = /mac/i.test(navigator.platform);
/** ⌘ on mac, Ctrl elsewhere; never both. */
const mod = (e: KeyboardEvent) => (isMac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey);

/** Port of the edit branch of onDocumentKeydown (:47311; 5.03). routeKey already skips typing. */
function onKey(e: KeyboardEvent): boolean {
  const route = getUndoRoute();
  if (route && mod(e) && !e.altKey) {
    const k = e.key.toLowerCase();
    if (k === 'z') return route(e.shiftKey);
    if (k === 'y' && !e.shiftKey) return route(true);
  }
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

/** Edit keys and the edit engine (editing is always on in a session; buttons live in the panel). */
export function initEdit(): void {
  void setEditMode(true);
  onStop(addKeyHandler(onKey));
  onStop(stopEditMode);
  initEditHandlers();

  const signal = sessionSignal();
  onStop(onEditChange(schedulePersist));
  onStop(onEditExit(() => void persistNow()));
  window.addEventListener('pagehide', () => void persistNow(), { signal });
  void restorePersisted(ruleTracker()).then((stop) => (signal.aborted ? stop() : onStop(stop)));
}
