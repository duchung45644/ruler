import { describe, expect, it } from 'vitest';
import { CUSTOM_PRESET, DEVICE_GROUPS } from './devices';

const DEVICE_PRESETS = [...DEVICE_GROUPS.flat(), CUSTOM_PRESET];

describe('devices', () => {
  it('lists 8.10 presets with unique keys, custom last', () => {
    expect(DEVICE_PRESETS).toHaveLength(36);
    expect(new Set(DEVICE_PRESETS.map((p) => p.key)).size).toBe(36);
    expect(DEVICE_PRESETS.at(-1)!.key).toBe('custom');
  });
});
