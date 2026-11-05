export type FrameId = number;

/** Plan cap: legacy kept the shared log unbounded. */
export const HISTORY_MAX = 50;

/** One shared edit step: the frames that recorded an op in it (legacy editOpLog entries are Sets). */
export type HistoryEntry = readonly FrameId[];

export interface SharedHistory {
  undo: readonly HistoryEntry[];
  redo: readonly HistoryEntry[];
}

export const EMPTY_HISTORY: SharedHistory = { undo: [], redo: [] };

/** Legacy commitEditOp: push a step, clear redo; oldest step dropped past HISTORY_MAX. */
export function recordStep(h: SharedHistory, frames: Iterable<FrameId>): SharedHistory {
  const entry = [...new Set(frames)];
  if (!entry.length) return h;
  return { undo: [...h.undo, entry].slice(-HISTORY_MAX), redo: [] };
}

export interface StepResult {
  /** Frames to send editor_undo / editor_redo to; empty when there is nothing to do. */
  frames: FrameId[];
  history: SharedHistory;
}

/**
 * Legacy stepResponsiveHistory: pop the newest step whose frames still exist (steps whose frames
 * are all gone are discarded), move it to the other stack and return the live frames.
 */
function step(h: SharedHistory, dir: 'undo' | 'redo', alive: readonly FrameId[]): StepResult {
  const from = [...(dir === 'undo' ? h.undo : h.redo)];
  const to = [...(dir === 'undo' ? h.redo : h.undo)];
  while (from.length) {
    const entry = from.pop()!;
    const frames = entry.filter((f) => alive.includes(f));
    if (!frames.length) continue;
    to.push(entry);
    const history = dir === 'undo' ? { undo: from, redo: to } : { undo: to, redo: from };
    return { frames, history };
  }
  return { frames: [], history: dir === 'undo' ? { undo: [], redo: to } : { undo: to, redo: [] } };
}

export function undoTarget(h: SharedHistory, alive: readonly FrameId[]): StepResult {
  return step(h, 'undo', alive);
}

export function redoTarget(h: SharedHistory, alive: readonly FrameId[]): StepResult {
  return step(h, 'redo', alive);
}

/** Legacy forgetFrameHistory: drop a frame from every step; empty steps vanish. */
export function forgetFrame(h: SharedHistory, frame: FrameId): SharedHistory {
  const strip = (list: readonly HistoryEntry[]) =>
    list.map((e) => e.filter((f) => f !== frame)).filter((e) => e.length > 0);
  return { undo: strip(h.undo), redo: strip(h.redo) };
}
