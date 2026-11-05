/** Zoom menu levels in percent (legacy `fg`). Zoom itself is stored as a factor (1 = 100%). */
export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2;
/** Legacy default zoom when the saved value is missing or invalid. */
export const ZOOM_DEFAULT = 0.65;
export const ZOOM_STEP = 0.05;

/** Port of setZoom's clamp: NaN / 0 falls back to the default. */
export function clampZoom(z: unknown): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(z) || ZOOM_DEFAULT));
}

/** One ±5% step (dir 1 / -1), rounded to whole percents. */
export function stepZoom(z: number, dir: 1 | -1): number {
  return clampZoom(Math.round(100 * (z + dir * ZOOM_STEP)) / 100);
}

/** Percent options for the zoom select: the fixed levels plus the current one if off-grid. */
export function zoomOptions(z: number): number[] {
  const cur = Math.round(100 * z);
  return ZOOM_LEVELS.includes(cur) ? [...ZOOM_LEVELS] : [...ZOOM_LEVELS, cur].sort((a, b) => a - b);
}
