import { describe, expect, it } from 'vitest';
import { contrastRatio, parseColor, type Rgba } from './color';
import { suggestForeground, suggestTextFixes } from './contrast-fix';

const c = (s: string) => parseColor(s)!;
const white = c('#ffffff');
const black = c('#000000');

describe('suggestForeground', () => {
  it('returns the colour itself when it already passes', () => {
    expect(suggestForeground(black, white, 4.5)).toEqual(black);
  });

  it('darkens a light grey on white just enough for AA', () => {
    const s = suggestForeground(c('#aaaaaa'), white, 4.5)!;
    const ratio = contrastRatio(s, white);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratio).toBeLessThan(4.7); // nearest, not black
    expect(s.r).toBe(s.g); // grey stays grey
  });

  it('lightens on a dark background', () => {
    const s = suggestForeground(c('#444444'), black, 7)!;
    expect(contrastRatio(s, black)).toBeGreaterThanOrEqual(7);
    expect(s.r).toBeGreaterThan(0x44);
  });

  it('keeps the hue', () => {
    const s = suggestForeground(c('#ff8080'), white, 4.5)!;
    expect(s.r).toBeGreaterThan(s.g);
    expect(s.g).toBe(s.b);
  });

  it('judges a translucent colour as painted', () => {
    const s = suggestForeground({ r: 0, g: 0, b: 0, a: 0.2 }, white, 4.5)!;
    expect(s.a).toBe(1);
    expect(contrastRatio(s, white)).toBeGreaterThanOrEqual(4.5);
  });

  it('is null when no lightness can reach the target', () => {
    expect(suggestForeground(c('#777777'), c('#777777'), 22)).toBeNull();
  });
});

describe('suggestTextFixes', () => {
  it('uses 3 / 4.5 for large text and 4.5 / 7 otherwise', () => {
    const fg: Rgba = c('#999999');
    const big = suggestTextFixes(fg, white, true);
    const normal = suggestTextFixes(fg, white, false);
    expect(contrastRatio(big.aa!, white)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(big.aa!, white)).toBeLessThan(3.2);
    expect(contrastRatio(normal.aaa!, white)).toBeGreaterThanOrEqual(7);
  });
});
