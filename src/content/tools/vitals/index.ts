import Gauge from '@lucide/svelte/icons/gauge';
import {
  cumulativeLayoutShift,
  interactionToNextPaint,
  rating,
  type Shift,
} from '../../../lib/page/vitals';
import { addPainter, CHIP, draw, requestPaint, visibleRects } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop } from '../../core/session';
import { state } from '../../core/state.svelte';

/** Entry shapes Chromium reports (not in lib.dom for every TS target). */
type LcpEntry = PerformanceEntry & { element: Element | null };
type ShiftEntry = PerformanceEntry & {
  value: number;
  hadRecentInput: boolean;
  sources?: { node: Node | null }[];
};
type EventEntry = PerformanceEntry & { interactionId?: number };

const COLORS = { good: '#0CCE6B', 'needs-improvement': '#FFA400', poor: '#FF4E42' };
const SHIFT_COLOR = '#FFA400';
const MAX_SHIFT_BOXES = 30;

/** Plain (non-reactive) data: element refs must not become Svelte proxies. */
const data = {
  lcp: null as { time: number; el: Element | null } | null,
  shifts: [] as Shift[],
  /** Accumulated shift score per source element. */
  sources: new Map<Element, number>(),
  /** Worst duration per interactionId. */
  interactions: new Map<number, number>(),
};
let observers: PerformanceObserver[] = [];

function observe(type: string, fn: (entries: PerformanceEntry[]) => void, opts = {}): void {
  if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return;
  const o = new PerformanceObserver((list) => {
    fn(list.getEntries());
    requestPaint();
  });
  o.observe({ type, buffered: true, ...opts });
  observers.push(o);
}

function onLcp(entries: PerformanceEntry[]): void {
  const e = entries.at(-1) as LcpEntry | undefined;
  if (e) data.lcp = { time: e.startTime, el: e.element };
}

function onShift(entries: PerformanceEntry[]): void {
  for (const e of entries as ShiftEntry[]) {
    data.shifts.push({ value: e.value, startTime: e.startTime, hadRecentInput: e.hadRecentInput });
    for (const { node } of e.sources ?? []) {
      const el = node instanceof Element ? node : node?.parentElement;
      if (el) data.sources.set(el, (data.sources.get(el) ?? 0) + e.value);
    }
  }
}

function onEvent(entries: PerformanceEntry[]): void {
  for (const e of entries as EventEntry[]) {
    if (!e.interactionId) continue;
    const prev = data.interactions.get(e.interactionId) ?? 0;
    data.interactions.set(e.interactionId, Math.max(prev, e.duration));
  }
}

function reset(): void {
  for (const o of observers) o.disconnect();
  observers = [];
  data.lcp = null;
  data.shifts = [];
  data.sources.clear();
  data.interactions.clear();
}

export function setVitals(on: boolean): void {
  state.vitalsOn = on;
  reset();
  if (on) {
    observe('largest-contentful-paint', onLcp);
    observe('layout-shift', onShift);
    observe('event', onEvent, { durationThreshold: 16 });
  }
  requestPaint();
}

/** "LCP 1234 ms · CLS 0.012 · INP 80 ms", each part coloured by its rating. */
function drawChip(box: HTMLElement): void {
  const cls = cumulativeLayoutShift(data.shifts);
  const inp = interactionToNextPaint([...data.interactions.values()]);
  const chip = draw(
    box,
    `position:fixed;top:8px;left:8px;display:flex;gap:8px;background:rgba(20,20,20,.88);${CHIP};transform:none;padding:5px 8px`,
  );
  const part = (text: string, color: string) => draw(chip, `position:static;color:${color}`, text);
  part(
    data.lcp ? `LCP ${Math.round(data.lcp.time)} ms` : 'LCP –',
    data.lcp ? COLORS[rating('lcp', data.lcp.time)] : '#fff',
  );
  part(`CLS ${cls.toFixed(3)}`, COLORS[rating('cls', cls)]);
  part(
    inp === null ? 'INP –' : `INP ${Math.round(inp)} ms`,
    inp === null ? '#fff' : COLORS[rating('inp', inp)],
  );
}

export function initVitals(): void {
  registerItem({
    id: 'vitals',
    icon: Gauge,
    label: 'dock.vitals',
    key: 'w',
    run: () => setVitals(!state.vitalsOn),
    isActive: () => state.vitalsOn,
  });
  onStop(() => setVitals(false));
  addPainter('vitals', (box) => {
    if (state.paused || !state.vitalsOn) return;
    const shifted = [...data.sources].sort((a, b) => b[1] - a[1]).slice(0, MAX_SHIFT_BOXES);
    const lcpEl = data.lcp?.el ?? null;
    // every read before the first write
    const [lcpRect, ...shiftRects] = visibleRects([
      lcpEl ?? document.body,
      ...shifted.map((s) => s[0]),
    ]);
    const frag = document.createDocumentFragment();
    const box_ = (r: DOMRect, color: string, label: string) => {
      draw(
        frag,
        `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;outline:2px dashed ${color};box-sizing:border-box`,
      );
      draw(
        frag,
        `left:${r.left}px;top:${Math.max(0, r.top - 18)}px;background:${color};${CHIP};transform:none`,
        label,
      );
    };
    shiftRects.forEach((r, i) => r && box_(r, SHIFT_COLOR, `CLS ${shifted[i]![1].toFixed(3)}`));
    if (lcpEl && lcpRect && data.lcp)
      box_(lcpRect, COLORS[rating('lcp', data.lcp.time)], `LCP ${Math.round(data.lcp.time)} ms`);
    box.append(frag);
    drawChip(box);
  });
}
