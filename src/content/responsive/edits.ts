/** CSS edits in responsive view: carry in, sync across frames, shared undo, carry back (5.25–5.27, 8.08, 8.20). */
import { isSerializedEdit, type SerializedEdit } from '../../lib/edit/serialize';
import type { EditState } from '../../lib/edit/types';
import type { FrameApi, ShellApi } from '../../lib/responsive/channel';
import {
  EMPTY_HISTORY,
  forgetFrame,
  recordStep,
  redoTarget,
  undoTarget,
  type FrameId,
  type SharedHistory,
} from '../../lib/responsive/history-agg';
import {
  editState,
  editor,
  historyStepping,
  onEditChange,
  ruleTracker,
  setUndoRoute,
  stepHistory,
} from '../edit/mode.svelte';
import type { Channel } from './bridge';

/** Ops arriving this close together form one shared step (legacy batch window). */
export const OP_BATCH_MS = 120;

// ---------------------------------------------------------------- frame side

let applying = false;
let lastSentJson = '[]';

const clean = (edits: unknown): SerializedEdit[] =>
  Array.isArray(edits) ? edits.filter(isSerializedEdit) : [];

/** Replace this frame's CSS edits with the shell's list; idempotent and never echoed back. */
export function applyFrameRuleEdits(edits: unknown): void {
  const list = clean(edits);
  const json = JSON.stringify(list);
  const t = ruleTracker();
  if (JSON.stringify(t.serialize()) === json) {
    lastSentJson = json;
    return;
  }
  applying = true;
  try {
    t.revertAll();
    t.applySerialized(list);
  } finally {
    applying = false;
  }
  lastSentJson = JSON.stringify(t.serialize());
}

/** Undo / redo asked by the shell (shared history); returns the new state. */
export function frameStep(dir: 'undo' | 'redo'): EditState {
  stepHistory(dir);
  return editState();
}

const frameState = () => ({ ...editState(), htmlEdits: editor()?.htmlChanges().length ?? 0 });

/** Report rule edits, ops and edit state to the shell; route undo keys to it. */
export function startFrameEdits(ch: Channel<ShellApi>, signal: AbortSignal): void {
  lastSentJson = JSON.stringify(ruleTracker().serialize());
  const off = onEditChange(() => {
    if (applying) return;
    const json = JSON.stringify(ruleTracker().serialize());
    const ruleChanged = json !== lastSentJson;
    if (ruleChanged) {
      lastSentJson = json;
      ch.send('rule_edits_changed', JSON.parse(json) as SerializedEdit[]);
    } else if (!historyStepping()) ch.send('editor_op_recorded');
    ch.send('frame_edit_state', frameState());
  });
  setUndoRoute((redo) => {
    ch.send('edit_history_key', redo);
    return true;
  });
  signal.addEventListener(
    'abort',
    () => {
      off();
      setUndoRoute(null);
    },
    { once: true },
  );
}

// ---------------------------------------------------------------- shell side

export interface ShellEdits {
  /** Newest CSS edits: sent on ready_ack, the fallback on exit. */
  readonly last: SerializedEdit[];
  reset(edits: SerializedEdit[]): void;
  ruleEditsChanged(from: FrameId, edits: unknown): void;
  opRecorded(from: FrameId): void;
  frameState(from: FrameId, s: unknown): void;
  /** Ctrl+Z / Ctrl+Shift+Z: step the shared history in the frames that made that step. */
  step(redo: boolean): Promise<void>;
  forget(id: FrameId): void;
  /** A frame holds HTML edits that exit cannot carry back (8.08). */
  hasUncarryable(): boolean;
  readonly history: SharedHistory;
}

export function createShellEdits(ready: () => [FrameId, Channel<FrameApi>][]): ShellEdits {
  let last: SerializedEdit[] = [];
  let history: SharedHistory = EMPTY_HISTORY;
  let pending = new Set<FrameId>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const html = new Map<FrameId, number>();

  const flush = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    history = recordStep(history, pending);
    pending = new Set();
  };

  return {
    get last() {
      return last;
    },
    get history() {
      return history;
    },
    reset(edits) {
      last = edits;
      history = EMPTY_HISTORY;
      pending = new Set();
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      html.clear();
    },
    ruleEditsChanged(from, edits) {
      if (!Array.isArray(edits)) return;
      last = clean(edits);
      for (const [id, ch] of ready()) if (id !== from) ch.send('apply_rule_edits', last);
    },
    opRecorded(from) {
      pending.add(from);
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(flush, OP_BATCH_MS);
    },
    frameState(from, s) {
      const n = Number((s as { htmlEdits?: unknown } | null)?.htmlEdits);
      html.set(from, Number.isFinite(n) ? n : 0);
    },
    async step(redo) {
      if (pending.size) flush();
      const chans = new Map(ready());
      const r = (redo ? redoTarget : undoTarget)(history, [...chans.keys()]);
      history = r.history;
      await Promise.all(
        r.frames.map((id) =>
          chans
            .get(id)
            ?.call(redo ? 'edit_redo' : 'edit_undo')
            .catch(() => {}),
        ),
      );
    },
    forget(id) {
      pending.delete(id);
      html.delete(id);
      history = forgetFrame(history, id);
    },
    hasUncarryable: () => [...html.values()].some((n) => n > 0),
  };
}
