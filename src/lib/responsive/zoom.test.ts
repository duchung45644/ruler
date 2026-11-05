import { describe, expect, it } from 'vitest';
import { clampZoom, stepZoom, zoomOptions } from './zoom';

describe('zoom', () => {
  it('clamps to 25–200%, default for junk', () => {
    expect(clampZoom(0.1)).toBe(0.25);
    expect(clampZoom(5)).toBe(2);
    expect(clampZoom('abc')).toBe(0.65);
    expect(clampZoom(1.25)).toBe(1.25);
  });

  it('steps 5% without float drift and stays in range', () => {
    expect(stepZoom(0.65, 1)).toBe(0.7);
    expect(stepZoom(0.7, -1)).toBe(0.65);
    expect(stepZoom(2, 1)).toBe(2);
    expect(stepZoom(0.25, -1)).toBe(0.25);
  });

  it('adds an off-grid current level in order', () => {
    expect(zoomOptions(1)).toEqual([25, 50, 75, 100, 125, 150, 200]);
    expect(zoomOptions(0.65)).toEqual([25, 50, 65, 75, 100, 125, 150, 200]);
  });
});
