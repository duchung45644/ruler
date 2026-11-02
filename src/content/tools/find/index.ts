import TextSearch from '@lucide/svelte/icons/text-search';
import { isRendered } from '../../../lib/dom';
import { findAll, isVisible } from '../../../lib/find';
import { addPainter, draw, requestPaint } from '../../core/overlay';
import { registerItem, togglePopover } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import FindPopover from './FindPopover.svelte';

/** 3.08 / 3.09, port of the find popover (legacy-src/content.js:38404). */
export const find = { query: '', results: [] as Element[], hidden: 0, index: 0 };

function scrollToCurrent(): void {
  find.results[find.index]?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  });
  requestPaint();
}

export function runFind(query: string): void {
  const r = findAll(query, isVisible);
  Object.assign(find, { results: r.found, hidden: r.hidden, index: 0 });
  state.findOn = r.found.length > 0;
  scrollToCurrent();
}

export function stepFind(d: -1 | 1): void {
  const n = find.results.length;
  if (n < 2) return;
  find.index = (find.index + d + n) % n;
  scrollToCurrent();
}

/** Close: remember the query, drop highlights (1.31). */
export function clearFind(): void {
  Object.assign(find, { results: [], hidden: 0, index: 0 });
  state.findOn = false;
  requestPaint();
}

export function initFind(): void {
  registerItem({
    id: 'find',
    icon: TextSearch,
    label: 'dock.find',
    key: '7',
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
