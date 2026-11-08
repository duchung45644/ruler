import { formatColor, formatCss, parseColor } from '../style/color';

/** What the collectors read: a computed style, or a plain stub in tests. */
export type StyleLike = { getPropertyValue(prop: string): string };

/** Port of `B` (content.js:39664): split on commas outside parentheses. */
export function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let cur = '';
  let depth = 0;
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

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

/** Plain-object style for tests: `{ 'margin-top': '8px' }`. */
export const styleOf = (props: Record<string, string>): StyleLike => ({
  getPropertyValue: (p) => props[p] ?? '',
});

/** Legacy `O` (content.js:40229): modern colour functions inside a value rewritten as rgb(). */
export const rgbify = (v: string): string =>
  v.replace(/(?:oklab|oklch|lab|lch|hwb)\([^)]+\)|color\([^)]+\)/g, (m) => formatCss(m, 'RGB'));
