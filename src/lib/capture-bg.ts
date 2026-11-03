/** Background capture helpers, port of $e (legacy-src/background.js:5743) and bdFullCapture (unpacked/bd-background.js:31). */
export type DeviceRect = { left: number; top: number; right: number; bottom: number }; // device px

/** captureVisibleTab allows ~2 calls/s (spec §3). */
export const CAPTURE_GAP = 550;

export const nextCaptureDelay = (last: number, now: number, gap = CAPTURE_GAP): number =>
  Math.max(0, last + gap - now);

export const cropBox = (r: DeviceRect) => ({
  x: r.left,
  y: r.top,
  w: Math.max(1, Math.round(r.right - r.left)),
  h: Math.max(1, Math.round(r.bottom - r.top)),
});

/** One capture taller than a GPU texture (~16384px) repeats tiles, so read back in chunks. */
export function chunkClips(height: number, chunk: number, shift: number, width: number) {
  const clips: { x: 0; y: number; width: number; height: number; scale: 1 }[] = [];
  for (let y = 0; y < height; y += chunk)
    clips.push({ x: 0, y: y + shift, width, height: Math.min(chunk, height - y), scale: 1 });
  return clips;
}
