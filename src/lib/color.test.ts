import { describe, expect, it } from 'vitest';
import { contrastRatio, parseColor, toHex, wcagLevel } from './color';

describe('color', () => {
  it('parses rgb/rgba/transparent', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('rgba(0,0,0,0.5)')!.a).toBe(0.5);
    expect(parseColor('transparent')!.a).toBe(0);
    expect(parseColor('nope')).toBeNull();
  });
  it('formats hex', () => {
    expect(toHex({ r: 99, g: 102, b: 241, a: 1 })).toBe('#6366f1');
    expect(toHex({ r: 0, g: 0, b: 0, a: 0.5 })).toBe('#00000080');
  });
  it('computes contrast and WCAG level', () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const white = { r: 255, g: 255, b: 255, a: 1 };
    expect(contrastRatio(black, white)).toBeCloseTo(21);
    expect(wcagLevel(4.5, false)).toBe('AA');
    expect(wcagLevel(3, true)).toBe('AA');
    expect(wcagLevel(2.9, true)).toBe('fail');
    expect(wcagLevel(7, false)).toBe('AAA');
  });
});
