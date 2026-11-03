export const layer = document.createElement('div');
layer.style.cssText = 'position:fixed;inset:0;pointer-events:none';

const painters = new Map<string, { box: HTMLElement; paint: (layer: HTMLElement) => void }>();
let raf = 0;

export function addPainter(id: string, paint: (layer: HTMLElement) => void): () => void {
  const box = document.createElement('div');
  box.dataset.painter = id; // hideUi('keepHighlight') keeps only the inspector's box
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
  shadow.append(layer);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    painters.clear();
    layer.replaceChildren();
    layer.remove();
  };
}

/** Append an absolutely positioned div (shared by inspector/distance painters). */
export function draw(parent: HTMLElement, css: string, text?: string): HTMLElement {
  const d = document.createElement('div');
  d.style.cssText = `position:absolute;${css}`;
  if (text !== undefined) d.textContent = text;
  parent.append(d);
  return d;
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
    `left:${x}px;top:${y}px;transform:translate(${tx},${ty});font:700 10px/1 'Bo doi Geist Mono',ui-monospace,monospace;color:${color};white-space:nowrap`,
    String(Math.round(value)),
  );
}
