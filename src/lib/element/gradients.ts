import type { Gradient } from './types';
import { splitTopLevel } from './style';

const COLOR_START = /^(?:rgba?|oklab|oklch|lab|lch|hwb|color)\(/;
const STOP =
  /^((?:rgba?|oklab|oklch|lab|lch|hwb)\([^)]+\)|color\([^)]+\))(?:\s+([\d.]+)(px|%|deg))?$/;
const SIDE_ANGLES: Record<string, number> = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
  'top right': 45,
  'right top': 45,
  'bottom right': 135,
  'right bottom': 135,
  'bottom left': 225,
  'left bottom': 225,
  'top left': 315,
  'left top': 315,
};

/** Port of `P` (content.js:40238): each top-level `*-gradient(…)` of a background-image. */
export function splitGradients(image: string): string[] {
  const out: string[] = [];
  const re = /(?:repeating-)?(?:linear|radial|conic)-gradient\(/gi;
  for (let m = re.exec(image); m; m = re.exec(image)) {
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < image.length && depth; i++) {
      if (image[i] === '(') depth++;
      else if (image[i] === ')') depth--;
    }
    if (depth) break;
    out.push(image.slice(m.index, i));
    re.lastIndex = i;
  }
  return out;
}

/** Port of `F` (content.js:40275): type, angle / shape, colour stops with filled-in positions. */
export function parseGradient(src: string): Gradient | null {
  const m = /^((?:repeating-)?(?:linear|radial|conic)-gradient)\((.+)\)$/i.exec(src);
  if (!m) return null;
  const type = m[1]!.toLowerCase();
  const parts = splitTopLevel(m[2]!);
  const g: Gradient = { type, angle: null, shape: null, stops: [], raw: src };
  let first = 0;
  const head = parts[0];
  if (type.includes('linear')) {
    const deg = head && /^(-?[\d.]+)deg$/.exec(head);
    if (deg) {
      g.angle = parseFloat(deg[1]!);
      first = 1;
    } else if (head?.startsWith('to ')) {
      g.angle = SIDE_ANGLES[head.slice(3).trim()] ?? 180;
      first = 1;
    } else g.angle = 180;
  } else if (head && !COLOR_START.test(head)) {
    if (type.includes('conic')) {
      const from = /from ([\d.]+)deg/.exec(head);
      if (from) g.angle = parseFloat(from[1]!);
    }
    g.shape = head;
    first = 1;
  }
  for (const part of parts.slice(first)) {
    const s = STOP.exec(part);
    if (s)
      g.stops.push({ color: s[1]!, position: s[2] ? parseFloat(s[2]) : null, unit: s[3] ?? '%' });
  }
  const stops = g.stops;
  if (stops.length && !stops.some((s) => s.unit === 'px')) {
    stops[0]!.position ??= 0;
    if (stops.length > 1) stops[stops.length - 1]!.position ??= 100;
    // spread unpositioned stops evenly between their positioned neighbours
    let last = 0;
    for (let i = 1; i < stops.length; i++) {
      const p = stops[i]!.position;
      if (p === null) continue;
      const from = stops[last]!.position!;
      for (let j = last + 1; j < i; j++)
        stops[j]!.position = from + ((p - from) / (i - last)) * (j - last);
      last = i;
    }
  }
  return g;
}

/** All gradients of a computed background-image (6.29). */
export function parseGradients(backgroundImage: string): Gradient[] {
  if (!backgroundImage.includes('gradient')) return [];
  return splitGradients(backgroundImage)
    .map(parseGradient)
    .filter((g): g is Gradient => !!g);
}
