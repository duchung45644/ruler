import ListOrdered from '@lucide/svelte/icons/list-ordered';
import { isOwnHost } from '../../../lib/dom/dom';
import { tabOrder, touchesPage } from '../../../lib/dom/tab-order';
import { ownNodes } from '../../core/events';
import { addPainter, draw, requestPaint, visibleRects } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop } from '../../core/session';
import { state } from '../../core/state.svelte';

const COLOR = '#E91E63';
const SVG = 'http://www.w3.org/2000/svg';
const isOwn = (el: Element) => isOwnHost(el) || ownNodes.has(el);

/** Elements in Tab order; rescanned (debounced) while the page changes. */
let order: HTMLElement[] = [];
let observer: MutationObserver | null = null;
let timer = 0;

function rescan(): void {
  order = tabOrder(document.documentElement, isOwn);
  requestPaint();
}

function scheduleRescan(records: MutationRecord[]): void {
  // our overlay images / split bar restyle on every paint: reacting to them would loop
  if (!touchesPage(records, isOwn)) return;
  clearTimeout(timer);
  timer = window.setTimeout(rescan, 250);
}

export function setTabOrder(on: boolean): void {
  state.tabOrderOn = on;
  observer?.disconnect();
  observer = null;
  clearTimeout(timer);
  if (on) {
    rescan();
    observer = new MutationObserver(scheduleRescan);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'hidden', 'inert', 'href', 'style', 'class'],
    });
  } else {
    order = [];
    requestPaint();
  }
}

/** Line through the centres of consecutive on-screen stops. */
function drawLines(box: HTMLElement, rects: (DOMRect | null)[]): void {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('style', 'position:fixed;inset:0;width:100%;height:100%;overflow:visible');
  let d = '';
  let prev: DOMRect | null = null;
  for (const r of rects) {
    if (r && prev) {
      const [x1, y1] = [prev.left + prev.width / 2, prev.top + prev.height / 2];
      d += `M${x1} ${y1}L${r.left + r.width / 2} ${r.top + r.height / 2}`;
    }
    prev = r;
  }
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', COLOR);
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-dasharray', '4 3');
  svg.append(path);
  box.append(svg);
}

export function initTabOrder(): void {
  registerItem({
    id: 'taborder',
    icon: ListOrdered,
    label: 'dock.tabOrder',
    key: 't',
    run: () => setTabOrder(!state.tabOrderOn),
    isActive: () => state.tabOrderOn,
  });
  onStop(() => setTabOrder(false));
  addPainter('taborder', (box) => {
    if (state.paused || !order.length) return;
    const rects = visibleRects(order); // every read before the first write
    const frag = document.createDocumentFragment();
    rects.forEach((r, i) => {
      if (!r) return;
      draw(
        frag,
        `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;outline:1.5px solid ${COLOR};box-sizing:border-box`,
      );
      draw(
        frag,
        `left:${r.left}px;top:${r.top}px;transform:translate(-50%,-50%);min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:${COLOR};color:#fff;font:600 11px/18px ui-monospace,monospace;text-align:center`,
        String(i + 1),
      );
    });
    drawLines(box, rects);
    box.append(frag);
  });
}
