import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { DEFAULT_SETTINGS, getSettings, themePref, updateSettings } from './settings';

beforeEach(() => fakeBrowser.reset());

describe('settings', () => {
  it('defaults when empty', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });
  it('keeps stored unknown keys', async () => {
    await fakeBrowser.storage.local.set({ settings: { inspectIsOn: true, extra: 1 } });
    expect(await getSettings()).toEqual({ inspectIsOn: true, extra: 1 });
  });
  it('update preserves other keys', async () => {
    await fakeBrowser.storage.local.set({ settings: { extra: 1 } });
    await updateSettings({ inspectIsOn: true });
    expect((await fakeBrowser.storage.local.get('settings')).settings).toEqual({
      extra: 1,
      inspectIsOn: true,
    });
  });
  it('theme defaults to system', async () => {
    expect(await themePref.getValue()).toBe('system');
  });
});
