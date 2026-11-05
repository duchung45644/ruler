export type FrameId = number;

/** Per-frame match counts in frame order (legacy `findFrameCounts` over `responsiveFrameEls`). */
export interface FindCounts {
  frames: readonly FrameId[];
  counts: ReadonlyMap<FrameId, number>;
}

export interface FindCursor {
  frame: FrameId;
  local: number;
}

/** Legacy aggregatedFindTotal. */
export function findTotal({ frames, counts }: FindCounts): number {
  return frames.reduce((sum, f) => sum + (counts.get(f) ?? 0), 0);
}

/** Legacy aggregatedFindLocation: global index → frame + local index, or null. */
export function findLocate({ frames, counts }: FindCounts, index: number): FindCursor | null {
  if (!Number.isInteger(index) || index < 0) return null;
  let local = index;
  for (const frame of frames) {
    const n = counts.get(frame) ?? 0;
    if (local < n) return { frame, local };
    local -= n;
  }
  return null;
}

/** Legacy aggregatedFindIndex: cursor → global index, -1 when stale or absent. */
export function findGlobalIndex(agg: FindCounts, cursor: FindCursor | null): number {
  if (!cursor || cursor.local < 0) return -1;
  if (cursor.local >= (agg.counts.get(cursor.frame) ?? 0)) return -1;
  const pos = agg.frames.indexOf(cursor.frame);
  if (pos < 0) return -1;
  let offset = 0;
  for (const f of agg.frames.slice(0, pos)) offset += agg.counts.get(f) ?? 0;
  return offset + cursor.local;
}

/**
 * Legacy navigateAggregatedFind: step ±1 with wrap-around. Without a valid cursor, next goes to
 * the first match and previous to the last. Returns null when there are no matches.
 */
export function findStep(
  agg: FindCounts,
  cursor: FindCursor | null,
  dir: 1 | -1,
): FindCursor | null {
  const total = findTotal(agg);
  if (total === 0) return null;
  const cur = findGlobalIndex(agg, cursor);
  const next = cur < 0 ? (dir < 0 ? total - 1 : 0) : (cur + dir + total) % total;
  return findLocate(agg, next);
}
