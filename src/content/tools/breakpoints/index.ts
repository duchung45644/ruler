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

/** Line / label colors by kind; the responsive frame headers use the same (3.22). */
export const COLORS = { min: '#008C21', max: '#0891B2', both: '#E8A23D' };
const isOwn = (el: Element) => el.localName === 'iodob-ui';
let found: Breakpoint[] = [];

/** Breakpoints shown right now (empty while the tool is off); responsive mode builds frames from them (Q5). */
export const currentBreakpoints = (): Breakpoint[] => (state.breakpointsOn ? [...found] : []);

function read(blocked: string[] = []): Breakpoint[] {
  const roots = [document, ...shadowRoots(document, isOwn)];
  return parseBreakpoints(mediaConditions(roots, fetchedCopy, blocked));
}

function scan(): string[] {
  const blocked: string[] = [];
  found = read(blocked);
  requestPaint();
  return blocked;
}

/** The page's breakpoints now, whether or not the tool is on (MCP get_breakpoints). */
export const pageBreakpoints = (): Breakpoint[] => read();

/** The page declares at least one width breakpoint (responsive gates the B item on it, 8.22). */
export function pageHasBreakpoints(): boolean {
  try {
    return read().length > 0;
  } catch {
    return false;
  }
}

/** Responsive shell hook (Q5): there B toggles breakpoint-frames mode instead of drawing lines. */
export interface ResponsiveBreakpoints {
  active(): boolean;
  available(): boolean;
  /** Returns whether breakpoint mode is on afterwards. */
  toggle(on: boolean): boolean;
}
let responsive: ResponsiveBreakpoints | null = null;
export function setResponsiveBreakpoints(hook: ResponsiveBreakpoints | null): void {
  responsive = hook;
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
    dock: false,
    run: () => {
      apply(!state.breakpointsOn);
      if (responsive?.active() && responsive.toggle(state.breakpointsOn) !== state.breakpointsOn)
        apply(false); // nothing to build frames from
      void updateSettings({ breakpointsIsOn: state.breakpointsOn });
    },
    isActive: () => state.breakpointsOn,
    isDisabled: () => !!responsive?.active() && !responsive.available(),
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
    if (state.responsiveOn) return; // the frames show the breakpoints (Q5)
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
