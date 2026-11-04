import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { showToast } from '../core/toast';
import { persistNow, restorePersisted, schedulePersist } from './persist';
import { RuleTracker } from './rules';

vi.mock('../core/toast', () => ({ showToast: vi.fn() }));
fakeBrowser.i18n.getMessage = ((key: string, subs?: string[]) =>
  [key, ...(subs ?? [])].join(':')) as typeof fakeBrowser.i18n.getMessage;

const KEY = 'persistedRuleEdits:https://site.test';
const own = (recordId: string, selector: string) => ({
  own: true,
  recordId,
  wrappers: [],
  scopePath: [],
  scopeAddress: null,
  selector,
  declsText: 'color: red;',
});

let tracker: RuleTracker;
let stop: () => void;

beforeEach(async () => {
  (window as unknown as { happyDOM: { setURL(u: string): void } }).happyDOM.setURL(
    'https://site.test/page',
  );
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string, subs?: string[]) =>
    [key, ...(subs ?? [])].join(':')) as typeof fakeBrowser.i18n.getMessage;
  vi.mocked(showToast).mockClear();
  tracker = new RuleTracker('ext', schedulePersist);
});
afterEach(() => {
  stop?.();
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.head.replaceChildren();
});

it('writes at most once per 800ms burst and removes the key when nothing is left', async () => {
  stop = await restorePersisted(tracker);
  vi.useFakeTimers();
  const set = vi.spyOn(fakeBrowser.storage.local, 'set');
  tracker.addRule(document, '.a');
  vi.advanceTimersByTime(200);
  tracker.addRule(document, '.b');
  vi.advanceTimersByTime(200);
  tracker.addRule(document, '.c');
  vi.advanceTimersByTime(799);
  expect(set).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(set).toHaveBeenCalledOnce();
  vi.useRealTimers();
  await Promise.resolve();
  expect(
    ((await fakeBrowser.storage.local.get(KEY))[KEY] as { edits: unknown[] }).edits,
  ).toHaveLength(3);
  tracker.revertAll();
  await persistNow();
  expect(await fakeBrowser.storage.local.get(KEY)).toEqual({});
});

it('applies valid saved edits, skips junk and shows the restored toast', async () => {
  await fakeBrowser.storage.local.set({
    [KEY]: { edits: [own('r1', '.x'), own('r2', '.y'), { junk: true }], updatedAt: 1 },
  });
  stop = await restorePersisted(tracker);
  expect(tracker.flattened()).toHaveLength(2);
  expect(document.getElementById(tracker.styleId)?.textContent).toContain('.y');
  expect(showToast).toHaveBeenCalledWith('toast_editsRestoredMany:2', 5000);
});

it('does not write from an iframe', async () => {
  vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
  stop = await restorePersisted(tracker);
  tracker.addRule(document, '.a');
  await persistNow();
  expect(await fakeBrowser.storage.local.get(KEY)).toEqual({});
});

it('reverts the page when the key is cleared from outside, without writing it back', async () => {
  await fakeBrowser.storage.local.set({ [KEY]: { edits: [own('r1', '.x')], updatedAt: 1 } });
  stop = await restorePersisted(tracker);
  expect(document.getElementById(tracker.styleId)).not.toBeNull();
  await fakeBrowser.storage.local.remove(KEY);
  await new Promise((r) => setTimeout(r, 0));
  expect(document.getElementById(tracker.styleId)).toBeNull();
  expect(tracker.hasChanges()).toBe(false);
  await persistNow();
  expect(await fakeBrowser.storage.local.get(KEY)).toEqual({});
});
