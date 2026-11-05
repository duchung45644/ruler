import RulerDimensionLine from '@lucide/svelte/icons/ruler-dimension-line';
import {
  breakpointLabel,
  mediaConditions,
  parseBreakpoints,
  type Breakpoint,
} from '../../../lib/breakpoints';
import { shadowRoots } from '../../../lib/dom';
import { fetchCrossOrigin, fetchedCopy } from '../../sidepanel/rules';
import { getSettings, updateSettings } from '../../../lib/settings';
import { addPainter, draw, requestPaint } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';

const COLORS = { min: '#008C21', max: '#0891B2', both: '#E8A23D' };
const isOwn = (el: Element) => el.localName === 'bo-doi-ui';
let found: Breakpoint[] = [];

/** Breakpoints shown right now (empty while the tool is off); responsive mode builds frames from them (Q5). */
export const currentBreakpoints = (): Breakpoint[] => (state.breakpointsOn ? [...found] : []);

function scan(): string[] {
  const blocked: string[] = [];
  const roots = [document, ...shadowRoots(document, isOwn)];
  found = parseBreakpoints(mediaConditions(roots, fetchedCopy, blocked));
  requestPaint();
  return blocked;
}

function apply(on: boolean): void {
  state.breakpointsOn = on;
  if (!on) {
    found = [];
    requestPaint();
    return;
  }
  // 3.06 rescan on every enable (legacy showBreakpointLines :48981). Sites serving CSS from a CDN
  // (github.githubassets.com…) are unreadable cross-origin: fetch copies via the background when
  // <all_urls> is granted, then rescan
  const blocked = scan();
  if (blocked.length) void fetchCrossOrigin(blocked).then(() => state.breakpointsOn && scan());
}

export async function initBreakpoints(): Promise<void> {
  registerItem({
    id: 'breakpoints',
    icon: RulerDimensionLine,
    label: 'dock.breakpoints',
    key: 'b',
    group: 'inspectTools',
    run: () => {
      apply(!state.breakpointsOn);
      void updateSettings({ breakpointsIsOn: state.breakpointsOn });
    },
    isActive: () => state.breakpointsOn,
  });
  const signal = sessionSignal();
  window.addEventListener('scroll', requestPaint, { signal, passive: true });
  // a stylesheet that loads after enabling (or after an auto-restore at injection) adds breakpoints
  document.addEventListener(
    'load',
    (e) => {
      if (state.breakpointsOn && e.target instanceof HTMLLinkElement) apply(true);
    },
    { signal, capture: true },
  );
  onStop(() => apply(false));
  addPainter('breakpoints', (box) => {
    for (const b of found) {
      const left = b.width - scrollX;
      const c = COLORS[b.kind];
      draw(box, `top:0;left:${left}px;width:1px;height:100%;background:${c};opacity:0.6`);
      draw(
        box,
        `top:8px;left:${left}px;transform:translateX(-50%);background:${c};color:#fff;font:600 11px/normal system-ui,sans-serif;padding:2px 6px;border-radius:4px;white-space:nowrap`,
        breakpointLabel(b),
      );
    }
  });
  const { breakpointsIsOn } = await getSettings();
  if (breakpointsIsOn && !signal.aborted) apply(true);
}
