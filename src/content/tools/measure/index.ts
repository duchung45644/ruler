import SquareDashed from '@lucide/svelte/icons/square-dashed';
import {
  applyField,
  fieldValues,
  hitBox,
  normBox,
  nudgeBox,
  resizeBox,
  type Box,
  type Field,
} from '../../../lib/tools/measure';
import { measureColor, measureGuides } from '../../../lib/ext/settings';
import { mountInShadow } from '../../../ui/mount';
import { isDragging, startDrag } from '../../core/drag';
import { isOwnEvent } from '../../core/events';
import { addKeyHandler } from '../../core/keys';
import { addPainter, draw, layer, requestPaint } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import { CHIP } from '../ruler';
import MeasurePanel from './MeasurePanel.svelte';

/** Area measure (3.17 / 3.18), port of unpacked/scripts/bd/measure-guides.js. */
let box: Box | null = null;
let unmountPanel: (() => void) | null = null;
let cursor = '';
export const prefs = { color: '#FF3B6B', guides: false };
/** Panel input sync, set by MeasurePanel; run by the painter once per frame. */
export const panelSync: { fn: (() => void) | null } = { fn: null };

const host = (): Element => (layer.getRootNode() as ShadowRoot).host ?? layer;
const live = () => state.measureOn && !state.paused;
const scroll = () => ({ x: scrollX, y: scrollY });
const page = () => ({
  width: document.documentElement.scrollWidth,
  height: document.documentElement.scrollHeight,
});

/** Exposed for tests and the panel. */
export const currentBox = (): Box | null => box;

export function setBox(b: Box | null): void {
  box = b;
  requestPaint();
}

export function setField(k: Field, v: number): void {
  const view = { ...scroll(), width: innerWidth, height: innerHeight };
  setBox(applyField(box, k, v, page(), view));
}

export const boxValues = (): Record<Field, number> | null => box && fieldValues(box, page());

export function savePrefs(): void {
  void measureColor.setValue(prefs.color);
  void measureGuides.setValue(prefs.guides);
  requestPaint();
}

function setCursor(c: string): void {
  if (c === cursor) return;
  cursor = c;
  document.documentElement.style.cursor = c;
}

/** Legacy toggle (bd/core.js:43): on opens the panel; off closes it and clears the box. */
export function setOn(next: boolean): void {
  state.measureOn = next;
  if (next) {
    const shadow = layer.getRootNode();
    if (shadow instanceof ShadowRoot && !unmountPanel)
      unmountPanel = mountInShadow(shadow, MeasurePanel);
  } else {
    unmountPanel?.();
    unmountPanel = null;
    box = null;
    setCursor('');
  }
  requestPaint();
}

function onPointerDown(e: PointerEvent): void {
  if (!live() || e.button !== 0 || isOwnEvent(e, host())) return;
  const { clientX: cx, clientY: cy } = e;
  const orig = box;
  const hit = orig && hitBox(orig, cx, cy, scroll());
  if (orig && hit) {
    startDrag(e, (m) => {
      if (hit.mode === 'move') {
        const dx = m.clientX - cx;
        const dy = m.clientY - cy;
        setBox({ l: orig.l + dx, t: orig.t + dy, r: orig.r + dx, b: orig.b + dy });
      } else setBox(resizeBox(orig, hit.corner, m.clientX + scrollX, m.clientY + scrollY));
    });
    return;
  }
  const x0 = cx + scrollX;
  const y0 = cy + scrollY;
  const to = (p: PointerEvent) => setBox(normBox(x0, y0, p.clientX + scrollX, p.clientY + scrollY));
  setBox(normBox(x0, y0, x0, y0));
  startDrag(e, to, (u) => {
    to(u);
    if (box && box.r - box.l < 2 && box.b - box.t < 2) setBox(null);
  });
}

export async function initMeasure(): Promise<void> {
  registerItem({
    id: 'measure',
    forward: true,
    icon: SquareDashed,
    label: 'dock.measure',
    key: 'm',
    group: 'designTools',
    run: () => setOn(!state.measureOn),
    isActive: () => state.measureOn,
  });
  const signal = sessionSignal();
  const opts = { capture: true, signal };
  window.addEventListener('pointerdown', onPointerDown, opts);
  window.addEventListener(
    'mousemove',
    (e) => {
      // the ruler owns the cursor while it is on (legacy pointermove :172)
      if (!live() || isDragging() || state.rulerOn) return;
      const hit = box && hitBox(box, e.clientX, e.clientY, scroll());
      setCursor(
        !hit
          ? ''
          : hit.mode === 'move'
            ? 'move'
            : hit.corner === 'tl' || hit.corner === 'br'
              ? 'nwse-resize'
              : 'nesw-resize',
      );
    },
    opts,
  );
  window.addEventListener('scroll', requestPaint, { signal, passive: true });
  onStop(
    addKeyHandler((e) => {
      if (!box) return false;
      if (e.key === 'Escape') {
        setBox(null);
        return true;
      }
      const next = state.measureOn && nudgeBox(box, e);
      if (!next) return false;
      setBox(next);
      return true;
    }),
  );
  onStop(() => setOn(false));
  addPainter('measure', (layerBox) => {
    panelSync.fn?.();
    if (!box) return;
    const c = prefs.color;
    const { l, t, r, b } = box;
    const x = l - scrollX;
    const y = t - scrollY;
    const w = r - l;
    const h = b - t;
    if (prefs.guides) {
      // spec §7: solid lines, not the legacy dashed ones
      const g = `background:${c};opacity:.7`;
      draw(layerBox, `left:0;right:0;top:${y}px;height:1px;${g}`);
      draw(layerBox, `left:0;right:0;top:${y + h}px;height:1px;${g}`);
      draw(layerBox, `top:0;bottom:0;left:${x}px;width:1px;${g}`);
      draw(layerBox, `top:0;bottom:0;left:${x + w}px;width:1px;${g}`);
    }
    const m = draw(
      layerBox,
      `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border:1px solid ${c};background:color-mix(in srgb,${c} 12%,transparent)`,
    );
    draw(
      m,
      `${CHIP};background:${c};left:50%;top:${h + 14}px`,
      `${Math.round(w)} × ${Math.round(h)}`,
    );
    draw(
      m,
      `${CHIP};background:#1f1f1f;left:0;top:-14px;transform:translate(0,-50%)`,
      `x ${Math.round(l)}  y ${Math.round(t)}`,
    );
  });
  const [color, guides] = await Promise.all([measureColor.getValue(), measureGuides.getValue()]);
  if (signal.aborted) return;
  Object.assign(prefs, { color, guides });
  requestPaint();
}
