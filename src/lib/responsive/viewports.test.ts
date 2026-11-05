import { describe, expect, it } from 'vitest';
import {
  breakpointViewports,
  clampSize,
  cycleScheme,
  defaultViewports,
  move,
  nextId,
  normalizeSaved,
  reset,
  rotate,
} from './viewports';

describe('viewports', () => {
  it('defaults to Phone / Tablet / Desktop', () => {
    expect(defaultViewports().map((v) => [v.width, v.height])).toEqual([
      [390, 844],
      [768, 1024],
      [1280, 800],
    ]);
  });

  it('clamps per mode', () => {
    expect(clampSize(100, 100, 'drag')).toEqual({ width: 200, height: 300 });
    expect(clampSize(250.6, 310, 'drag')).toEqual({ width: 251, height: 310 });
    expect(clampSize(100, 9999)).toEqual({ width: 320, height: 3840 });
  });

  it('rotates, moves, resets, cycles', () => {
    const vps = defaultViewports();
    expect(rotate(vps, 1)[0]).toMatchObject({ width: 844, height: 390 });
    expect(rotate(vps, 1)[1]).toBe(vps[1]);
    expect(move(vps, 1, 2).map((v) => v.id)).toEqual([2, 3, 1]);
    expect(move(vps, 3, 1)).toBe(vps);
    expect(reset(vps)).toEqual([vps[0]]);
    expect(reset([])).toHaveLength(1);
    expect(cycleScheme('system')).toBe('light');
    expect(cycleScheme('dark')).toBe('system');
    expect(nextId(vps)).toBe(4);
  });

  it('normalizes saved data', () => {
    expect(normalizeSaved(null)).toEqual(defaultViewports());
    expect(normalizeSaved([])).toEqual(defaultViewports());
    const many = Array.from({ length: 30 }, () => ({ width: 100, height: 5000, scheme: null }));
    const out = normalizeSaved([null, { width: 'x', height: 1 }, ...many]);
    expect(out).toHaveLength(20);
    expect(out[0]).toEqual({ id: 1, name: '', width: 320, height: 3840, scheme: 'system' });
    expect(out[19]!.id).toBe(20);
    expect(
      normalizeSaved([{ width: 400, height: 800, scheme: 'dark', name: 'A', device: 'x' }]),
    ).toEqual([{ id: 1, name: 'A', device: 'x', width: 400, height: 800, scheme: 'dark' }]);
  });

  it('builds breakpoint frames', () => {
    const bps = [
      { width: 1024, kind: 'min' as const },
      { width: 768, kind: 'max' as const },
      { width: 768, kind: 'min' as const },
      { width: 3000, kind: 'min' as const },
    ];
    expect(breakpointViewports(bps, defaultViewports())).toEqual([
      { id: 1, name: '', width: 768, height: 1024, scheme: 'system' },
      { id: 2, name: '', width: 1024, height: 1024, scheme: 'system' },
      { id: 3, name: '', width: 3000, height: 800, scheme: 'system' },
    ]);
    expect(breakpointViewports([], defaultViewports())).toEqual([]);
  });
});
