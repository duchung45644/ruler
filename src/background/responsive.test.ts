import { fakeBrowser } from 'wxt/testing/fake-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browser } from '#imports';
import { frameName } from '../lib/responsive/frame-name';
import {
  cleanupOrphanRules,
  enableFrameHeaderRule,
  exitResponsiveMode,
  initResponsive,
  injectResponsiveFrames,
  onTabUpdated,
} from './responsive';

const updateSessionRules = vi.fn<(o: unknown) => Promise<void>>(async () => {});
const getSessionRules = vi.fn(async () => [] as { id: number }[]);
const executeScript = vi.fn();
const contains = vi.fn(async () => true);
const sendMessage = vi.fn<(...a: unknown[]) => Promise<unknown>>(async () => undefined);

beforeEach(() => {
  fakeBrowser.reset();
  vi.clearAllMocks();
  Object.assign(browser, {
    declarativeNetRequest: { updateSessionRules, getSessionRules },
    scripting: { executeScript },
  });
  browser.permissions.contains = contains as never;
  browser.tabs.sendMessage = sendMessage as never;
});
afterEach(() => vi.useRealTimers());

describe('frame header rule', () => {
  it('does nothing without <all_urls>', async () => {
    contains.mockResolvedValueOnce(false);
    expect(await enableFrameHeaderRule(7)).toBe(false);
    expect(updateSessionRules).not.toHaveBeenCalled();
  });

  it('adds one sub_frame rule scoped to the tab', async () => {
    expect(await enableFrameHeaderRule(7)).toBe(true);
    expect(contains).toHaveBeenCalledWith({ origins: ['<all_urls>'] });
    expect(updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: [7],
      addRules: [
        {
          id: 7,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              'x-frame-options',
              'frame-options',
              'content-security-policy',
              'content-security-policy-report-only',
            ].map((header) => ({ header, operation: 'remove' })),
          },
          condition: { resourceTypes: ['sub_frame'], tabIds: [7] },
        },
      ],
    });
  });

  it('removes the rule when the tab closes', async () => {
    initResponsive(async () => {});
    updateSessionRules.mockClear();
    await fakeBrowser.tabs.onRemoved.trigger(9, { windowId: 1, isWindowClosing: false });
    expect(updateSessionRules).toHaveBeenCalledWith({ removeRuleIds: [9] });
  });

  it('removes orphan rules on start', async () => {
    const tab = await fakeBrowser.tabs.create({});
    getSessionRules.mockResolvedValueOnce([{ id: tab.id! }, { id: 999 }]);
    await cleanupOrphanRules();
    expect(updateSessionRules).toHaveBeenCalledWith({ removeRuleIds: [999] });
  });
});

describe('injectResponsiveFrames', () => {
  it('injects only into frames named with our prefix', async () => {
    const id = browser.runtime.id;
    executeScript.mockResolvedValueOnce([
      { frameId: 0, result: '' },
      { frameId: 3, result: frameName(id, 1) },
      { frameId: 4, result: 'other' },
      { frameId: 5, result: frameName(id, 2) },
      { frameId: 6, result: frameName('someone-else', 1) },
    ]);
    executeScript.mockResolvedValueOnce([]); // frame 3
    executeScript.mockRejectedValueOnce(new Error('cannot access')); // frame 5
    expect(await injectResponsiveFrames(2)).toEqual([3]);
    expect(executeScript).toHaveBeenCalledWith({
      target: { tabId: 2, frameIds: [3] },
      files: ['/content-scripts/content.js'],
    });
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ type: 'start_frame_mode' }),
      { frameId: 3 },
    );
  });
});

describe('exit hand-off', () => {
  const edits = [{ selector: 'a' }] as never;

  it.each([
    [3_000, true],
    [16_000, false],
  ])('complete after %ims resumes: %s', async (ms, resumes) => {
    vi.useFakeTimers({ now: 1_000_000 });
    const activate = vi.fn(async () => {});
    await exitResponsiveMode(4, edits);
    expect(updateSessionRules).toHaveBeenCalledWith({ removeRuleIds: [4] });
    vi.setSystemTime(1_000_000 + ms);
    await onTabUpdated(4, 'complete', activate);
    expect(activate).toHaveBeenCalledTimes(resumes ? 1 : 0);
    const applied = sendMessage.mock.calls.filter(
      (c) => (c[1] as { type: string }).type === 'apply_pending_rule_edits',
    );
    expect(applied.length).toBe(resumes ? 1 : 0);
    // mark is consumed either way
    await onTabUpdated(4, 'complete', activate);
    expect(activate).toHaveBeenCalledTimes(resumes ? 1 : 0);
  });

  it('a top-level load removes the rule', async () => {
    await onTabUpdated(8, 'loading', async () => {});
    expect(updateSessionRules).toHaveBeenCalledWith({ removeRuleIds: [8] });
  });
});
