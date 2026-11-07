import { compositeBackground, type BgLayer, type Rgba } from '../../lib/color';

export const TEXT =
  'h1 h2 h3 h4 h5 h6 p b i em strong u small mark code a label button td th blockquote pre sub sup del ins cite q'.split(
    ' ',
  );
export const BLOCK = 'li ul ol span div nav header footer section article'.split(' ');

const TEXT_OR_BLOCK = new Set([...TEXT, ...BLOCK]);

/** Port of isTextHeavy (:44290). The structural test first: innerText lays out the whole subtree. */
export function isTextHeavy(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  const shaped = TEXT.includes(tag)
    ? true
    : BLOCK.includes(tag)
      ? ![...el.children].some((c) => TEXT_OR_BLOCK.has(c.tagName.toLowerCase()))
      : el.children.length === 0;
  return shaped && !!(el as HTMLElement).innerText?.trim();
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
/** Layers of an element below the target; null when it paints nothing (hidden / transparent). */
type Painted = BgLayer[] | null;
export type LayerMemo = Map<Element, Painted>;

function paintedLayers(n: Element, memo?: LayerMemo): Painted {
  let v = memo?.get(n);
  if (v !== undefined) return v;
  const s = getComputedStyle(n);
  v =
    s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05
      ? null
      : layersOf(n);
  memo?.set(n, v);
  return v;
}

/**
 * `memo` (one per synchronous scan, e.g. collectIssues) shares the styles of common ancestors.
 * Layers are produced lazily: compositeBackground stops at the first opaque layer (or the first
 * image), so the elements under it are never styled. Same result as building the full stack.
 */
export function backgroundOf(
  el: Element,
  at?: { x: number; y: number },
  memo?: LayerMemo,
): Rgba | null {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  const x = at?.x ?? r.left + r.width / 2;
  const y = at?.y ?? r.top + r.height / 2;
  const onScreen = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
  function* stack(): Generator<BgLayer> {
    yield* layersOf(el);
    const under: Iterable<Element> = onScreen ? document.elementsFromPoint(x, y) : ancestors(el);
    for (const n of under) {
      if (n === el || el.contains(n) || n.tagName.toLowerCase() === 'iodob-ui') continue;
      const l = paintedLayers(n, memo);
      if (l) yield* l;
    }
  }
  return compositeBackground(stack());
}

function* ancestors(el: Element): Generator<Element> {
  for (let n = el.parentElement; n; n = n.parentElement) yield n;
}
