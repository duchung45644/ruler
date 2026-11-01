export type Rgba = { r: number; g: number; b: number; a: number };

/** Parses computed-style colours (`rgb()/rgba()`, `transparent`, `#hex`). Port of legacy parseColor. */
export function parseColor(css: string): Rgba | null {
  const s = css.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(s)?.[1];
  if (hex) {
    const full = hex.length < 5 ? [...hex].map((c) => c + c).join('') : hex;
    const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 };
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (!m) return null;
  const p = m[1]!.split(/[\s,/]+/).filter(Boolean);
  if (p.length < 3) return null;
  const [r, g, b] = p.slice(0, 3).map(Number) as [number, number, number];
  const a = p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : Number(p[3]);
  return [r, g, b, a].some(Number.isNaN) ? null : { r, g, b, a };
}

export function toHex(c: Rgba): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a < 1 ? h(c.a * 255) : ''}`;
}

const luminance = ({ r, g, b }: Rgba) => {
  const ch = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
};

/** `a over b` (b assumed opaque). */
export const blend = (a: Rgba, b: Rgba): Rgba => ({
  r: a.r * a.a + b.r * (1 - a.a),
  g: a.g * a.a + b.g * (1 - a.a),
  b: a.b * a.a + b.b * (1 - a.a),
  a: 1,
});

/** WCAG ratio; a translucent fg is blended over bg first (legacy calculateWCAGContrast). */
export function contrastRatio(fg: Rgba, bg: Rgba): number {
  const l1 = luminance(blend(fg, bg));
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function wcagLevel(ratio: number, largeText: boolean): 'AAA' | 'AA' | 'fail' {
  if (ratio >= (largeText ? 4.5 : 7)) return 'AAA';
  return ratio >= (largeText ? 3 : 4.5) ? 'AA' : 'fail';
}
