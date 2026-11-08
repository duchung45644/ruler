/** Measure-box geometry, port of unpacked/scripts/bd/measure-guides.js. Page coordinates. */
export type Box = { l: number; t: number; r: number; b: number };
export type Corner = 'tl' | 'tr' | 'bl' | 'br';
export type Field = 'w' | 'h' | 'l' | 't' | 'r' | 'b';
type Size = { width: number; height: number };

export const normBox = (x1: number, y1: number, x2: number, y2: number): Box => ({
  l: Math.min(x1, x2),
  t: Math.min(y1, y2),
  r: Math.max(x1, x2),
  b: Math.max(y1, y2),
});

/** Legacy setMRect: r/b never cross l/t. */
const clamp = ({ l, t, r, b }: Box): Box => ({ l, t, r: Math.max(l, r), b: Math.max(t, b) });

/** Legacy hitMeasure (:91): corners tl, tr, bl, br, then move when strictly inside. Client coords. */
export function hitBox(
  box: Box,
  cx: number,
  cy: number,
  scroll: { x: number; y: number },
  corner = 10,
): { mode: 'move' } | { mode: 'resize'; corner: Corner } | null {
  const l = box.l - scroll.x,
    r = box.r - scroll.x,
    t = box.t - scroll.y,
    b = box.b - scroll.y;
  const near = (v: number, p: number) => Math.abs(v - p) <= corner;
  const nl = near(cx, l),
    nr = near(cx, r),
    nt = near(cy, t),
    nb = near(cy, b);
  if (nl && nt) return { mode: 'resize', corner: 'tl' };
  if (nr && nt) return { mode: 'resize', corner: 'tr' };
  if (nl && nb) return { mode: 'resize', corner: 'bl' };
  if (nr && nb) return { mode: 'resize', corner: 'br' };
  if (cx > l && cx < r && cy > t && cy < b) return { mode: 'move' };
  return null;
}

/** The grabbed corner follows the pointer (page coords px/py). */
export function resizeBox(orig: Box, corner: Corner, px: number, py: number): Box {
  let { l, t, r, b } = orig;
  if (corner.includes('l')) l = px;
  if (corner.includes('r')) r = px;
  if (corner.includes('t')) t = py;
  if (corner.includes('b')) b = py;
  return normBox(l, t, r, b);
}

/** Arrows move, +Ctrl expand, +Ctrl+Alt shrink (Shift: 10). Alt+Shift alone is sibling selection. */
export function nudgeBox(
  box: Box,
  e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>,
): Box | null {
  if (!e.key.startsWith('Arrow') || e.metaKey || (e.altKey && !e.ctrlKey)) return null;
  const s = e.shiftKey ? 10 : 1;
  const k = e.key.slice(5);
  const m = { ...box };
  if (!e.ctrlKey) {
    const dx = k === 'Left' ? -s : k === 'Right' ? s : 0;
    const dy = k === 'Up' ? -s : k === 'Down' ? s : 0;
    m.l += dx;
    m.r += dx;
    m.t += dy;
    m.b += dy;
  } else {
    const d = e.altKey ? -s : s;
    if (k === 'Left') m.l -= d;
    if (k === 'Right') m.r += d;
    if (k === 'Up') m.t -= d;
    if (k === 'Down') m.b += d;
  }
  return clamp(m);
}

/** Legacy applyMeasureInput (:287); r/b are distances to the page's right/bottom edge. */
export function applyField(
  box: Box | null,
  k: Field,
  v: number,
  page: Size,
  view: { x: number; y: number } & Size,
): Box {
  if (!box) {
    // typing before drawing: a 100×100 box in the middle of the viewport
    const x = Math.round(view.x + view.width / 2 - 50);
    const y = Math.round(view.y + view.height / 2 - 50);
    box = { l: x, t: y, r: x + 100, b: y + 100 };
  }
  const m = { ...box };
  if (k === 'w') m.r = m.l + v;
  if (k === 'h') m.b = m.t + v;
  if (k === 'l') {
    m.r += v - m.l;
    m.l = v;
  }
  if (k === 't') {
    m.b += v - m.t;
    m.t = v;
  }
  if (k === 'r') m.r = page.width - v;
  if (k === 'b') m.b = page.height - v;
  return clamp(m);
}

export const fieldValues = (box: Box, page: Size): Record<Field, number> => ({
  w: box.r - box.l,
  h: box.b - box.t,
  l: box.l,
  t: box.t,
  r: page.width - box.r,
  b: page.height - box.b,
});
