/** Before/after divider for the design overlay: one draggable vertical bar in the page DOM. */
import { clampPos } from '../../../lib/tools/overlay-image';
import { startDrag } from '../../core/drag';
import { ownNodes } from '../../core/events';
import { requestPaint } from '../../core/overlay';
import { sessionSignal } from '../../core/session';
import { overlay } from './images.svelte';

let bar: HTMLDivElement | null = null;

const BAR_W = 12;
const LINE = '#5B5BF0';

function makeBar(onDrop: () => void): HTMLDivElement {
  const el = document.createElement('div');
  el.dataset.pixellens = '';
  el.setAttribute('role', 'separator');
  el.setAttribute('aria-orientation', 'vertical');
  el.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return;
      startDrag(
        e,
        (m) => {
          overlay.prefs.splitPos = clampPos((m.clientX / innerWidth) * 100);
          requestPaint();
        },
        onDrop,
      );
    },
    { signal: sessionSignal() },
  );
  ownNodes.add(el);
  return el;
}

/** Draws the bar at the divider's viewport x (made on first use); `onDrop` commits after a drag. */
export function paintSplit(x: number, onDrop: () => void): void {
  bar ??= makeBar(onDrop);
  if (!bar.isConnected) document.documentElement.append(bar);
  const half = BAR_W / 2;
  bar.style.cssText = `all:initial;position:fixed;top:0;left:${x - half}px;width:${BAR_W}px;height:100vh;z-index:2147483647;cursor:ew-resize;pointer-events:auto;display:block;background:linear-gradient(to right,transparent ${half - 1}px,${LINE} ${half - 1}px,${LINE} ${half + 1}px,transparent ${half + 1}px);`;
}

/** Takes the bar off the page (split off, tool off, session stop). */
export function removeSplit(): void {
  if (!bar) return;
  bar.remove();
  ownNodes.delete(bar);
  bar = null; // remade next time with the new session's signal
}
