import { hexOf } from '../../lib/element/style';
import { addPainter, draw, requestPaint } from '../core/overlay';

let targets: Element[] = [];
let off: (() => void) | null = null;

/** Same frame as the inspector highlight (spec §7): solid 1.5px accent, faint fill. */
function paint(box: HTMLElement): void {
  for (const el of targets) {
    if (!el.isConnected) continue;
    const r = el.getBoundingClientRect();
    draw(
      box,
      `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;box-sizing:border-box;border:1.5px solid #6366f1;background:#6366f112`,
    );
  }
}

/** Painter `sidepanel`: boxes over the elements a panel row points at (hover, colour, issue…). */
export function highlight(els: Element[]): void {
  targets = els;
  if (!els.length) return clearHighlights();
  off ??= addPainter('sidepanel', paint);
  requestPaint();
}

export function clearHighlights(): void {
  targets = [];
  off?.();
  off = null;
}

export const highlightCount = (): number => targets.length;

/** Scroll / resize move the boxes with the page. */
export const repaintHighlights = () => off && requestPaint();

const SKIP = ['meta', 'link', 'script', 'style', 'title', 'base', 'head'];

/** Port of canElementBeHighlighted (content.js:44371). */
export function canHighlight(el: Element): boolean {
  if (!el.isConnected || SKIP.includes(el.tagName.toLowerCase())) return false;
  const s = getComputedStyle(el);
  if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0)
    return false;
  const r = el.getBoundingClientRect();
  return r.width !== 0 || r.height !== 0;
}

type StyleMap = ReadonlyMap<Element, { colors: Set<string>; typographyKey?: string }>;

/** highlightElementsForColor (content.js:27171): any of text / background / border, by HEX. */
export function highlightForColor(map: StyleMap, color: string): void {
  const hex = hexOf(color);
  highlight(
    [...map].filter(([el, e]) => hex && e.colors.has(hex) && canHighlight(el)).map(([el]) => el),
  );
}

/** highlightElementsForTypography (content.js:27191). */
export function highlightForTypography(map: StyleMap, key: string): void {
  highlight(
    [...map].filter(([el, e]) => e.typographyKey === key && canHighlight(el)).map(([el]) => el),
  );
}
