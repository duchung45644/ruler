import { describe, expect, it } from 'vitest';
import { compositeBackground, contrastRatio, parseColor, toHex, wcagLevel } from './color';

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

describe('compositeBackground', () => {
  it('blends translucent layers down to the first opaque one, over white', () => {
    const c = compositeBackground([
      { color: 'rgba(0, 0, 0, 0.5)', image: 'none' },
      { color: 'rgba(0, 0, 0, 0)', image: 'none' },
      { color: 'rgb(255, 0, 0)', image: 'none' },
      { color: 'rgb(0, 0, 255)', image: 'none' }, // below opaque: ignored
    ])!;
    expect(toHex(c)).toBe('#800000');
    expect(toHex(compositeBackground([{ color: 'rgba(0, 0, 0, 0.5)', image: 'none' }])!)).toBe(
      '#808080',
    );
  });
  it('bails on image or gradient layers and on no colour', () => {
    expect(
      compositeBackground([
        { color: 'rgba(0, 0, 0, 0.2)', image: 'none' },
        { color: 'rgba(0, 0, 0, 0)', image: 'url("hero.jpg")' },
      ]),
    ).toBeNull();
    expect(compositeBackground([{ color: 'red', image: 'linear-gradient(red, blue)' }])).toBeNull();
    expect(compositeBackground([{ color: 'transparent', image: 'none' }])).toBeNull();
  });
});
