/** A layout-shift entry, reduced to what CLS needs. */
export interface Shift {
  value: number;
  startTime: number;
  hadRecentInput: boolean;
}

/**
 * CLS (web.dev definition): the largest session window of shifts without recent input, a window
 * closing after a 1s gap or 5s total. `shifts` in time order.
 */
export function cumulativeLayoutShift(shifts: readonly Shift[]): number {
  let max = 0;
  let sum = 0;
  let first = -Infinity;
  let last = -Infinity;
  for (const s of shifts) {
    if (s.hadRecentInput) continue;
    if (s.startTime - last > 1000 || s.startTime - first > 5000) {
      sum = 0;
      first = s.startTime;
    }
    sum += s.value;
    last = s.startTime;
    max = Math.max(max, sum);
  }
  return max;
}

/**
 * INP from per-interaction worst durations: the worst one, or for 50+ interactions the
 * 98th percentile (one outlier ignored per 50 interactions). null without interactions.
 */
export function interactionToNextPaint(durations: readonly number[]): number | null {
  if (!durations.length) return null;
  const sorted = [...durations].sort((a, b) => b - a);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length / 50))]!;
}

/** web.dev thresholds: good / needs improvement / poor. */
export function rating(
  metric: 'lcp' | 'cls' | 'inp',
  v: number,
): 'good' | 'needs-improvement' | 'poor' {
  const [good, poor] = { lcp: [2500, 4000], cls: [0.1, 0.25], inp: [200, 500] }[metric];
  return v <= good! ? 'good' : v <= poor! ? 'needs-improvement' : 'poor';
}
