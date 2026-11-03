import { storage } from '#imports';

export interface LayoutGrid {
  isOn: boolean;
  columns: number;
  maxWidth: 'auto' | number;
  gutter: number;
  margin: number;
  color: string;
  opacity: number;
}
export interface Settings {
  inspectIsOn: boolean;
  xrayModeIsOn: boolean;
  rulerIsOn: boolean;
  breakpointsIsOn: boolean;
  /** updateSettings merges shallowly: always write the whole object. */
  layoutGrid: LayoutGrid;
}
/** Legacy defaults (legacy-src/content.js:26936). */
export const DEFAULT_SETTINGS: Settings = {
  inspectIsOn: false,
  xrayModeIsOn: false,
  rulerIsOn: false,
  breakpointsIsOn: false,
  layoutGrid: {
    isOn: false,
    columns: 8,
    maxWidth: 'auto',
    gutter: 20,
    margin: 40,
    color: '#FC48FF',
    opacity: 0.3,
  },
};

const settingsItem = storage.defineItem<Partial<Settings>>('local:settings', { fallback: {} });

export async function getSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await settingsItem.getValue()) };
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  await settingsItem.setValue({ ...(await settingsItem.getValue()), ...patch });
}

export const themePref = storage.defineItem<'system' | 'light' | 'dark'>('local:theme', {
  fallback: 'system',
});
export const pinHintDone = storage.defineItem<boolean>('local:inspectorPinHintDone', {
  fallback: false,
});
export const measureColor = storage.defineItem<string>('local:bdMeasureColor', {
  fallback: '#FF3B6B',
});
export const measureGuides = storage.defineItem<boolean>('local:bdMeasureGuides', {
  fallback: false,
});

/** Legacy key; null means both on. includePadding is read but has no effect (as in legacy $e). */
export const screenshotPrefs = storage.defineItem<{
  includePadding?: boolean;
  includeHighlights?: boolean;
} | null>('local:screenshotPreferences', { fallback: null });
export const includeHighlights = (p: { includeHighlights?: boolean } | null): boolean =>
  p?.includeHighlights !== false;
