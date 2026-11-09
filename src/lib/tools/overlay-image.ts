/** Design overlay geometry, port of unpacked/scripts/bd/overlay.js. */
export type OverlayImage = {
  src: string;
  /** Page coords, or screen coords when `fixed`. */
  x: number;
  y: number;
  scale: number;
  opacity: number;
  mode: 'normal' | 'difference' | 'onion';
  visible: boolean;
  fixed: boolean;
};
export type Corner = 'tl' | 'tr' | 'bl' | 'br';
type Size = { width: number; height: number };
type Pt = { x: number; y: number };

/** loadOverlayFile :125: retina (@2x) exports show at 50%, centred in the viewport. */
export function initialPlacement(
  nat: Size,
  view: Pt & Size,
): Pick<OverlayImage, 'x' | 'y' | 'scale'> {
  const scale = nat.width >= view.width * 1.8 ? 50 : 100;
  const w = (nat.width * scale) / 100;
  const h = (nat.height * scale) / 100;
  return {
    scale,
    x: Math.round(view.width / 2 - w / 2 + view.x),
    y: Math.round(view.height / 2 - h / 2 + view.y),
  };
}

export function cornerAt(size: Size, lx: number, ly: number, c = 14): Corner | null {
  const l = lx <= c;
  const r = lx >= size.width - c;
  const t = ly <= c;
  const b = ly >= size.height - c;
  return l && t ? 'tl' : r && t ? 'tr' : l && b ? 'bl' : r && b ? 'br' : null;
}

/** startOverlayResize :76, from the image at drag start; keeps the aspect, anchors the opposite corner. */
export function resizeFromCorner(
  o: OverlayImage,
  nat: Size,
  corner: Corner,
  cx: number,
  _cy: number,
  scroll: Pt,
): Pick<OverlayImage, 'x' | 'y' | 'scale'> {
  const natW = nat.width || 1;
  const aspect = (nat.height || 1) / natW;
  const left0 = o.fixed ? o.x : o.x - scroll.x;
  const top0 = o.fixed ? o.y : o.y - scroll.y;
  const w0 = (natW * o.scale) / 100;
  const right0 = left0 + w0;
  const bottom0 = top0 + w0 * aspect;
  const left = corner.includes('l');
  const width = Math.max(20, left ? right0 - cx : cx - left0);
  return {
    scale: Math.max(2, Math.round((width / natW) * 100)),
    x: left ? (o.fixed ? right0 : right0 + scroll.x) - width : o.x,
    y: corner.includes('t') ? (o.fixed ? bottom0 : bottom0 + scroll.y) - width * aspect : o.y,
  };
}

export function togglePinned(o: OverlayImage, scroll: Pt): Pick<OverlayImage, 'x' | 'y' | 'fixed'> {
  const s = o.fixed ? 1 : -1;
  return { x: o.x + s * scroll.x, y: o.y + s * scroll.y, fixed: !o.fixed };
}

const DIRS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/** Alt is ignored too, so Alt+Shift+←/→ still selects siblings (spec §9). */
export function nudgeDelta(
  e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'ctrlKey' | 'metaKey' | 'altKey'>,
): { dx: number; dy: number } | null {
  const d = DIRS[e.key];
  if (!d || e.ctrlKey || e.metaKey || e.altKey) return null;
  const s = e.shiftKey ? 10 : 1;
  return { dx: d[0] * s, dy: d[1] * s };
}

export type OnionTint = 'none' | 'invert' | 'twoTone';
/** Tool-wide comparison options, remembered across sessions (settings `overlayPrefs`). */
export interface OverlayPrefs {
  /** Blend mode new images start with: the last one picked. */
  mode: OverlayImage['mode'];
  onionTint: OnionTint;
  split: boolean;
  /** Divider position, % of the viewport width. */
  splitPos: number;
  /** Which side of the divider shows the design. */
  designLeft: boolean;
}
export const DEFAULT_OVERLAY_PREFS: OverlayPrefs = {
  mode: 'normal',
  onionTint: 'none',
  split: false,
  splitPos: 50,
  designLeft: true,
};
const MODES: readonly string[] = ['normal', 'difference', 'onion'];
const TINTS: readonly string[] = ['none', 'invert', 'twoTone'];

export const clampPos = (pct: number): number => Math.min(100, Math.max(0, pct));

/** Stored prefs made safe: unknown values fall back to the defaults. */
export function normalizeOverlayPrefs(p: Partial<OverlayPrefs> | null | undefined): OverlayPrefs {
  const d = DEFAULT_OVERLAY_PREFS;
  const pos = Number(p?.splitPos);
  const bool = (v: unknown, fb: boolean) => (typeof v === 'boolean' ? v : fb);
  return {
    mode: p?.mode && MODES.includes(p.mode) ? p.mode : d.mode,
    onionTint: p?.onionTint && TINTS.includes(p.onionTint) ? p.onionTint : d.onionTint,
    split: bool(p?.split, d.split),
    splitPos: p?.splitPos != null && Number.isFinite(pos) ? clampPos(pos) : d.splitPos,
    designLeft: bool(p?.designLeft, d.designLeft),
  };
}

/** Onion skin never covers the page fully, so the page always shows through. */
export const ONION_MAX_OPACITY = 60;

/** Opacity (0–1), CSS blend mode and filter for one image. */
export function imageLook(
  o: Pick<OverlayImage, 'mode' | 'opacity'>,
  tint: OnionTint,
): { opacity: number; blend: 'normal' | 'difference'; filter: string } {
  if (o.mode === 'difference') return { opacity: 1, blend: 'difference', filter: 'none' };
  if (o.mode === 'normal') return { opacity: o.opacity / 100, blend: 'normal', filter: 'none' };
  const filter =
    tint === 'invert'
      ? 'invert(1)'
      : tint === 'twoTone'
        ? 'grayscale(1) sepia(1) saturate(6) hue-rotate(280deg)'
        : 'none';
  return { opacity: Math.min(o.opacity, ONION_MAX_OPACITY) / 100, blend: 'normal', filter };
}

/** clip-path so an image at viewport `left`/`width` only shows on its side of the divider at `divider`. */
export function splitClip(
  left: number,
  width: number,
  divider: number,
  designLeft: boolean,
): string {
  const cut = designLeft ? left + width - divider : divider - left;
  const px = Math.round(Math.min(width, Math.max(0, cut)));
  return designLeft ? `inset(0 ${px}px 0 0)` : `inset(0 0 0 ${px}px)`;
}
