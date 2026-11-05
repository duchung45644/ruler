import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FrameApi, ShellApi } from '../../lib/responsive/channel';
import { state } from '../core/state.svelte';
import { eligible, schedulePersist } from '../edit/persist';
import { getUndoRoute, ruleTracker } from '../edit/mode.svelte';
import type { Channel } from './bridge';
import {
  applyFrameInlineStyles,
  applyFrameRuleEdits,
  applyInlineStyles,
  createShellEdits,
  OP_BATCH_MS,
  startFrameEdits,
} from './edits';

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

  it('a rule edit set back to its original is sent as a shorter list, and the receiver reverts', () => {
    document.head.innerHTML = '<style>.a{color:red;margin:1px}</style>';
    const sheet = () => document.head.querySelector('style')!.sheet!.cssRules[0] as CSSStyleRule;
    const addr = { stylesheet: 'inline', selector: '.a', wrappers: [], occ: 0, scopeAddress: null };
    const t = ruleTracker();
    t.editRule(addr, 'margin: 1px;'); // untick color
    const sent = shellCh.send.mock.calls.filter((c) => c[0] === 'rule_edits_changed');
    const off = sent.at(-1)![1] as unknown[];
    expect(off).toHaveLength(1);
    t.editRule(addr, sheet().style.cssText.replace('margin', 'color: red; margin')); // tick back
    expect(shellCh.send.mock.calls.filter((c) => c[0] === 'rule_edits_changed').at(-1)![1]).toEqual(
      [],
    );
    // receiver: has the unticked edit, then gets the empty list → original again
    t.revertAll();
    applyFrameRuleEdits(off);
    expect(sheet().style.color).toBe('');
    shellCh.send.mockClear();
    applyFrameRuleEdits([]);
    expect(sheet().style.color).toBe('red');
    expect(types()).not.toContain('rule_edits_changed');
    // the panel appends a re-ticked declaration at the end: an edit list, still applied in full
    applyFrameRuleEdits(off);
    t.revertAll();
    t.editRule(addr, 'margin: 1px; color: red;');
    const back = shellCh.send.mock.calls.filter((c) => c[0] === 'rule_edits_changed').at(-1)![1];
    t.revertAll();
    applyFrameRuleEdits(off);
    applyFrameRuleEdits(back);
    expect(sheet().style.color).toBe('red');
    document.head.replaceChildren();
  });

  it('inline edits are sent by locator; applied ones are not echoed; a revert sends the original', () => {
    document.body.innerHTML = '<div><p style="color: red;">x</p></div>';
    const p = document.querySelector('p')!;
    ruleTracker().editInlineStyle(p, 'color: blue;');
    const sent = shellCh.send.mock.calls.filter((c) => c[0] === 'inline_style_changed');
    expect(sent).toHaveLength(1);
    const e = sent[0]![1] as { locator: unknown; declsText: string };
    expect(e.declsText).toBe('color: blue;');
    // back to the original: the record drops, the original text is sent so receivers restore
    ruleTracker().editInlineStyle(p, 'color: red;');
    const last = shellCh.send.mock.calls.filter((c) => c[0] === 'inline_style_changed').at(-1)!;
    expect((last[1] as { declsText: string }).declsText).toBe('color: red;');
    // applying from the shell: no echo
    shellCh.send.mockClear();
    applyFrameInlineStyles([{ locator: e.locator, declsText: 'color: green;' }]);
    expect(p.getAttribute('style')).toBe('color: green;');
    expect(types()).not.toContain('inline_style_changed');
    applyFrameInlineStyles([{ locator: e.locator, declsText: 'color: red;' }]);
    expect(p.getAttribute('style')).toBe('color: red;');
    expect(types()).not.toContain('inline_style_changed');
    // unresolved locators are skipped silently
    expect(() =>
      applyInlineStyles([{ locator: { hops: [[{ i: 9, tag: 'nav' }]] }, declsText: 'x: y' }]),
    ).not.toThrow();
    document.body.replaceChildren();
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

  it('inline edits from A go to B only, last write wins, and reset clears them', () => {
    const e = make();
    const loc = { hops: [[{ i: 0, tag: 'html' }]] };
    e.inlineStyleChanged(1, { locator: loc, declsText: 'color: red;' });
    e.inlineStyleChanged(1, { locator: loc, declsText: 'color: blue;' });
    e.inlineStyleChanged(1, { locator: 'junk', declsText: 'x' });
    expect(b.send).toHaveBeenLastCalledWith('apply_inline_styles', [
      { locator: loc, declsText: 'color: blue;' },
    ]);
    expect(b.send).toHaveBeenCalledTimes(2);
    expect(a.send).not.toHaveBeenCalled();
    expect(e.inline).toEqual([{ locator: loc, declsText: 'color: blue;' }]);
    e.reset([]);
    expect(e.inline).toEqual([]);
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
