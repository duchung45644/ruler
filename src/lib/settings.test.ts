import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  DEFAULT_PANEL_PREFS,
  DEFAULT_SETTINGS,
  getPanelPrefs,
  getSettings,
  measureColor,
  measureGuides,
  themePref,
  updatePanelPrefs,
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

describe('sidePanelPreferences', () => {
  it('defaults when empty', async () => {
    const p = await getPanelPrefs();
    expect(p).toEqual(DEFAULT_PANEL_PREFS);
    expect(Object.keys(p.sectionVisibility)).toHaveLength(20);
    expect(Object.values(p.sectionVisibility).every((v) => v.collapsed)).toBe(true);
    expect([p.colorFormat, p.codeViewMode, p.socialPreviewType]).toEqual([
      'HEX',
      'css',
      'facebook',
    ]);
  });
  it('merges stored sections deeply', async () => {
    await fakeBrowser.storage.local.set({
      sidePanelPreferences: {
        sectionVisibility: { css: { collapsed: false } },
        colorFormat: 'RGB',
      },
    });
    const p = await getPanelPrefs();
    expect(p.sectionVisibility.css.collapsed).toBe(false);
    expect(p.sectionVisibility.layout.collapsed).toBe(true);
    expect(p.colorFormat).toBe('RGB');
    await updatePanelPrefs({ codeViewMode: 'tailwind' });
    expect((await getPanelPrefs()).colorFormat).toBe('RGB');
  });
});
