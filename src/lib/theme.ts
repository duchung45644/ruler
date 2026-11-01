export type ThemePref = 'system' | 'light' | 'dark';

function luminance(bg: string): number | null {
  const m = bg.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => parseFloat(v!) / 255) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// port legacy-src/content.js:21133 (bdDetectPageIsDark); null instead of matchMedia fallback
export function detectPageIsDark(doc: Document): boolean | null {
  const view = doc.defaultView;
  if (!view) return null;
  const lum = (el: Element | null) =>
    el ? luminance(view.getComputedStyle(el).backgroundColor) : null;
  const l = lum(doc.body) ?? lum(doc.documentElement);
  return l == null ? null : l < 0.5;
}

// legacy :21166 — "system" is opposite of the page; unreadable page is assumed to match prefersDark
export function resolveTheme(
  pref: ThemePref,
  pageIsDark: boolean | null,
  prefersDark: boolean,
): 'light' | 'dark' {
  if (pref !== 'system') return pref;
  const dark = pageIsDark ?? prefersDark; // unreadable page: assume it follows the OS scheme (legacy)
  return dark ? 'light' : 'dark';
}

export function measureColor(pageIsDark: boolean | null): '#4f46e5' | '#a5b4fc' {
  return pageIsDark ? '#a5b4fc' : '#4f46e5';
}
