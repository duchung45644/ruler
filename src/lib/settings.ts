import { storage } from '#imports';

export interface Settings {
  inspectIsOn: boolean;
}
export const DEFAULT_SETTINGS: Settings = { inspectIsOn: false };

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
