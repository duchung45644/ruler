/** CSS edits in responsive view: carry in, sync across frames, shared undo, carry back (5.25–5.27, 8.08, 8.20). */
import { isSerializedEdit, type SerializedEdit } from '../../lib/edit/serialize';
import type { EditState } from '../../lib/edit/types';
import type { FrameApi, InlineStyleEdit, ShellApi } from '../../lib/responsive/channel';
import {
  isElementLocator,
  locateElement,
  locatorKey,
  resolveLocator,
} from '../../lib/responsive/element-locator';
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
/** Inline style text last reported (or applied) per element, to send only what changed. */
let inlineSeen = new Map<HTMLElement, string>();

const inlineNow = (): Map<HTMLElement, string> =>
  new Map(
    ruleTracker()
      .inlineEdits()
      .map((e) => [e.el, e.declsText]),
  );

const cleanInline = (list: unknown): InlineStyleEdit[] =>
  Array.isArray(list)
    ? list.filter(
        (e: InlineStyleEdit | null): e is InlineStyleEdit =>
          !!e && isElementLocator(e.locator) && typeof e.declsText === 'string',
      )
    : [];

/** Apply inline edits (from another frame, or on exit to the page); unresolved locators are skipped. */
export function applyInlineStyles(list: unknown, doc: Document = document): void {
  const t = ruleTracker();
  for (const e of cleanInline(list)) {
    const el = resolveLocator(e.locator, doc);
    if (!(el instanceof HTMLElement)) continue;
    if ((el.getAttribute('style') ?? '') === e.declsText) continue;
    t.editInlineStyle(el, e.declsText);
  }
}

/** Frame side: apply the shell's inline edits without echoing them back. */
export function applyFrameInlineStyles(list: unknown): void {
  applying = true;
  try {
    applyInlineStyles(list);
  } finally {
    applying = false;
  }
  inlineSeen = inlineNow();
}

/** Inline edits that changed since the last report; a reverted one sends the restored style. */
function inlineChanges(): InlineStyleEdit[] {
  const now = inlineNow();
  const out: InlineStyleEdit[] = [];
  const push = (el: HTMLElement, declsText: string) => {
    const locator = locateElement(el);
    if (locator) out.push({ locator, declsText });
  };
  for (const [el, text] of now) if (inlineSeen.get(el) !== text) push(el, text);
  for (const el of inlineSeen.keys())
    if (!now.has(el) && el.isConnected) push(el, el.getAttribute('style') ?? '');
  inlineSeen = now;
  return out;
}

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
  inlineSeen = inlineNow();
  const off = onEditChange(() => {
    if (applying) return;
    for (const e of inlineChanges()) ch.send('inline_style_changed', e);
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
  /** Inline style edits by element locator, last write wins: ready_ack and exit. */
  readonly inline: InlineStyleEdit[];
  inlineStyleChanged(from: FrameId, e: unknown): void;
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
  const inline = new Map<string, InlineStyleEdit>();

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
    get inline() {
      return [...inline.values()];
    },
    inlineStyleChanged(from, e) {
      const [ok] = cleanInline([e]);
      if (!ok) return;
      const entry = { locator: ok.locator, declsText: ok.declsText };
      inline.set(locatorKey(entry.locator), entry);
      for (const [id, ch] of ready()) if (id !== from) ch.send('apply_inline_styles', [entry]);
    },
    reset(edits) {
      last = edits;
      history = EMPTY_HISTORY;
      pending = new Set();
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      html.clear();
      inline.clear();
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
