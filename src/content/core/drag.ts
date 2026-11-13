import { state } from './state.svelte';
import { agentEvents } from './events';

/** Shared drag (spec §9): while dragging and ~50ms after, page clicks/hover-inspect are swallowed. */
let drag: AbortController | null = null;
let justDragged = false;
let timer: ReturnType<typeof setTimeout> | undefined;

export const isDragging = (): boolean => drag !== null || justDragged;

export function startDrag(
  e: PointerEvent,
  onMove: (m: PointerEvent) => void,
  onEnd?: (u: PointerEvent) => void,
  onDone?: () => void, // any teardown, incl. blur and abort
): void {
  if (state.capturing) return; // capture UI owns the pointer
  e.preventDefault();
  e.stopImmediatePropagation();
  drag?.abort();
  const ac = (drag = new AbortController());
  const opts = { capture: true, signal: ac.signal };
  const end = (u: Event) => {
    if (u.type === 'blur' && u.target instanceof Node) return; // capture also sees element blurs; only the window's own ends it
    if (drag !== ac) return; // already ended (guard and own listener both see pointerup)
    ac.abort();
    drag = null;
    finish = null;
    justDragged = true; // before onEnd: the click is swallowed even if onEnd throws
    clearTimeout(timer);
    timer = setTimeout(() => (justDragged = false), 50);
    if (u instanceof PointerEvent) onEnd?.(u);
  };
  finish = end;
  if (onDone) ac.signal.addEventListener('abort', onDone, { once: true });
  window.addEventListener('pointermove', onMove, opts);
  for (const type of ['pointerup', 'pointercancel', 'blur'])
    window.addEventListener(type, end, opts);
}

/** Ends the active drag; set by startDrag so the guard can finish it before swallowing pointerup. */
let finish: ((u: Event) => void) | null = null;

export function swallowAfterDrag(e: Event): boolean {
  if (agentEvents.has(e)) return false; // the agent's clicks are never part of a drag
  if (e.type === 'pointerdown' || e.type === 'pointerup' || e.type === 'pointercancel') {
    if (!drag) return false; // only mid-drag, so a quick re-grab after a drop still works
    if (e.type !== 'pointerdown') finish?.(e);
  } else if (!isDragging()) return false;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (e.type === 'click') justDragged = false;
  return true;
}

/** Install first in session start, so it runs before every tool's window-capture listener. */
export function installDragGuard(signal: AbortSignal): void {
  for (const type of [
    'pointerdown',
    'pointerup',
    'pointercancel',
    'mousedown',
    'mouseup',
    'click',
    'mousemove',
  ])
    window.addEventListener(type, swallowAfterDrag, { capture: true, signal });
  signal.addEventListener('abort', resetDrag, { once: true });
}

export function resetDrag(): void {
  drag?.abort();
  drag = null;
  finish = null;
  justDragged = false;
  clearTimeout(timer);
}
