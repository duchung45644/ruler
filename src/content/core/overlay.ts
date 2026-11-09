export const layer = document.createElement('div');
layer.style.cssText = 'position:fixed;inset:0;pointer-events:none';

/** Session UI host (the layer's shadow host); the layer itself when unmounted. */
export const host = (): HTMLElement =>
  ((layer.getRootNode() as ShadowRoot).host as HTMLElement | undefined) ?? layer;
export const scroll = () => ({ x: scrollX, y: scrollY });
/** Label chip shared by ruler and measure painters. */
export const CHIP =
  "font:600 11px/1 'iodob Geist Mono',ui-monospace,monospace;color:#fff;padding:3px 5px;border-radius:4px;white-space:nowrap;transform:translate(-50%,-50%)";

const painters = new Map<string, { box: HTMLElement; paint: (layer: HTMLElement) => void }>();
let raf = 0;

export function addPainter(id: string, paint: (layer: HTMLElement) => void): () => void {
  const box = document.createElement('div');
  layer.append(box);
  painters.set(id, { box, paint });
  return () => {
    box.remove();
    painters.delete(id);
  };
}

export function requestPaint(): void {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    for (const { box, paint } of painters.values()) {
      box.replaceChildren(); // each frame repaints from scratch
      paint(box);
    }
  });
}

/** Attach the layer to the session shadow root; returns the detach fn (for onStop). */
export function mountLayer(shadow: ShadowRoot): () => void {
  // first in the shadow root: overlays (grid, highlights, ruler) paint under the dock and panels
  shadow.prepend(layer);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    painters.clear();
    layer.replaceChildren();
    layer.remove();
  };
}

/** Append an absolutely positioned div (shared by inspector/distance painters). */
export function draw(parent: ParentNode, css: string, text?: string): HTMLElement {
  const d = document.createElement('div');
  d.style.cssText = `position:absolute;${css}`;
  if (text !== undefined) d.textContent = text;
  parent.append(d);
  return d;
}

/**
 * Viewport rects of `els` that can show a box: connected, non-empty, meeting the viewport.
 * All reads happen here, before the caller writes anything: a getBoundingClientRect after an
 * append forces a layout that walks every box appended so far, which made painters O(n²).
 */
export function visibleRects(els: readonly Element[]): (DOMRect | null)[] {
  const vw = innerWidth;
  const vh = innerHeight;
  return els.map((el) => {
    if (!el.isConnected) return null;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 && r.height <= 0) return null;
    return r.bottom < 0 || r.right < 0 || r.top > vh || r.left > vw ? null : r;
  });
}

/** Boxes over `els`, reads first (visibleRects) then one append; `css` returning null skips one. */
export function drawBoxes(
  parent: ParentNode,
  els: readonly Element[],
  css: (i: number, r: DOMRect) => string | null,
): void {
  const frag = document.createDocumentFragment();
  visibleRects(els).forEach((r, i) => {
    const extra = r && css(i, r);
    if (r && extra !== null)
      draw(
        frag,
        `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;${extra}`,
      );
  });
  parent.append(frag);
}

/** Four full-width / full-height 1px lines through the edges x1, y1, x2, y2 (alignment guides). */
export function drawGuides(
  parent: ParentNode,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  css: string,
): void {
  draw(parent, `left:0;right:0;top:${y1}px;height:1px;${css}`);
  draw(parent, `left:0;right:0;top:${y2}px;height:1px;${css}`);
  draw(parent, `top:0;bottom:0;left:${x1}px;width:1px;${css}`);
  draw(parent, `top:0;bottom:0;left:${x2}px;width:1px;${css}`);
}

/** C-style number (spec §7): mono ~10px bold, no background; `tx`/`ty` = translate anchor. */
export function drawNumber(
  parent: HTMLElement,
  x: number,
  y: number,
  value: number,
  color: string,
  tx: string,
  ty: string,
): void {
  draw(
    parent,
    `left:${x}px;top:${y}px;transform:translate(${tx},${ty});font:700 10px/1 'iodob Geist Mono',ui-monospace,monospace;color:${color};white-space:nowrap`,
    String(Math.round(value)),
  );
}
