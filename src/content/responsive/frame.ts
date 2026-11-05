/** Responsive frame hot paths: resize handles and the load timer (8.12–8.14; spec §9). */
import { clampSize, type Viewport } from '../../lib/responsive/viewports';
import { startDrag } from '../core/drag';

export type Edge = 'right' | 'bottom' | 'corner';

/** A frame that has not said `ready_for_state_sync` by then shows the timeout message. */
export const LOAD_TIMEOUT_MS = 15_000;

/** Size after dragging `edge` by (dx, dy) from `start`; floor 200×300 (clampSize 'drag'). */
export function dragSize(
  start: { width: number; height: number },
  edge: Edge,
  dx: number,
  dy: number,
): { width: number; height: number } {
  return clampSize(
    edge === 'bottom' ? start.width : start.width + dx,
    edge === 'right' ? start.height : start.height + dy,
    'drag',
  );
}

/**
 * Drag a handle via core/drag.ts (which also swallows the click ~50ms after). `onSize` runs per
 * move, `onBusy(true/false)` brackets the drag so the shell can turn off iframe pointer events.
 */
export function startResize(
  e: PointerEvent,
  edge: Edge,
  vp: Pick<Viewport, 'width' | 'height'>,
  onSize: (s: { width: number; height: number }) => void,
  onBusy: (busy: boolean) => void,
): void {
  if (e.button !== 0) return;
  const start = { width: vp.width, height: vp.height };
  const { clientX: x0, clientY: y0 } = e;
  startDrag(
    e,
    (m) => {
      onBusy(true); // on move, not here: startDrag may refuse (capture UI owns the pointer)
      onSize(dragSize(start, edge, m.clientX - x0, m.clientY - y0));
    },
    undefined,
    () => onBusy(false),
  );
}

/** 15s load watchdog; `ready()` disarms it. Task 9 refines what a timeout means (blocked page). */
export function loadTimer(onTimeout: () => void, ms = LOAD_TIMEOUT_MS) {
  let t: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
    t = undefined;
    onTimeout();
  }, ms);
  const cancel = () => {
    clearTimeout(t);
    t = undefined;
  };
  return { ready: cancel, cancel };
}
