import { formatColor, formatCss, parseColor } from '../style/color';

/** What the collectors read: a computed style, or a plain stub in tests. */
export type StyleLike = { getPropertyValue(prop: string): string };

const hexMemo = new Map<string, string | null>();

/** Upper-case HEX of a computed colour; null when unparseable or fully transparent. */
export function hexOf(css: string | undefined): string | null {
  if (!css) return null;
  let v = hexMemo.get(css);
  if (v === undefined) {
    const c = parseColor(css);
    v = c && c.a > 0 ? formatColor(c, 'HEX') : null;
    if (hexMemo.size >= 2000) hexMemo.clear();
    hexMemo.set(css, v);
  }
  return v;
}

/** Legacy `O` (content.js:40229): modern colour functions inside a value rewritten as rgb(). */
export const rgbify = (v: string): string =>
  v.replace(/(?:oklab|oklch|lab|lch|hwb)\([^)]+\)|color\([^)]+\)/g, (m) => formatCss(m, 'RGB'));
