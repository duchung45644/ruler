import type { Breakpoint } from '../tools/breakpoints';

export type Scheme = 'system' | 'light' | 'dark';
export interface Viewport {
  id: number;
  name: string;
  device?: string;
  width: number;
  height: number;
  scheme: Scheme;
}
export interface ResponsiveSettings {
  viewports: Viewport[];
  zoom: number;
  framesWrap: boolean;
  syncScrollEnabled: boolean;
}

/** Live drag / custom dialog minimum (legacy minWidth / minHeight). */
export const DRAG_MIN = { width: 200, height: 300 };
/** Saved and typed sizes are clamped to this range (restoreViewports / setViewportSize). */
export const SAVE_MIN = 320;
export const SIZE_MAX = 3840;
export const MAX_VIEWPORTS = 20;
/** Height of a breakpoint frame with no nearby viewport. */
export const BREAKPOINT_HEIGHT = 800;

const SCHEMES: Scheme[] = ['system', 'light', 'dark'];

/** Q3 defaults: Phone / Tablet / Desktop. */
export function defaultViewports(): Viewport[] {
  return [
    { id: 1, name: 'Phone', device: 'iphone-12-15', width: 390, height: 844, scheme: 'system' },
    { id: 2, name: 'Tablet', device: 'ipad-mini', width: 768, height: 1024, scheme: 'system' },
    { id: 3, name: 'Desktop', width: 1280, height: 800, scheme: 'system' },
  ];
}

/** `drag`: live resize floor 200×300; otherwise the saved range 320–3840. Always rounded. */
export function clampSize(
  width: number,
  height: number,
  mode: 'drag' | 'save' = 'save',
): { width: number; height: number } {
  const c = (v: number, min: number) => Math.min(SIZE_MAX, Math.max(min, Math.round(v)));
  return mode === 'drag'
    ? { width: c(width, DRAG_MIN.width), height: c(height, DRAG_MIN.height) }
    : { width: c(width, SAVE_MIN), height: c(height, SAVE_MIN) };
}

/** Swap width/height of viewport `id`. */
export function rotate(vps: Viewport[], id: number): Viewport[] {
  return vps.map((v) => (v.id === id ? { ...v, width: v.height, height: v.width } : v));
}

/** Move viewport `id` by `delta` places; out-of-range moves return the list unchanged. */
export function move(vps: Viewport[], id: number, delta: number): Viewport[] {
  const from = vps.findIndex((v) => v.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= vps.length) return vps;
  const out = [...vps];
  out.splice(to, 0, ...out.splice(from, 1));
  return out;
}

/** Keep only the first viewport (legacy resetViewports); defaults when empty. */
export function reset(vps: Viewport[]): Viewport[] {
  return vps.length ? [vps[0]!] : defaultViewports().slice(0, 1);
}

export function cycleScheme(s: Scheme): Scheme {
  return SCHEMES[(SCHEMES.indexOf(s) + 1) % SCHEMES.length]!;
}

/** Next free id. */
export function nextId(vps: Viewport[]): number {
  return vps.reduce((m, v) => Math.max(m, v.id), 0) + 1;
}

/**
 * Port of restoreViewports (legacy-src/content.js:28893): drop invalid entries, max 20, clamp
 * 320–3840, renumber ids. Legacy `scheme: null` maps to 'system'. Falls back to defaults if empty.
 */
export function normalizeSaved(saved: unknown): Viewport[] {
  if (!Array.isArray(saved)) return defaultViewports();
  const out = saved
    .filter(
      (e): e is Record<string, unknown> =>
        !!e &&
        typeof e === 'object' &&
        Number.isFinite(Number(e.width)) &&
        Number.isFinite(Number(e.height)),
    )
    .slice(0, MAX_VIEWPORTS)
    .map((e, i): Viewport => {
      const { width, height } = clampSize(Number(e.width), Number(e.height));
      const v: Viewport = {
        id: i + 1,
        name: typeof e.name === 'string' ? e.name : '',
        width,
        height,
        scheme: e.scheme === 'light' || e.scheme === 'dark' ? e.scheme : 'system',
      };
      if (typeof e.device === 'string' && e.device) v.device = e.device;
      return v;
    });
  return out.length ? out : defaultViewports();
}

/**
 * Port of buildBreakpointViewports (legacy-src/content.js:35492): one frame per distinct
 * breakpoint width, height from the closest current viewport within ±25% of that width, else 800.
 */
export function breakpointViewports(bps: Breakpoint[], current: Viewport[]): Viewport[] {
  const widths = [...new Set(bps.map((b) => b.width))]
    .filter((w) => Number.isFinite(w) && w > 0)
    .sort((a, b) => a - b);
  return widths.map((width, i) => {
    const near = current
      .filter((v) => Math.abs(v.width - width) <= 0.25 * width)
      .sort((a, b) => Math.abs(a.width - width) - Math.abs(b.width - width))[0];
    return {
      id: i + 1,
      name: '',
      width,
      height: near ? near.height : BREAKPOINT_HEIGHT,
      scheme: 'system',
    };
  });
}
