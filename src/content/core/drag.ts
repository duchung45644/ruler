/** Shared drag (spec §9): while dragging and ~50ms after, page clicks/hover-inspect are swallowed. */
let drag: AbortController | null = null;
let justDragged = false;
let timer: ReturnType<typeof setTimeout> | undefined;

export const isDragging = (): boolean => drag !== null || justDragged;

export function startDrag(
  e: PointerEvent,
  onMove: (m: PointerEvent) => void,
  onEnd?: (u: PointerEvent) => void,
): void {
  e.preventDefault();
  e.stopImmediatePropagation();
  drag?.abort();
  const ac = (drag = new AbortController());
  const opts = { capture: true, signal: ac.signal };
  window.addEventListener('pointermove', onMove, opts);
  window.addEventListener(
    'pointerup',
    (u) => {
      ac.abort();
      drag = null;
      onEnd?.(u);
      justDragged = true;
      clearTimeout(timer);
      timer = setTimeout(() => (justDragged = false), 50);
    },
    opts,
  );
}

export function swallowAfterDrag(e: Event): boolean {
  if (!isDragging()) return false;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (e.type === 'click') justDragged = false;
  return true;
}

/** Install first in session start, so it runs before every tool's window-capture listener. */
export function installDragGuard(signal: AbortSignal): void {
  for (const type of ['mousedown', 'mouseup', 'click', 'mousemove'])
    window.addEventListener(type, swallowAfterDrag, { capture: true, signal });
  signal.addEventListener('abort', resetDrag, { once: true });
}

export function resetDrag(): void {
  drag?.abort();
  drag = null;
  justDragged = false;
  clearTimeout(timer);
}
