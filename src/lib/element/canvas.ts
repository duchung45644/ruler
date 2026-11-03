import { formatColor } from '../color';
import type { CanvasInfo } from './types';

/** Legacy samples the canvas drawn down to this square (getCanvasColors, content.js:41375). */
export const PALETTE_SAMPLE = 64;

/**
 * Port of getCanvasColors' counting: channels snapped to steps of 15, alpha < 128 ignored, colours
 * under 1% of counted pixels dropped, near-duplicates (distance < 80) merged, at most 25.
 */
export function canvasPalette(data: Uint8ClampedArray, w: number, h: number): string[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (let i = 0; i < Math.min(data.length, w * h * 4); i += 4) {
    if (data[i + 3]! < 128) continue;
    const q = (v: number) => 15 * Math.round(v / 15);
    const key = `${q(data[i]!)},${q(data[i + 1]!)},${q(data[i + 2]!)}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    total++;
  }
  const kept: number[][] = [];
  for (const [key, n] of [...counts].sort((a, b) => b[1] - a[1])) {
    if (n / total < 0.01) continue;
    const c = key.split(',').map(Number);
    if (!kept.some((k) => Math.hypot(c[0]! - k[0]!, c[1]! - k[1]!, c[2]! - k[2]!) < 80))
      kept.push(c);
    if (kept.length >= 25) break;
  }
  return kept.map(([r, g, b]) => formatColor({ r: r!, g: g!, b: b!, a: 1 }, 'HEX'));
}

const CONTEXTS = ['2d', 'webgl2', 'webgl', 'bitmaprenderer', 'experimental-webgl'];

/**
 * Canvas part of `m` (content.js:39785): context in use, backing size, backing / CSS width ratio.
 * Like legacy it probes with getContext, which returns the existing context of that type.
 */
export function canvasInfo(el: Element, cssWidth: number): CanvasInfo | null {
  if (!(el instanceof HTMLCanvasElement)) return null;
  let contextType: string | null = null;
  for (const type of CONTEXTS) {
    try {
      if (el.getContext(type)) {
        contextType = type;
        break;
      }
    } catch {
      // a context of another kind already exists: keep probing
    }
  }
  const ratio = el.width / cssWidth;
  return {
    contextType,
    width: el.width,
    height: el.height,
    pixelRatio: Number.isFinite(ratio) ? Math.round(100 * ratio) / 100 : 1,
  };
}
