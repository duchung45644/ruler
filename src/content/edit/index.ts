import ClipboardPaste from '@lucide/svelte/icons/clipboard-paste';
import Copy from '@lucide/svelte/icons/copy';
import CopyPlus from '@lucide/svelte/icons/copy-plus';
import MousePointer2 from '@lucide/svelte/icons/mouse-pointer-2';
import Pencil from '@lucide/svelte/icons/pencil';
import Redo2 from '@lucide/svelte/icons/redo-2';
import Scissors from '@lucide/svelte/icons/scissors';
import Trash from '@lucide/svelte/icons/trash';
import Type from '@lucide/svelte/icons/type';
import Undo2 from '@lucide/svelte/icons/undo-2';
import type { EditResult } from '../../lib/edit/types';
import { addKeyHandler } from '../core/keys';
import { items, registerItem, type MessageKey } from '../core/registry.svelte';
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
  toggleTextEdit,
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

const needsSelection = () => !state.selected;

function editItem(
  id: string,
  icon: typeof Copy,
  label: MessageKey,
  cmd: Command,
  isDisabled: () => boolean,
): void {
  registerItem({ id, icon, label, group: 'edit', run: () => runEditCommand(cmd), isDisabled });
}

/** Mode switch, edit dock group and edit keys (1.20, 1.44, 5.02–5.04). Called once per session. */
export function initEdit(): void {
  registerItem({
    id: 'inspectMode',
    icon: MousePointer2,
    label: 'dock.inspectMode',
    group: 'mode',
    // choosing Inspect means inspecting: leaving edit mode restores the pre-edit inspect state,
    // which is off when the user went straight to Edit, so turn it on like the inspect button does
    run: () => {
      void setEditMode(false);
      if (!state.inspectOn) items.find((i) => i.id === 'inspect')?.run();
    },
    isActive: () => !state.editOn,
  });
  registerItem({
    id: 'editMode',
    icon: Pencil,
    label: 'dock.editMode',
    group: 'mode',
    run: () => void setEditMode(true),
    isActive: () => state.editOn,
  });
  registerItem({
    id: 'editText',
    icon: Type,
    label: 'dock.editText',
    group: 'edit',
    run: toggleTextEdit,
    isActive: () => state.textEditOn,
  });
  editItem('editCopy', Copy, 'dock.copy', 'copy', needsSelection);
  editItem('editCut', Scissors, 'dock.cut', 'cut', needsSelection);
  editItem(
    'editPaste',
    ClipboardPaste,
    'dock.paste',
    'paste',
    () => !state.selected || !state.editState.hasClipboard,
  );
  editItem('editDuplicate', CopyPlus, 'dock.duplicate', 'duplicate', needsSelection);
  editItem('editDelete', Trash, 'dock.delete', 'delete', needsSelection);
  editItem('editUndo', Undo2, 'dock.undo', 'undo', () => !state.editState.canUndo);
  editItem('editRedo', Redo2, 'dock.redo', 'redo', () => !state.editState.canRedo);
  onStop(addKeyHandler(onKey));
  onStop(stopEditMode);
  initEditHandlers();

  const signal = sessionSignal();
  onStop(onEditChange(schedulePersist));
  onStop(onEditExit(() => void persistNow()));
  window.addEventListener('pagehide', () => void persistNow(), { signal });
  void restorePersisted(ruleTracker()).then((stop) => (signal.aborted ? stop() : onStop(stop)));
}
