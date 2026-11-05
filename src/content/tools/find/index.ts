import TextSearch from '@lucide/svelte/icons/text-search';
import { isRendered } from '../../../lib/dom';
import { findAll, isVisible } from '../../../lib/find';
import { addPainter, draw, requestPaint } from '../../core/overlay';
import { registerItem, togglePopover } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import FindPopover from './FindPopover.svelte';

/** 3.08 / 3.09, port of the find popover (legacy-src/content.js:38404). */
export const find = { query: '', results: [] as Element[], hidden: 0, index: 0, count: 0 };

/** Responsive parent: the query runs in every frame and the counts are aggregated (1.33 / 8.21). */
export interface RemoteFind {
  on(): boolean;
  run(query: string): Promise<void>;
  step(d: -1 | 1): Promise<void>;
  clear(): void;
}
let remote: RemoteFind | null = null;
export function setRemoteFind(r: RemoteFind | null): void {
  remote = r;
}
let changed: (() => void) | null = null;
/** The popover's refresh, for counts that arrive later (a frame that loads while it is open). */
export function onFindChange(fn: (() => void) | null): void {
  changed = fn;
}
export const findChanged = (): void => changed?.();

function scrollToCurrent(): void {
  find.results[find.index]?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  });
  requestPaint();
}

export function runFind(query: string): void | Promise<void> {
  if (remote?.on()) return remote.run(query);
  const r = findAll(query, isVisible);
  Object.assign(find, { results: r.found, hidden: r.hidden, index: 0, count: r.found.length });
  state.findOn = r.found.length > 0;
  scrollToCurrent();
}

export function stepFind(d: -1 | 1): void | Promise<void> {
  if (remote?.on()) return remote.step(d);
  const n = find.results.length;
  if (n < 2) return;
  find.index = (find.index + d + n) % n;
  scrollToCurrent();
}

/** Frame side of find_goto: `i` < 0 drops the current-match highlight (it is in another frame). */
export function gotoFind(i: number): void {
  if (!Number.isInteger(i) || i >= find.results.length) return;
  find.index = i;
  scrollToCurrent();
}

/** Close: remember the query, drop highlights (1.31). */
export function clearFind(): void {
  remote?.clear();
  Object.assign(find, { results: [], hidden: 0, index: 0, count: 0 });
  state.findOn = false;
  requestPaint();
}

export function initFind(): void {
  registerItem({
    id: 'find',
    icon: TextSearch,
    label: 'dock.find',
    key: 'f',
    group: 'utilities',
    popover: FindPopover,
    run: () => togglePopover('find'),
    isActive: () => state.findOn,
  });
  onStop(clearFind);
  const opts = { signal: sessionSignal(), passive: true, capture: true }; // capture: nested scrollers too
  window.addEventListener('scroll', requestPaint, opts);
  window.addEventListener('resize', requestPaint, opts);
  addPainter('find', (box) => {
    find.results.forEach((el, i) => {
      if (!isRendered(el)) return;
      const r = el.getBoundingClientRect();
      const pct = i === find.index ? 45 : 20;
      draw(
        box,
        `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background:color-mix(in srgb,var(--color-accent) ${pct}%,transparent)`,
      );
    });
  });
}
