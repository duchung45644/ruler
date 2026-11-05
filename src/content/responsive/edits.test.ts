import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FrameApi, ShellApi } from '../../lib/responsive/channel';
import { state } from '../core/state.svelte';
import { eligible, schedulePersist } from '../edit/persist';
import { getUndoRoute, ruleTracker } from '../edit/mode.svelte';
import type { Channel } from './bridge';
import { applyFrameRuleEdits, createShellEdits, OP_BATCH_MS, startFrameEdits } from './edits';

const own = (recordId: string, selector: string) => ({
  own: true as const,
  recordId,
  wrappers: [],
  scopePath: [],
  scopeAddress: null,
  selector,
  declsText: 'color: red;',
});

const fakeChannel = <T extends object>() => {
  const send = vi.fn();
  const call = vi.fn(async () => undefined);
  return { send, call, ch: { send, call } as unknown as Channel<T> };
};

afterEach(() => {
  ruleTracker().revertAll();
  state.inFrame = false;
  vi.useRealTimers();
});

describe('frame side', () => {
  let ctl: AbortController;
  let shellCh: ReturnType<typeof fakeChannel<ShellApi>>;
  beforeEach(() => {
    state.inFrame = true;
    ctl = new AbortController();
    shellCh = fakeChannel<ShellApi>();
    startFrameEdits(shellCh.ch, ctl.signal);
  });
  afterEach(() => ctl.abort());
  const types = () => shellCh.send.mock.calls.map((c) => c[0] as string);

  it('a local rule edit is reported with the full list and the edit state', () => {
    ruleTracker().applySerialized([own('a', '.mine')]);
    expect(shellCh.send).toHaveBeenCalledWith('rule_edits_changed', [
      expect.objectContaining({ selector: '.mine' }),
    ]);
    expect(shellCh.send).toHaveBeenCalledWith(
      'frame_edit_state',
      expect.objectContaining({ htmlEdits: 0 }),
    );
  });

  it('edits applied from the shell replace the list and are not echoed back', () => {
    ruleTracker().applySerialized([own('old', '.old')]);
    shellCh.send.mockClear();
    applyFrameRuleEdits([own('b', '.from-a')]);
    expect(ruleTracker().serialize()).toEqual([expect.objectContaining({ selector: '.from-a' })]);
    expect(types()).not.toContain('rule_edits_changed');
    applyFrameRuleEdits([own('b', '.from-a')]); // idempotent
    expect(ruleTracker().serialize()).toHaveLength(1);
  });

  it('frames never persist the page key', () => {
    expect(eligible()).toBe(false);
    expect(() => schedulePersist()).not.toThrow();
  });

  it('undo keys in the frame go to the shell', () => {
    expect(getUndoRoute()?.(true)).toBe(true);
    expect(shellCh.send).toHaveBeenCalledWith('edit_history_key', true);
    ctl.abort();
    expect(getUndoRoute()).toBeNull();
  });
});

describe('shell side', () => {
  const a = fakeChannel<FrameApi>();
  const b = fakeChannel<FrameApi>();
  beforeEach(() => {
    a.send.mockClear();
    b.send.mockClear();
    a.call.mockClear();
    b.call.mockClear();
  });
  const make = () =>
    createShellEdits(() => [
      [1, a.ch],
      [2, b.ch],
    ]);

  it('rule edits from frame A go to B only and become the newest list', () => {
    const e = make();
    e.ruleEditsChanged(1, [own('x', '.x'), { junk: true }]);
    expect(b.send).toHaveBeenCalledWith('apply_rule_edits', [
      expect.objectContaining({ selector: '.x' }),
    ]);
    expect(a.send).not.toHaveBeenCalled();
    expect(e.last).toEqual([expect.objectContaining({ selector: '.x' })]);
  });

  it('undo after an edit in B targets B; ops within the batch window are one step', async () => {
    vi.useFakeTimers();
    const e = make();
    e.opRecorded(1);
    vi.advanceTimersByTime(OP_BATCH_MS + 1);
    e.opRecorded(2);
    e.opRecorded(2);
    vi.advanceTimersByTime(OP_BATCH_MS + 1);
    expect(e.history.undo).toEqual([[1], [2]]);
    await e.step(false);
    expect(b.call).toHaveBeenCalledWith('edit_undo');
    expect(a.call).not.toHaveBeenCalled();
    await e.step(true);
    expect(b.call).toHaveBeenCalledWith('edit_redo');
  });

  it('a pending op is flushed before undo', async () => {
    vi.useFakeTimers();
    const e = make();
    e.opRecorded(1);
    await e.step(false);
    expect(a.call).toHaveBeenCalledWith('edit_undo');
  });

  it('HTML edits reported by a frame are uncarryable until it is forgotten', () => {
    const e = make();
    expect(e.hasUncarryable()).toBe(false);
    e.frameState(2, { htmlEdits: 3 });
    expect(e.hasUncarryable()).toBe(true);
    e.forget(2);
    expect(e.hasUncarryable()).toBe(false);
  });
});
