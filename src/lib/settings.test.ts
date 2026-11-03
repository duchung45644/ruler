import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  DEFAULT_SETTINGS,
  getSettings,
  includeHighlights,
  measureColor,
  measureGuides,
  screenshotPrefs,
  themePref,
  updateSettings,
} from './settings';

beforeEach(() => fakeBrowser.reset());

describe('settings', () => {
  it('defaults when empty', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });
  it('keeps stored unknown keys', async () => {
    await fakeBrowser.storage.local.set({ settings: { inspectIsOn: true, extra: 1 } });
    expect(await getSettings()).toEqual({ ...DEFAULT_SETTINGS, inspectIsOn: true, extra: 1 });
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
  it('phase 2 defaults (legacy content.js:26936)', async () => {
    const s = await getSettings();
    expect(s.layoutGrid.columns).toBe(8);
    expect(s.layoutGrid.color).toBe('#FC48FF');
    expect(s.rulerIsOn).toBe(false);
    expect(await measureColor.getValue()).toBe('#FF3B6B');
    expect(await measureGuides.getValue()).toBe(false);
  });
});

describe('screenshotPrefs', () => {
  it('null by default means highlights on', async () => {
    expect(await screenshotPrefs.getValue()).toBeNull();
    expect(includeHighlights(null)).toBe(true);
    expect(includeHighlights({ includeHighlights: false })).toBe(false);
  });
});
