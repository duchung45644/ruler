export const layer = document.createElement('div');
layer.style.cssText = 'position:fixed;inset:0;pointer-events:none';

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
  shadow.append(layer);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    painters.clear();
    layer.replaceChildren();
    layer.remove();
  };
}
