/** Scroll position → fraction of the scrollable range (legacy emitScrollSync `pctX/pctY`). */
export function toRatio(pos: number, max: number): number {
  return max > 0 ? pos / max : 0;
}

/** Fraction → scroll position in a frame with its own range (legacy applyScrollSync). */
export function fromRatio(ratio: number, max: number): number {
  return max > 0 ? ratio * max : 0;
}

export const CONFLICT_WINDOW_MS = 700;
export const CONFLICT_COUNT = 5;
/** Legacy: page moved ≥48px away from the position we just applied. */
export const CONFLICT_DISTANCE_PX = 48;
/** Legacy: after an applied sync, emits are muted for 300ms. */
export const SCROLL_MUTE_MS = 300;
/** Legacy: at most one `scroll_sync_conflict` report per 10s. */
export const CONFLICT_REPORT_INTERVAL_MS = 10_000;

export interface ConflictDetector {
  /** Note that a sync was just applied (scrolled to `y`) at time `now`. */
  applied(y: number, now: number): void;
  /** Feed a scroll event; returns true when a conflict should be reported. */
  scrolled(y: number, now: number): boolean;
  reset(): void;
}

/**
 * Port of trackScrollConflict: while the mute window after an applied sync is open, each scroll
 * that drifts ≥48px from the applied position counts as a "fight"; 5 fights within 700ms is a
 * conflict (the page scrolls itself back against us). Reports are throttled to one per 10s.
 */
export function createConflictDetector(): ConflictDetector {
  let lastApplied: number | null = null;
  let mutedUntil = 0;
  let fights: number[] = [];
  let lastReport = -Infinity;
  return {
    applied(y, now) {
      lastApplied = y;
      mutedUntil = now + SCROLL_MUTE_MS;
    },
    scrolled(y, now) {
      if (lastApplied == null || now > mutedUntil) return false;
      if (Math.abs(y - lastApplied) < CONFLICT_DISTANCE_PX) return false;
      fights = fights.filter((t) => now - t < CONFLICT_WINDOW_MS);
      fights.push(now);
      if (fights.length < CONFLICT_COUNT) return false;
      fights = [];
      if (now - lastReport < CONFLICT_REPORT_INTERVAL_MS) return false;
      lastReport = now;
      return true;
    },
    reset() {
      lastApplied = null;
      mutedUntil = 0;
      fights = [];
      lastReport = -Infinity;
    },
  };
}
