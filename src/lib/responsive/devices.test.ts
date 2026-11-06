import { describe, expect, it } from 'vitest';
import { DEVICE_PRESETS, findPreset } from './devices';

describe('devices', () => {
  it('lists 8.10 presets with unique keys, custom last', () => {
    expect(DEVICE_PRESETS).toHaveLength(37);
    expect(new Set(DEVICE_PRESETS.map((p) => p.key)).size).toBe(37);
    expect(DEVICE_PRESETS.at(-1)!.key).toBe('custom');
  });

  it('finds by key', () => {
    expect(findPreset('iphone-se')).toMatchObject({ width: 375, height: 667 });
    expect(findPreset('desktop-4k')).toMatchObject({ width: 3840, height: 2160 });
    expect(findPreset('nope')).toBeUndefined();
  });
});
