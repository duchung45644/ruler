import SquareDashedMousePointer from '@lucide/svelte/icons/square-dashed-mouse-pointer';
import ArrowUpToLine from '@lucide/svelte/icons/arrow-up-to-line';
import ArrowDownToLine from '@lucide/svelte/icons/arrow-down-to-line';
import { firstChildOf, isRendered, parentOf, siblingOf } from '../../../lib/dom';
import { mount, unmount } from 'svelte';
import { placeNear, sizeLabels, type Rect } from '../../../lib/geometry';
import { getSettings, pinHintDone, updateSettings } from '../../../lib/settings';
import { detectPageIsDark, measureColor } from '../../../lib/theme';
import { isOwnEvent, pageElementAt } from '../../core/events';
import { isDragging } from '../../core/drag';
import { addKeyHandler, onKey } from '../../core/keys';
import { addPainter, draw, drawNumber, layer, requestPaint } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { panelTarget, state } from '../../core/state.svelte';
import InspectPanel from './InspectPanel.svelte';
import PinnedInspector from './PinnedInspector.svelte';
import { addPin, clearPins, pinUi, signature } from './pins.svelte';
import { initDistance } from '../distance';

let host: Element | null = null;
const isOwn = (n: Element) => n === host;
/** Elements we came up from, so "child" walks back down the same branch (2.03, 2.04). */
// Untracked on purpose: every stack change goes through select(), which also sets
// state.selected, so the dock's isDisabled re-runs anyway.
let stack: Element[] = [];
/**
 * Floating panel stays hidden: pointer is over our UI (a pin, the dock), or a pin was just made.
 * Cleared by the next page mousemove or select, so a repaint can't bring it back over a pin.
 */
let panelHidden = false;
/** One-shot element pick (capture "Selected element"): the next page click goes here. */
let picker: ((el: Element | null) => void) | null = null;

/** Turns inspecting on until the user clicks an element (resolves it) or presses Esc (null). */
export function pickElement(): Promise<Element | null> {
  picker?.(null);
  const wasOn = state.inspectOn;
  state.inspectOn = true;
  return new Promise((resolve) => {
    const offKey = addKeyHandler((e) => {
      if (e.key !== 'Escape') return false;
      picker?.(null);
      return true;
    });
    const offStop = sessionSignal();
    const done = (el: Element | null) => {
      if (picker !== done) return;
      picker = null;
      offKey();
      offStop.removeEventListener('abort', cancel);
      state.inspectOn = wasOn;
      state.hovered = null;
      requestPaint();
      resolve(el);
    };
    const cancel = () => done(null);
    offStop.addEventListener('abort', cancel, { once: true });
    picker = done;
  });
}

function select(el: Element | null, keepStack = false): void {
  if (!keepStack) stack = [];
  panelHidden = false;
  state.selected = el;
  requestPaint();
}

export function setInspect(on: boolean): void {
  state.inspectOn = on;
  if (!on) {
    state.hovered = null;
    clearPins(); // 2.13 turning the inspector off drops every pin
  }
  void updateSettings({ inspectIsOn: on });
  requestPaint();
}

/** Port of selectElementById (content.js:47176): select from outside the page (side panel). */
export function selectElement(el: Element, { scroll = false } = {}): void {
  if (scroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  select(el);
}

/** Port of selectParent (legacy-src/content.js:46993). */
export function selectParent(): void {
  const cur = state.selected;
  const p = cur && parentOf(cur);
  if (!cur || !p) return;
  stack.push(cur);
  select(p, true);
}

/** The element selectChild would go to (the side panel's child row, 6.21). */
export const childOf = (el: Element): Element | null =>
  (el === state.selected && stack.at(-1)) || firstChildOf(el, isOwn);

/** Port of selectChild (legacy-src/content.js:47070). */
export function selectChild(): void {
  if (!state.selected) return;
  const c = stack.pop() ?? firstChildOf(state.selected, isOwn);
  if (c) select(c, true);
}

registerItem({
  id: 'inspect',
  icon: SquareDashedMousePointer,
  label: 'dock.inspect',
  key: 'i',
  group: 'inspectTools',
  run: () => setInspect(!state.inspectOn),
  isActive: () => state.inspectOn,
});
registerItem({
  id: 'select_parent',
  icon: ArrowUpToLine,
  label: 'dock.selectParent',
  group: 'selections',
  run: selectParent,
  isDisabled: () => !state.selected || !parentOf(state.selected),
});
registerItem({
  id: 'select_child',
  icon: ArrowDownToLine,
  label: 'dock.selectChild',
  group: 'selections',
  run: selectChild,
  isDisabled: () => !state.selected || (!stack.length && !firstChildOf(state.selected, isOwn)),
});

const px = (v: string) => parseFloat(v) || 0;

/** Four rects forming a band inside `o` (margin / padding overlays). */
function ring(
  box: HTMLElement,
  o: Rect,
  t: number,
  r: number,
  b: number,
  l: number,
  bg: string,
): void {
  const part = (x: number, y: number, w: number, h: number) => {
    if (w > 0 && h > 0)
      draw(box, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg}`);
  };
  part(o.x, o.y, o.width, t);
  part(o.x, o.y + o.height - b, o.width, b);
  part(o.x, o.y + t, l, o.height - t - b);
  part(o.x + o.width - r, o.y + t, r, o.height - t - b);
}

/** Frame + C-style size numbers (spec §7): solid 1.5px border, ~7% accent fill. */
function frame(box: HTMLElement, r: Rect, color: string): void {
  draw(
    box,
    `left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px;box-sizing:border-box;border:1.5px solid ${color};background:${color}12`,
  );
  const l = sizeLabels(r);
  drawNumber(box, l.width.x, l.width.y, r.width, color, '-50%', '-100%');
  drawNumber(box, l.height.x, l.height.y, r.height, color, '-100%', '-50%');
}

/** Hover: margin/padding bands + frame + `tag#id.class` (port of highlightElement :43810, getElementTagOverlay :44937). */
function paintHover(box: HTMLElement, el: Element, color: string): void {
  const r = el.getBoundingClientRect();
  const s = getComputedStyle(el);
  const [mt, mr, mb, ml] = [s.marginTop, s.marginRight, s.marginBottom, s.marginLeft].map(px) as [
    number,
    number,
    number,
    number,
  ];
  const outer = { x: r.x - ml, y: r.y - mt, width: r.width + ml + mr, height: r.height + mt + mb };
  ring(box, outer, mt, mr, mb, ml, 'rgba(246,178,107,.3)');
  const [bt, br, bb, bl] = [
    s.borderTopWidth,
    s.borderRightWidth,
    s.borderBottomWidth,
    s.borderLeftWidth,
  ].map(px) as [number, number, number, number];
  const inner = { x: r.x + bl, y: r.y + bt, width: r.width - bl - br, height: r.height - bt - bb };
  ring(
    box,
    inner,
    px(s.paddingTop),
    px(s.paddingRight),
    px(s.paddingBottom),
    px(s.paddingLeft),
    'rgba(147,196,125,.3)',
  );
  frame(box, r, color);
  const tag = signature(el);
  // below the element (the width number owns the top edge); flip above when there is no room
  const below = r.bottom + 22 < innerHeight;
  draw(
    box,
    `left:${Math.max(4, Math.min(r.x, innerWidth - 304))}px;top:${below ? r.bottom + 4 : r.y - 22}px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:2px 6px;border-radius:6px;background:rgba(24,24,27,.9);color:#e4e4e7;font:500 11px/14px 'Bo doi Geist',ui-sans-serif,system-ui,sans-serif`,
    tag,
  );
}

/** Place the panel near the mouse (hover) or the selection, above the dock (port of positionInspectPanel :47784). */
function placePanel(
  box: HTMLElement,
  shadow: ShadowRoot,
  mouse: { x: number; y: number } | null,
): void {
  const t = panelTarget();
  // edit mode keeps hover/select but drops the floating panel (legacy applyInspectVisuals(false))
  if (!t || !box.firstElementChild || panelHidden || state.paused || state.editOn) {
    box.style.visibility = 'hidden';
    return;
  }
  const dock = shadow.querySelector('[data-dock]')?.getBoundingClientRect();
  const avoid = dock && dock.height > 0 ? [dock] : [];
  // shrink rather than overlap the dock; legacy floor 80px
  box.style.maxHeight = `${Math.max(80, (avoid[0]?.top ?? innerHeight) - 32)}px`;
  const r = t.getBoundingClientRect();
  const p = t === state.hovered && mouse ? mouse : { x: r.right, y: r.top };
  const size = { width: box.offsetWidth, height: box.offsetHeight };
  const { x, y } = placeNear(p, size, { width: innerWidth, height: innerHeight }, avoid);
  box.style.transform = `translate(${x}px,${y}px)`;
  box.style.visibility = '';
}

/** Wire listeners/painters for one session (called from startSession after mountLayer). */
export async function initInspector(): Promise<void> {
  const signal = sessionSignal();
  host = (layer.getRootNode() as ShadowRoot).host ?? null;
  // ponytail: measure colour computed once per session; re-detect if pages that switch theme live matter
  const color = measureColor(detectPageIsDark(document));
  let mouse: { x: number; y: number } | null = null;
  let panelBox: HTMLElement | null = null;

  // Panel (2.10–2.12): Svelte content, TS position; pointer-events on so Task 8 can pin it.
  const shadow = layer.getRootNode();
  if (shadow instanceof ShadowRoot) {
    const box = (panelBox = document.createElement('div'));
    box.style.cssText = 'position:fixed;left:0;top:0;pointer-events:auto;visibility:hidden';
    const pinBox = document.createElement('div'); // below the live panel
    shadow.append(pinBox, box);
    const app = mount(InspectPanel, { target: box });
    const pinApp = mount(PinnedInspector, { target: pinBox, props: {} });
    const ro = new ResizeObserver(() => requestPaint()); // async content (image size) changes height
    ro.observe(box);
    onStop(() => {
      ro.disconnect();
      void unmount(app);
      void unmount(pinApp);
      clearPins();
      box.remove();
      pinBox.remove();
    });
    // off fn dropped on purpose: mountLayer's stop clears all painters
    addPainter('inspect-panel', () => placePanel(box, shadow, mouse));

    // 2.13 Space pins the visible panel (port of pinCurrentInspector :43481)
    onStop(
      onKey('Space', () => {
        const t = panelTarget();
        if (!state.inspectOn || !t || box.style.visibility === 'hidden') return false;
        const r = box.getBoundingClientRect();
        addPin(t, { x: r.left, y: r.top }, { width: r.width, height: r.height });
        void pinHintDone.setValue(true); // 2.14 first pin ends the hint
        panelHidden = true; // until the pointer is back on the page (not legacy's next paint)
        requestPaint();
        return true;
      }),
    );
  }

  const hover = (el: Element | null) => {
    state.hovered = el;
    requestPaint();
  };
  const hitTest = () => hover(mouse && host ? pageElementAt(mouse.x, mouse.y, host) : null);
  // text editing hands clicks to the page's contentEditable
  const live = () => state.inspectOn && !state.paused && !state.capturing && !state.textEditOn;
  const opts = { signal, capture: true };

  // 2.06 hover
  document.addEventListener(
    'mousemove',
    (e) => {
      if (isDragging()) return; // spec §9: no hover-inspect while dragging (the guard swallows)
      if (!live() || !host) return;
      if (isOwnEvent(e, host)) {
        // over a pin / the dock: hide the floating panel; over the panel itself keep it (Copy)
        if (!panelBox || !e.composedPath().includes(panelBox)) panelHidden = true;
        return hover(null);
      }
      panelHidden = false;
      mouse = { x: e.clientX, y: e.clientY };
      hitTest();
    },
    opts,
  );
  // 1.25 swallow press/menu events so page menus, click-outside handlers, selection and drag don't fire
  const block = (e: Event) => {
    if (isDragging()) return;
    if (!live() || !host || isOwnEvent(e, host)) return;
    e.preventDefault();
    e.stopImmediatePropagation(); // also stops page listeners on window registered after ours
  };
  for (const type of [
    'pointerdown',
    'mousedown',
    'pointerup',
    'mouseup',
    'dblclick',
    'contextmenu',
    'auxclick',
    'touchstart',
  ])
    window.addEventListener(type, block, opts); // window capture: the earliest point; page window-capture listeners added before ours still run first

  // 2.07 click to select / deselect
  window.addEventListener(
    'click',
    (e) => {
      if (isDragging()) return;
      if (!live() || !host || isOwnEvent(e, host)) return;
      e.preventDefault();
      e.stopImmediatePropagation(); // also stops page listeners on window registered after ours
      const el = pageElementAt(e.clientX, e.clientY, host);
      if (el && picker) return picker(el);
      if (el) select(el === state.selected ? null : el);
    },
    opts,
  );
  // 2.09 scroll re-measures; re-hover only while inspecting
  const refresh = () => (live() ? hitTest() : requestPaint());
  window.addEventListener('scroll', refresh, opts);
  // 1.24 arrow keys scroll like the wheel; any key (e.g. Esc) may change the selection
  window.addEventListener('keydown', () => requestPaint(), opts);
  // isolateEvents stops keys typed in our UI at the shadow root (routeKey listens there too)
  layer.getRootNode().addEventListener('keydown', () => requestPaint(), opts);
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') refresh();
    },
    opts,
  );
  // 2.09 blur / mouseleave clear hover
  window.addEventListener('blur', () => hover(null), opts);
  document.documentElement.addEventListener(
    'mouseleave',
    (e) => {
      if (e.relatedTarget && (e.relatedTarget as Node).nodeName !== 'HTML') return;
      mouse = null;
      hover(null);
    },
    opts,
  );

  // 2.05 Alt+Shift+Left/Right: previous / next sibling
  const sibling = (dir: -1 | 1) => (e: KeyboardEvent) => {
    if (!state.selected || e.ctrlKey || e.metaKey) return false;
    const n = siblingOf(state.selected, dir, isOwn);
    if (n) select(n);
    return true;
  };
  onStop(onKey('Alt+Shift+ArrowLeft', sibling(-1)));
  onStop(onKey('Alt+Shift+ArrowRight', sibling(1)));
  onStop(() => {
    stack = [];
    host = null;
    panelHidden = false;
  });

  // off fn dropped on purpose: mountLayer's stop clears all painters
  addPainter('inspector', (box) => {
    const sel = state.selected;
    if (sel && !isRendered(sel)) {
      state.selected = null; // 2.15 drop a selection that stopped rendering
    } else if (sel) {
      const r = sel.getBoundingClientRect();
      // solid alignment guides (spec §7: no dashes), port of drawAlignmentLines :45110
      const line = (css: string) => draw(box, `${css};background:${color};opacity:.5`);
      line(`left:0;right:0;top:${r.top}px;height:1px`);
      line(`left:0;right:0;top:${r.bottom - 1}px;height:1px`);
      line(`top:0;bottom:0;left:${r.left}px;width:1px`);
      line(`top:0;bottom:0;left:${r.right - 1}px;width:1px`);
      frame(box, r, color);
    }
    const h = state.hovered;
    if (h && h !== state.selected && h.isConnected && live()) paintHover(box, h, color);
    // 2.13 hovering a pin highlights its source element
    const src = pinUi.hovered;
    if (src && src !== h && src.isConnected) paintHover(box, src, color);
  });
  initDistance(color);

  // 2.02, 1.26 restore the saved toggle
  const { inspectIsOn } = await getSettings();
  if (!signal.aborted) state.inspectOn = inspectIsOn;
}
