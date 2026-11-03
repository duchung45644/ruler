export type Rgba = { r: number; g: number; b: number; a: number };

/**
 * Parses computed-style colours: `rgb()/rgba()`, `transparent`, `#hex` (port of legacy parseColor),
 * plus `oklch()`, `oklab()`, `color(srgb …)` that modern pages (Tailwind 4) compute to.
 */
export function parseColor(css: string): Rgba | null {
  const s = css.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(s)?.[1];
  if (hex) {
    const full = hex.length < 5 ? [...hex].map((c) => c + c).join('') : hex;
    const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 };
  }
  const m = /^(rgba?|oklch|oklab|color)\(\s*(srgb\s)?([^)]+)\)$/.exec(s);
  if (!m || (m[1] === 'color' && !m[2])) return null;
  const p = m[3]!.split(/[\s,/]+/).filter(Boolean);
  if (p.length < 3) return null;
  // `none` → 0; a percentage is a fraction of 1 (only alpha / L / srgb channels use them)
  const n = (v: string) => (v === 'none' ? 0 : v.endsWith('%') ? parseFloat(v) / 100 : Number(v));
  const a = p[3] === undefined ? 1 : n(p[3]);
  let rgb: number[];
  if (m[1]!.startsWith('rgb')) rgb = p.slice(0, 3).map(Number);
  else if (m[1] === 'color') rgb = p.slice(0, 3).map((v) => n(v) * 255);
  else {
    const [L, x, y] = p.slice(0, 3).map(n) as [number, number, number];
    const h = (y * Math.PI) / 180;
    rgb = m[1] === 'oklch' ? oklabToRgb(L, x * Math.cos(h), x * Math.sin(h)) : oklabToRgb(L, x, y);
  }
  const [r, g, b] = rgb as [number, number, number];
  return [r, g, b, a].some(Number.isNaN) ? null : { r, g, b, a };
}

/** OKLab → sRGB 0–255, out-of-gamut channels clamped (Björn Ottosson's reference matrices). */
function oklabToRgb(L: number, a: number, b: number): number[] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => {
    v = Math.min(1, Math.max(0, v));
    return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  });
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

export type BgLayer = { color: string; image: string };

/**
 * Port of legacy findBackgroundColor's blend (:43977-44134). `layers` run top → bottom.
 * Any url()/gradient layer → null (ratio would be a guess); otherwise blend down to the first
 * opaque layer, over white. No coloured layer → null.
 */
export function compositeBackground(layers: BgLayer[]): Rgba | null {
  const stack: Rgba[] = [];
  for (const l of layers) {
    if (/gradient\(|url\(/.test(l.image)) return null;
    const c = parseColor(l.color);
    if (!c || c.a === 0) continue;
    stack.push(c);
    if (c.a >= 0.99) break;
  }
  if (!stack.length) return null;
  return stack.reduceRight((under, c) => blend(c, under), { r: 255, g: 255, b: 255, a: 1 });
}

export type ColorFormat = 'HEX' | 'RGB' | 'HSL' | 'HSB';

/** Port of legacy Cu (content.js:13177): HEX upper-case, alpha appended only below 1. */
export function formatColor(c: Rgba, f: ColorFormat): string {
  const [r, g, b] = [c.r, c.g, c.b].map((v) => Math.round(Math.min(255, Math.max(0, v)))) as [
    number,
    number,
    number,
  ];
  const a = Math.round(c.a * 1000) / 1000;
  if (f === 'HEX') {
    const h = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(Math.round(255 * a)) : ''}`;
  }
  if (f === 'RGB') return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  const [R, G, B] = [r / 255, g / 255, b / 255] as [number, number, number];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === R) h = (G - B) / d + (G < B ? 6 : 0);
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h /= 6;
  }
  const H = Math.round(360 * h);
  if (f === 'HSL') {
    const l = (max + min) / 2;
    const s = d ? (l > 0.5 ? d / (2 - max - min) : d / (max + min)) : 0;
    const body = `${H}, ${Math.round(100 * s)}%, ${Math.round(100 * l)}%`;
    return a === 1 ? `hsl(${body})` : `hsla(${body}, ${a})`;
  }
  const body = `${H}, ${Math.round(100 * (max ? d / max : 0))}%, ${Math.round(100 * max)}%`;
  return a === 1 ? `hsb(${body})` : `hsba(${body}, ${a})`;
}

/** Any parseable CSS colour in format `f`; anything else (gradients, keywords) unchanged. */
export function formatCss(css: string, f: ColorFormat): string {
  const c = parseColor(css);
  return c ? formatColor(c, f) : css;
}
