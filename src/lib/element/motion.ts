import type { Animation, Keyframe, Transition } from './types';
import { splitTopLevel, type StyleLike } from './style';

export type Bezier = [number, number, number, number];

export const EASING: Record<string, Bezier> = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
};

/** Keyword or `cubic-bezier(…)`; `steps()` and anything else → null (no curve to draw). */
export function parseEasing(s: string): Bezier | null {
  const t = s.trim();
  if (EASING[t]) return EASING[t];
  const m = /^cubic-bezier\(([^)]+)\)$/.exec(t);
  const n = m?.[1]!.split(',').map(Number);
  return n?.length === 4 && n.every(Number.isFinite) ? (n as Bezier) : null;
}

/** SVG path of the curve in a w × h box, y pointing down. */
export function easingPath([x1, y1, x2, y2]: Bezier, w: number, h: number): string {
  const p = (x: number, y: number) => `${x * w} ${h - y * h}`;
  return `M${p(0, 0)} C${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`;
}

const at = (list: string[], i: number, fallback: string) => list[i] || list[0] || fallback;

/** Port of `L` (content.js:40158); keyframes come from the page (getAnimations / @keyframes). */
export function animations(style: StyleLike, keyframes: (name: string) => Keyframe[]): Animation[] {
  const names = style.getPropertyValue('animation-name');
  if (!names || names === 'none') return [];
  const list = (p: string) => splitTopLevel(style.getPropertyValue(p));
  const dur = list('animation-duration');
  const fn = list('animation-timing-function');
  const delay = list('animation-delay');
  const count = list('animation-iteration-count');
  return names
    .split(',')
    .map((n) => n.trim())
    .map((name, i) => ({
      name,
      duration: at(dur, i, '0s'),
      timingFunction: at(fn, i, 'ease'),
      delay: at(delay, i, '0s'),
      iterationCount: at(count, i, '1'),
      keyframes: keyframes(name),
    }));
}

/** Port of `I` (content.js:40213). */
export function transitions(style: StyleLike): Transition[] {
  const props = style.getPropertyValue('transition-property');
  const duration = style.getPropertyValue('transition-duration');
  if (!props || props === 'none' || !duration || duration === '0s') return [];
  const dur = splitTopLevel(duration);
  const fn = splitTopLevel(style.getPropertyValue('transition-timing-function'));
  const delay = splitTopLevel(style.getPropertyValue('transition-delay'));
  return splitTopLevel(props).map((property, i) => ({
    property,
    duration: at(dur, i, '0s'),
    timingFunction: at(fn, i, 'ease'),
    delay: at(delay, i, '0s'),
  }));
}
