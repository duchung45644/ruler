import { describe, expect, it } from 'vitest';
import {
  EMPTY_HISTORY,
  HISTORY_MAX,
  forgetFrame,
  recordStep,
  redoTarget,
  undoTarget,
} from './history-agg';

describe('history-agg', () => {
  it('recordStep dedupes, clears redo, caps at 50', () => {
    let h = recordStep(EMPTY_HISTORY, [1, 1, 2]);
    expect(h.undo).toEqual([[1, 2]]);
    expect(recordStep(h, [])).toBe(h);
    h = { ...h, redo: [[3]] };
    expect(recordStep(h, [3]).redo).toEqual([]);
    for (let i = 0; i < 60; i++) h = recordStep(h, [i]);
    expect(h.undo).toHaveLength(HISTORY_MAX);
    expect(h.undo[0]).toEqual([10]);
  });

  it('undoTarget / redoTarget move steps and skip dead frames', () => {
    const h = recordStep(recordStep(recordStep(EMPTY_HISTORY, [1]), [2]), [3, 1]);
    const u1 = undoTarget(h, [1, 2]);
    expect(u1.frames).toEqual([1]);
    expect(u1.history.redo).toEqual([[3, 1]]);
    const gone = undoTarget(recordStep(h, [9]), [1, 2]);
    expect(gone.frames).toEqual([1]);
    expect(gone.history.undo).toEqual([[1], [2]]);
    const r = redoTarget(u1.history, [1, 2]);
    expect(r.frames).toEqual([1]);
    expect(r.history).toEqual(h);
    expect(undoTarget(EMPTY_HISTORY, [1]).frames).toEqual([]);
    expect(redoTarget(h, [1]).frames).toEqual([]);
    expect(undoTarget(h, []).history.undo).toEqual([]);
  });

  it('forgetFrame removes a frame and empty steps', () => {
    const h = { undo: [[1], [1, 2]], redo: [[1]] };
    expect(forgetFrame(h, 1)).toEqual({ undo: [[2]], redo: [] });
  });
});
