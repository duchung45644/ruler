import { parseColor } from './color';

export type ThemePref = 'system' | 'light' | 'dark';

/** Plain (non-linear) luma as legacy; null when unreadable or fully transparent. Any colour syntax (oklch…). */
function luminance(bg: string): number | null {
  const c = parseColor(bg);
  return !c || c.a === 0 ? null : (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
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

/** Extension pages (side panel, options): `data-theme` on <html>; no media list means dark. */
export function applyDocTheme(doc: Document, pref: ThemePref, mql: MediaQueryList | null): void {
  const dark = pref === 'system' ? (mql?.matches ?? true) : pref === 'dark';
  doc.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
