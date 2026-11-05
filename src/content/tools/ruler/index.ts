import RulerIcon from '@lucide/svelte/icons/ruler';
import { guideGaps, nearestGuide, RULER, snapPos, ticks, type Guide } from '../../../lib/guides';
import { getSettings, updateSettings } from '../../../lib/settings';
import { resetDrag, startDrag } from '../../core/drag';
import { isOwnEvent, pageElementAt } from '../../core/events';
import { addPainter, draw, layer, requestPaint } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';

const GUIDE = '#00B3FF';
const HOT = '#FF3B6B';
export const CHIP =
  "font:600 11px/1 'Bo doi Geist Mono',ui-monospace,monospace;color:#fff;padding:3px 5px;border-radius:4px;white-space:nowrap;transform:translate(-50%,-50%)";

/** Page guides: kept and drawn for the session; created/dragged only while the ruler is on (3.05 / 3.16). */
let guides: Guide[] = [];
let hot: Guide | null = null;
let rulers: HTMLElement | null = null;
let crossX: HTMLElement | null = null;
let crossY: HTMLElement | null = null;
let moveCursor = false;

const host = (): Element => (layer.getRootNode() as ShadowRoot).host ?? layer;
const scroll = () => ({ x: scrollX, y: scrollY });
const live = () => state.rulerOn && !state.paused;

/** Exposed for tests. */
export const currentGuides = (): readonly Guide[] => guides;

function setCursor(on: boolean): void {
  if (on === moveCursor) return;
  moveCursor = on;
  document.documentElement.style.cursor = on ? 'move' : '';
}

/** One strip: 8/6/4px ticks, mono 9px numbers on major ticks (legacy createHorizontalRuler :48166). */
function strip(vertical: boolean): void {
  const s = draw(
    rulers!,
    vertical
      ? `left:0;top:0;width:${RULER}px;height:100%;border-right:1px solid var(--color-line)`
      : `left:0;top:0;height:${RULER}px;width:100%;border-bottom:1px solid var(--color-line)`,
  );
  s.style.background = 'var(--color-surface)';
  s.style.overflow = 'hidden';
  for (const { at, kind } of ticks(vertical ? innerHeight : innerWidth)) {
    const size = kind === 'major' ? 8 : kind === 'medium' ? 6 : 4;
    draw(
      s,
      vertical
        ? `right:0;top:${at}px;height:1px;width:${size}px;background:var(--color-fg-muted)`
        : `bottom:0;left:${at}px;width:1px;height:${size}px;background:var(--color-fg-muted)`,
    );
    if (kind === 'major')
      draw(
        s,
        `font:9px/1 var(--font-mono);color:var(--color-fg-muted);white-space:nowrap;${
          vertical
            ? `left:2px;top:${at + 2}px;transform:rotate(-90deg);transform-origin:left top`
            : `left:${at + 2}px;top:2px`
        }`,
        String(at),
      );
  }
  // crosshair: moved straight from mousemove
  const cross = draw(
    s,
    vertical
      ? 'left:0;top:-10px;width:100%;height:1px;background:var(--color-accent)'
      : 'top:0;left:-10px;height:100%;width:1px;background:var(--color-accent)',
  );
  if (vertical) crossY = cross;
  else crossX = cross;
}

/** Persistent DOM, not a painter; rebuilt on resize. */
function buildRulers(): void {
  rulers?.remove();
  rulers = document.createElement('div');
  rulers.style.cssText = 'position:fixed;inset:0;pointer-events:none';
  layer.prepend(rulers); // under the painters: the zone tint lies over it
  strip(false);
  strip(true);
}

function apply(on: boolean): void {
  state.rulerOn = on;
  if (on) buildRulers();
  else {
    rulers?.remove();
    rulers = crossX = crossY = null;
    setCursor(false);
    if (hot) resetDrag(); // legacy core.js:44 ends the drag
    hot = null;
  }
  requestPaint();
}

/** Legacy snapGuide (measure-guides.js:106). */
function snap(g: Guide, cx: number, cy: number): void {
  const r = pageElementAt(cx, cy, host())?.getBoundingClientRect();
  const edges = !r
    ? []
    : g.axis === 'h'
      ? [r.top, r.bottom, r.top + r.height / 2].map((v) => v + scrollY)
      : [r.left, r.right, r.left + r.width / 2].map((v) => v + scrollX);
  g.pos = snapPos(g.axis === 'h' ? cy + scrollY : cx + scrollX, edges);
}

function onPointerDown(e: PointerEvent): void {
  if (!live() || e.button !== 0 || isOwnEvent(e, host())) return;
  const { clientX: cx, clientY: cy } = e;
  let g = nearestGuide(guides, cx, cy, scroll());
  if (!g && (cy < RULER || cx < RULER)) {
    // the top strip makes a vertical guide, the left strip a horizontal one
    g = cy < RULER ? { axis: 'v', pos: cx + scrollX } : { axis: 'h', pos: cy + scrollY };
    guides.push(g);
  }
  if (!g) return;
  const g0 = (hot = g);
  startDrag(
    e,
    (m) => {
      snap(g0, m.clientX, m.clientY);
      requestPaint();
    },
    (u) => {
      // dropped back on the strip it came from: remove
      if (g0.axis === 'v' ? u.clientY < RULER : u.clientX < RULER)
        guides = guides.filter((x) => x !== g0);
      hot = null;
      requestPaint();
    },
  );
  requestPaint();
}

export async function initRuler(): Promise<void> {
  registerItem({
    id: 'ruler',
    forward: true,
    icon: RulerIcon,
    label: 'dock.ruler',
    key: 'r',
    group: 'inspectTools',
    run: () => {
      apply(!state.rulerOn);
      if (!state.inFrame) void updateSettings({ rulerIsOn: state.rulerOn });
    },
    isActive: () => state.rulerOn,
  });
  const signal = sessionSignal();
  const opts = { capture: true, signal };
  // registered before initInspector (initTools order), so startDrag stops the inspector's block
  window.addEventListener('pointerdown', onPointerDown, opts);
  window.addEventListener(
    'mousemove',
    (e) => {
      if (!live()) return;
      if (crossX) crossX.style.left = `${e.clientX}px`;
      if (crossY) crossY.style.top = `${e.clientY}px`;
      setCursor(!!nearestGuide(guides, e.clientX, e.clientY, scroll()));
    },
    opts,
  );
  window.addEventListener(
    'dblclick',
    (e) => {
      if (!live() || isOwnEvent(e, host())) return;
      const g = nearestGuide(guides, e.clientX, e.clientY, scroll());
      if (!g) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      guides = guides.filter((x) => x !== g);
      setCursor(false);
      requestPaint();
    },
    opts,
  );
  window.addEventListener('resize', () => state.rulerOn && buildRulers(), { signal });
  window.addEventListener('scroll', requestPaint, { signal, passive: true });
  onStop(() => {
    apply(false); // not persisted: next session restores it (1.43)
    guides = [];
    hot = null;
  });
  addPainter('ruler', (box) => {
    // legacy measure-guides.js:30-57: only the zone tint follows the ruler; guides always draw
    if (state.rulerOn) {
      const zone = 'background:rgba(0,179,255,.08)';
      draw(box, `left:0;top:0;width:100%;height:${RULER}px;${zone}`);
      draw(box, `left:0;top:0;width:${RULER}px;height:100%;${zone}`);
    }
    for (const g of guides) {
      const c = g === hot ? HOT : GUIDE;
      const p = g.pos - (g.axis === 'h' ? scrollY : scrollX);
      draw(
        box,
        g.axis === 'h'
          ? `left:0;right:0;top:${p}px;height:1px;background:${c}`
          : `top:0;bottom:0;left:${p}px;width:1px;background:${c}`,
      );
      draw(
        box,
        `${CHIP};background:${GUIDE};${g.axis === 'h' ? `top:${p}px;left:${RULER + 22}px` : `left:${p}px;top:${RULER + 10}px`}`,
        String(Math.round(g.pos)),
      );
    }
    const of = (axis: Guide['axis']) => guides.filter((g) => g.axis === axis).map((g) => g.pos);
    for (const { mid, value } of guideGaps(of('h')))
      draw(
        box,
        `${CHIP};background:#1f1f1f;top:${mid - scrollY}px;left:${innerWidth / 2}px`,
        String(Math.round(value)),
      );
    for (const { mid, value } of guideGaps(of('v')))
      draw(
        box,
        `${CHIP};background:#1f1f1f;left:${mid - scrollX}px;top:${innerHeight / 2}px`,
        String(Math.round(value)),
      );
  });
  const { rulerIsOn } = await getSettings();
  if (rulerIsOn && !signal.aborted && !state.inFrame) apply(true);
}
