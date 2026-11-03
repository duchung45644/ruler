import { addPainter, draw, requestPaint } from '../core/overlay';

let targets: Element[] = [];
let off: (() => void) | null = null;

function paint(box: HTMLElement): void {
  for (const el of targets) {
    if (!el.isConnected) continue;
    const r = el.getBoundingClientRect();
    draw(
      box,
      `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background:rgba(99,102,241,.25);outline:1px solid #6366f1`,
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

/** Scroll / resize move the boxes with the page. */
export const repaintHighlights = () => off && requestPaint();
