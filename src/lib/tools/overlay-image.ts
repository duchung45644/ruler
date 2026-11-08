/** Design overlay geometry, port of unpacked/scripts/bd/overlay.js. */
export type OverlayImage = {
  src: string;
  /** Page coords, or screen coords when `fixed`. */
  x: number;
  y: number;
  scale: number;
  opacity: number;
  mode: 'normal' | 'difference';
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
