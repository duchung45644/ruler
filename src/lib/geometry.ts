export type Rect = { x: number; y: number; width: number; height: number };
type Pt = { x: number; y: number };
type Line = { x1: number; y1: number; x2: number; y2: number; value: number };

export function sizeLabels(r: Rect): { width: Pt; height: Pt } {
  return {
    width: { x: r.x + r.width / 2, y: r.y - 4 },
    height: { x: r.x + r.width - 4, y: r.y + r.height / 2 },
  };
}

// Port of legacy drawAllMeasurementLines (content.js:45001): a = selected, b = hovered.
// Non-overlapping sides measure a's facing edge to b's; overlapping sides measure edge to edge.
export function gapLines(a: Rect, b: Rect): Line[] {
  const aR = a.x + a.width,
    aB = a.y + a.height,
    bR = b.x + b.width,
    bB = b.y + b.height;
  const cx = a.x + a.width / 2,
    cy = a.y + a.height / 2;
  const overlap = aR > b.x && a.x < bR && aB > b.y && a.y < bB;
  const out: Line[] = [];
  const v = (x1: number, y1: number, x2: number, y2: number) =>
    out.push({ x1, y1, x2, y2, value: Math.abs(x2 - x1) + Math.abs(y2 - y1) });
  if (aB < b.y) v(cx, aB, cx, b.y);
  else if (overlap && a.y < b.y) v(cx, a.y, cx, b.y);
  if (a.x > bR) v(bR, cy, a.x, cy);
  else if (overlap && aR > bR) v(bR, cy, aR, cy);
  if (a.y > bB) v(cx, bB, cx, a.y);
  else if (overlap && aB > bB) v(cx, bB, cx, aB);
  if (aR < b.x) v(aR, cy, b.x, cy);
  else if (overlap && a.x < b.x) v(a.x, cy, b.x, cy);
  return out;
}

// Port of legacy positionInspectPanel (content.js:47784), scale 1.
// Legacy's fixed control-bar height is replaced by the `avoid` rects.
/** Port of positionPopover (content.js:38491): centre over the button, kept inside the dock. */
export function popoverLeft(btn: Rect, dock: Rect, width: number): number {
  const v = btn.x + btn.width / 2 - dock.x - width / 2;
  return Math.max(0, Math.min(dock.width - width, v));
}

export function placeNear(
  p: Pt,
  size: { width: number; height: number },
  vp: { width: number; height: number },
  avoid: Rect[],
): Pt {
  const off = 16,
    flip = 8,
    m = 16;
  const x =
    vp.width - p.x >= size.width + off + m
      ? p.x + off
      : p.x >= size.width + flip + m
        ? p.x - size.width - flip
        : Math.max(m, Math.min(vp.width - size.width - m, p.x + off));
  let bottom = vp.height - m;
  for (const r of avoid)
    if (r.x < x + size.width && r.x + r.width > x && r.y + r.height > 0)
      bottom = Math.min(bottom, r.y - m);
  const y = Math.max(m, Math.min(p.y + off, bottom - size.height));
  return { x, y };
}
