/** Port of the guide math in unpacked/scripts/bd/measure-guides.js. */
export const RULER = 20;
export const SNAP = 6;
/** Grab radius (legacy nearGuide). */
export const GRAB = 5;

/** Page coordinates. */
export type Guide = { axis: 'h' | 'v'; pos: number };

/** Legacy snapGuide (:106): first edge within ±snap wins, then round. */
export function snapPos(pos: number, edges: number[], snap = SNAP): number {
  const e = edges.find((v) => Math.abs(v - pos) <= snap);
  return Math.round(e ?? pos);
}

export function nearestGuide(
  guides: Guide[],
  cx: number,
  cy: number,
  scroll: { x: number; y: number },
): Guide | null {
  let best: Guide | null = null;
  let bd = GRAB;
  for (const g of guides) {
    const d = g.axis === 'h' ? Math.abs(g.pos - scroll.y - cy) : Math.abs(g.pos - scroll.x - cx);
    if (d < bd) [bd, best] = [d, g];
  }
  return best;
}

export function guideGaps(positions: number[]): Array<{ mid: number; value: number }> {
  const s = [...positions].sort((a, b) => a - b);
  return s.slice(1).map((p, i) => ({ mid: (p + s[i]!) / 2, value: p - s[i]! }));
}

/** Legacy createHorizontalRuler (:48166): a tick every 10px. */
export function ticks(length: number): Array<{ at: number; kind: 'major' | 'medium' | 'minor' }> {
  const out: Array<{ at: number; kind: 'major' | 'medium' | 'minor' }> = [];
  for (let at = 0; at <= length; at += 10)
    out.push({ at, kind: at % 100 === 0 ? 'major' : at % 50 === 0 ? 'medium' : 'minor' });
  return out;
}
