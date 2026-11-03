import { compositeBackground, type BgLayer, type Rgba } from '../../lib/color';

export const TEXT =
  'h1 h2 h3 h4 h5 h6 p b i em strong u small mark code a label button td th blockquote pre sub sup del ins cite q'.split(
    ' ',
  );
export const BLOCK = 'li ul ol span div nav header footer section article'.split(' ');

/** Port of isTextHeavy (:44290). */
export function isTextHeavy(el: Element): boolean {
  const text = (el as HTMLElement).innerText?.trim();
  if (!text) return false;
  const tag = el.tagName.toLowerCase();
  if (TEXT.includes(tag)) return true;
  const kids = [...el.children];
  if (BLOCK.includes(tag))
    return !kids.some((c) => [...TEXT, ...BLOCK].includes(c.tagName.toLowerCase()));
  return !kids.length;
}

/** Pseudo-element (with content) and own background layers of `n`, top → bottom. */
export function layersOf(n: Element): BgLayer[] {
  const out: BgLayer[] = [];
  for (const pseudo of ['::before', '::after']) {
    const ps = getComputedStyle(n, pseudo);
    if (ps.content !== 'none') out.push({ color: ps.backgroundColor, image: ps.backgroundImage });
  }
  const s = getComputedStyle(n);
  out.push({ color: s.backgroundColor, image: s.backgroundImage });
  return out;
}

/**
 * Port of findBackgroundColor (:43977): the target, then everything painted under its centre
 * (elementsFromPoint), skipping its descendants, our UI and invisible elements. Off-screen
 * centre falls back to the ancestor chain like legacy (:44010). `at` overrides the probe point
 * (the visible part of a partly on-screen element).
 */
export function backgroundOf(el: Element, at?: { x: number; y: number }): Rgba | null {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  const x = at?.x ?? r.left + r.width / 2;
  const y = at?.y ?? r.top + r.height / 2;
  const onScreen = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
  const under: Element[] = [];
  if (onScreen) under.push(...document.elementsFromPoint(x, y));
  else for (let n = el.parentElement; n; n = n.parentElement) under.push(n);
  const layers = layersOf(el);
  for (const n of under) {
    if (n === el || el.contains(n) || n.tagName.toLowerCase() === 'bo-doi-ui') continue;
    const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) continue;
    layers.push(...layersOf(n));
  }
  return compositeBackground(layers);
}
