/** Capture geometry, port of unpacked/scripts/bd/capture/capture.js. Viewport CSS px. */
export type SelRect = { x: number; y: number; w: number; h: number };
export type Handle = 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br' | 'move';
type Edges = { left: number; top: number; right: number; bottom: number };

export const EDGE = 8;
export const MIN_SEL = 4;

export const CURSORS: Record<Handle, string> = {
  t: 'ns-resize',
  b: 'ns-resize',
  l: 'ew-resize',
  r: 'ew-resize',
  tl: 'nwse-resize',
  br: 'nwse-resize',
  tr: 'nesw-resize',
  bl: 'nesw-resize',
  move: 'move',
};

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Legacy hitSel (:250): edge/corner within `edge` px, else move when strictly inside. */
export function hitSel(r: SelRect | null, x: number, y: number, edge = EDGE): Handle | null {
  if (!r) return null;
  const inX = x > r.x - edge && x < r.x + r.w + edge;
  const inY = y > r.y - edge && y < r.y + r.h + edge;
  let s = '';
  if (inX && Math.abs(y - r.y) <= edge) s += 't';
  else if (inX && Math.abs(y - r.y - r.h) <= edge) s += 'b';
  if (inY && Math.abs(x - r.x) <= edge) s += 'l';
  else if (inY && Math.abs(x - r.x - r.w) <= edge) s += 'r';
  if (s) return s as Handle;
  return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h ? 'move' : null;
}

/** Legacy pointermove body (:271): draw new (mode null), move, or resize from an edge/corner. */
export function dragSel(
  mode: Handle | null,
  o: SelRect | null,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  vw: number,
  vh: number,
): SelRect {
  cx = clamp(cx, 0, vw);
  cy = clamp(cy, 0, vh);
  if (!mode || !o)
    return { x: Math.min(x0, cx), y: Math.min(y0, cy), w: Math.abs(cx - x0), h: Math.abs(cy - y0) };
  if (mode === 'move')
    return { ...o, x: clamp(o.x + cx - x0, 0, vw - o.w), y: clamp(o.y + cy - y0, 0, vh - o.h) };
  let l = o.x,
    t = o.y,
    rt = o.x + o.w,
    b = o.y + o.h;
  if (mode.includes('l')) l = cx;
  if (mode.includes('r')) rt = cx;
  if (mode.includes('t')) t = cy;
  if (mode.includes('b')) b = cy;
  return { x: Math.min(l, rt), y: Math.min(t, b), w: Math.abs(rt - l), h: Math.abs(b - t) };
}

export const isValidSel = (r: SelRect | null): r is SelRect =>
  !!r && r.w >= MIN_SEL && r.h >= MIN_SEL;

/** Legacy placeBar (:236): below the selection, else above, else inside its bottom edge. */
export function placeSelBar(
  r: SelRect,
  bw: number,
  bh: number,
  vw: number,
  vh: number,
): { top: number; left: number } {
  let top = r.y + r.h + 8;
  if (top + bh > vh - 8) top = r.y - bh - 8 >= 8 ? r.y - bh - 8 : r.y + r.h - bh - 8;
  return { top: Math.max(8, top), left: Math.min(Math.max(8, r.x + r.w - bw), vw - bw - 8) };
}

/** Legacy crop (:213): selection in CSS px -> source rect in captured-image px. */
export function cropSource(r: SelRect, imgW: number, vw: number) {
  const k = imgW / vw;
  return {
    sx: Math.round(r.x * k),
    sy: Math.round(r.y * k),
    w: Math.max(1, Math.round(r.w * k)),
    h: Math.max(1, Math.round(r.h * k)),
  };
}

/** Legacy calculateElementCoordinates (content.js:45410): union + `pad` px (legacy 50), clamped, in device px. */
export function elementCaptureRect(
  rects: Edges[],
  vw: number,
  vh: number,
  dpr: number,
  pad = 50,
): Edges {
  if (!rects.length) return { left: 0, top: 0, right: vw * dpr, bottom: vh * dpr };
  const u = rects.reduce((a, r) => ({
    left: Math.min(a.left, r.left),
    top: Math.min(a.top, r.top),
    right: Math.max(a.right, r.right),
    bottom: Math.max(a.bottom, r.bottom),
  }));
  return {
    left: Math.max(0, u.left - pad) * dpr,
    top: Math.max(0, u.top - pad) * dpr,
    right: Math.min(vw, u.right + pad) * dpr,
    bottom: Math.min(vh, u.bottom + pad) * dpr,
  };
}

export const screenshotName = (hostname: string, now: Date): string =>
  `${hostname || 'screenshot'}-${now.toISOString().replace(/[:.]/g, '-')}.png`;

/** saveScreenshot's visibility check (content.js:46705). */
export const isFullyVisible = (r: Edges, vw: number, vh: number): boolean =>
  r.top >= 0 && r.left >= 0 && r.bottom <= vh && r.right <= vw;
