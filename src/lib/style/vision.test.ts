import { describe, expect, it } from 'vitest';
import { colorMatrix, VISION_MODES, visionFilter } from './vision';

describe('colorMatrix', () => {
  it('builds a 4×5 matrix with alpha untouched', () => {
    const v = colorMatrix('achromatopsia')!.split(' ').map(Number);
    expect(v).toHaveLength(20);
    expect(v.slice(15)).toEqual([0, 0, 0, 1, 0]);
    expect(v.slice(0, 5)).toEqual([0.2126, 0.7152, 0.0722, 0, 0]);
  });

  it('keeps white white (rows sum to ~1)', () => {
    for (const mode of ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'] as const) {
      const v = colorMatrix(mode)!.split(' ').map(Number);
      for (const r of [0, 1, 2])
        expect(v[r * 5]! + v[r * 5 + 1]! + v[r * 5 + 2]!).toBeCloseTo(1, 2);
    }
  });

  it('is null for modes without a matrix', () => {
    expect(colorMatrix('none')).toBeNull();
    expect(colorMatrix('blurred')).toBeNull();
  });
});

describe('visionFilter', () => {
  const id = (m: string) => `f-${m}`;
  it('maps every mode to a CSS filter', () => {
    expect(VISION_MODES.map((m) => visionFilter(m, id))).toEqual([
      '',
      'url(#f-protanopia)',
      'url(#f-deuteranopia)',
      'url(#f-tritanopia)',
      'url(#f-achromatopsia)',
      'blur(3px)',
    ]);
  });
});
