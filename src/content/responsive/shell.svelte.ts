/** Responsive shell in the top page: enter / exit, one iframe per viewport (8.09, 8.23, 1.48; Q2, Q5, Q8). */
import { mount, unmount } from 'svelte';
import { browser } from '#imports';
import { i18n } from '#i18n';
import { isSerializedEdit, type SerializedEdit } from '../../lib/edit/serialize';
import { sendToBackground } from '../../lib/messaging';
import type { FrameApi } from '../../lib/responsive/channel';
import { frameName } from '../../lib/responsive/frame-name';
import {
  breakpointViewports,
  cycleScheme,
  defaultViewports,
  move,
  rotate,
  type Viewport,
} from '../../lib/responsive/viewports';
import { confirmDialog } from '../core/dialog';
import { runShortcut } from '../core/keys';
import { layer } from '../core/overlay';
import { state } from '../core/state.svelte';
import { editor, ruleTracker, toggleTextEdit } from '../edit/mode.svelte';
import { HANDOFF_FLAG, persistNow } from '../edit/persist';
import { currentBreakpoints } from '../tools/breakpoints';
import { connectToFrame, type Channel } from './bridge';
import { loadTimer } from './frame';
import Shell from './Shell.svelte';

export interface ShellFrame {
  vp: Viewport;
  name: string;
  /** Until the frame's `ready_for_state_sync`. */
  loading: boolean;
  /** No ready within LOAD_TIMEOUT_MS (Task 9 tells blocked pages apart). */
  timedOut: boolean;
  /** Frame reported documentElement wider than its viewport. */
  overflow: boolean;
}

/** `frames` is in display order; viewports live here until Task 8 persists them. */
export const shell = $state({
  frames: [] as ShellFrame[],
  src: '',
  /** Breakpoint-frames mode (Q5): frames follow the breakpoints, so none can be removed. */
  breakpointMode: false,
  /** A handle drag is running: iframes stop taking pointer events. */
  dragging: false,
});

/** Header label: `Name (W×H)`, or `W×H` with no name (legacy formatViewportLabel). */
export function frameLabel(vp: Viewport): string {
  const size = `${vp.width}×${vp.height}`;
  return vp.name ? `${vp.name} (${size})` : size;
}

let controller: AbortController | null = null;
let app: ReturnType<typeof mount> | null = null;
let target: HTMLElement | null = null;
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping, never rendered
const channels = new Map<number, Channel<FrameApi>>();
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping, never rendered
const iframes = new Map<number, HTMLIFrameElement>();
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping, never rendered
const timers = new Map<number, ReturnType<typeof loadTimer>>();
/** Edits the shell last knew of: sent to frames on ready, fallback when the first frame does not answer. */
let lastEdits: SerializedEdit[] = [];
let savedOverflow = '';
let pausedMedia: HTMLMediaElement[] = [];
let busy = false;

/** HTML edits (markup, class, inline style via the engine) are not carried into the frames. */
const hasUncarryable = (): boolean => (editor()?.htmlChanges().length ?? 0) > 0;

function viewports(): { vps: Viewport[]; fromBps: boolean } {
  const defaults = defaultViewports(); // Task 8 reads saved settings
  const bps = state.breakpointsOn ? currentBreakpoints() : [];
  const fromBps = bps.length ? breakpointViewports(bps, defaults) : [];
  return fromBps.length ? { vps: fromBps, fromBps: true } : { vps: defaults, fromBps: false };
}

const frameOf = (id: number) => shell.frames.find((f) => f.vp.id === id);

/** Replace the viewport list (order and sizes), keeping each frame's status. */
function applyViewports(next: Viewport[]): void {
  const byId = new Map(shell.frames.map((f) => [f.vp.id, f]));
  shell.frames = next.flatMap((vp) => {
    const f = byId.get(vp.id);
    if (!f) return [];
    f.vp = vp;
    return [f];
  });
}
const vps = () => shell.frames.map((f) => f.vp);

export const rotateFrame = (id: number): void => applyViewports(rotate(vps(), id));
export const moveFrame = (id: number, delta: number): void =>
  applyViewports(move(vps(), id, delta));
export function cycleFrameScheme(id: number): void {
  applyViewports(vps().map((v) => (v.id === id ? { ...v, scheme: cycleScheme(v.scheme) } : v)));
}
/** Handle drag: a dragged size is no longer that device's (legacy clears `device`). */
export function resizeFrame(id: number, size: { width: number; height: number }): void {
  applyViewports(
    vps().map((v) => {
      if (v.id !== id) return v;
      const next: Viewport = { ...v, ...size };
      delete next.device;
      return next;
    }),
  );
}

export async function removeFrame(id: number): Promise<boolean> {
  const f = frameOf(id);
  if (!f || shell.breakpointMode) return false;
  const ok = await confirmDialog(
    i18n.t('responsive.titleRemove'),
    i18n.t('responsive.bodyRemoveViewport', [frameLabel(f.vp)]),
    'responsive.buttonRemove',
  );
  if (!ok || !state.responsiveOn) return false;
  shell.frames = shell.frames.filter((x) => x.vp.id !== id);
  return true;
}

function watchLoad(id: number): void {
  timers.get(id)?.cancel();
  const f = frameOf(id);
  if (f) Object.assign(f, { loading: true, timedOut: false });
  timers.set(
    id,
    loadTimer(() => {
      const g = frameOf(id);
      if (g?.loading) g.timedOut = true;
    }),
  );
}

export function reloadFrame(id: number): void {
  const iframe = iframes.get(id);
  if (!iframe) return;
  watchLoad(id);
  try {
    iframe.contentWindow?.location.reload();
  } catch {
    iframe.src = shell.src;
  }
}

export async function enterResponsive(): Promise<boolean> {
  if (state.responsiveOn || busy || state.inFrame || window !== window.top) return false;
  busy = true;
  try {
    if (
      hasUncarryable() &&
      !(await confirmDialog(i18n.t('dock.responsive'), i18n.t('responsive.confirmPartialEdits')))
    )
      return false;
    if (!state.active) return false; // session stopped while asking
    const root = layer.getRootNode();
    if (!(root instanceof ShadowRoot)) return false;
    lastEdits = ruleTracker().serialize();
    if (state.textEditOn) toggleTextEdit(); // 8.09
    controller = new AbortController();
    state.responsiveOn = true;
    state.hovered = null;
    // the parent's overlay must not draw over the shell (tools run inside the frames)
    layer.style.display = 'none';
    savedOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    pausedMedia = [...document.querySelectorAll<HTMLMediaElement>('video, audio')].filter(
      (m) => !m.paused,
    );
    for (const m of pausedMedia) m.pause();
    // false = no <all_urls>: frames of pages that block embedding stay blank (Task 9 overlay)
    void sendToBackground('enable_frame_header_rule').catch(() => false);
    shell.src = location.href;
    const { vps: list, fromBps } = viewports();
    shell.breakpointMode = fromBps;
    shell.dragging = false;
    shell.frames = list.map((vp) => ({
      vp,
      name: frameName(browser.runtime.id, vp.id),
      loading: true,
      timedOut: false,
      overflow: false,
    }));
    // before the dock in the shadow tree, so the dock (and later dialogs) stay on top
    target = document.createElement('div');
    root.prepend(target);
    app = mount(Shell, { target });
    return true;
  } finally {
    busy = false;
  }
}

/** Shell.svelte calls this per iframe; returns the cleanup. */
export function attachFrame(iframe: HTMLIFrameElement, id: number): () => void {
  const signal = controller?.signal;
  if (!signal) return () => {};
  iframes.set(id, iframe);
  watchLoad(id);
  const local = new AbortController();
  const both = AbortSignal.any([signal, local.signal]);
  const ch: Channel<FrameApi> = connectToFrame(
    iframe,
    {
      ready_for_state_sync: () => {
        timers.get(id)?.ready();
        const f = frameOf(id);
        if (f) Object.assign(f, { loading: false, timedOut: false });
        ch.send('apply_rule_edits', lastEdits);
      },
      overflow_status: (s) => {
        const f = frameOf(id);
        if (f) f.overflow = !!s?.overflowing;
      },
      rule_edits_changed: (edits) => {
        if (Array.isArray(edits)) lastEdits = edits.filter(isSerializedEdit);
      },
      shortcut: (key) => void runShortcut(String(key)),
    },
    both,
  );
  channels.set(id, ch);
  iframe.addEventListener(
    'load',
    () => void sendToBackground('inject_responsive_frames').catch(() => []),
    { signal: both },
  );
  return () => {
    local.abort();
    timers.get(id)?.cancel();
    timers.delete(id);
    if (iframes.get(id) === iframe) iframes.delete(id);
    if (channels.get(id) === ch) channels.delete(id);
  };
}

/** Synchronous part of leaving: also the session-stop fallback. */
export function teardownShell(): void {
  if (!state.responsiveOn) return;
  controller?.abort();
  controller = null;
  if (app) void unmount(app);
  app = null;
  target?.remove();
  target = null;
  channels.clear();
  for (const t of timers.values()) t.cancel();
  timers.clear();
  iframes.clear();
  shell.frames = [];
  shell.dragging = false;
  document.documentElement.style.overflow = savedOverflow;
  for (const m of pausedMedia) void m.play()?.catch(() => {});
  pausedMedia = [];
  layer.style.display = state.paused ? 'none' : '';
  state.responsiveOn = false;
}

/** Q8: take the first frame's edits and URL back to the page; navigate only when the URL moved. */
export async function exitResponsive(): Promise<void> {
  if (!state.responsiveOn || busy) return;
  busy = true;
  try {
    const firstId = shell.frames[0]?.vp.id;
    const first = firstId === undefined ? undefined : channels.get(firstId);
    const [edits, url] = first
      ? await Promise.all([first.call('collect_rule_edits'), first.call('get_current_url')])
      : [undefined, undefined];
    const ruleEdits = Array.isArray(edits) ? edits.filter(isSerializedEdit) : lastEdits;
    void sendToBackground('disable_frame_header_rule').catch(() => {});
    teardownShell();
    if (typeof url === 'string' && url && url !== location.href) {
      try {
        sessionStorage.setItem(HANDOFF_FLAG, '1');
      } catch {
        // storage blocked: the reload may show the restore toast
      }
      await sendToBackground('exit_responsive_mode', { ruleEdits, url }).catch(() => {});
      location.assign(url);
      return;
    }
    const tracker = ruleTracker();
    if (JSON.stringify(tracker.serialize()) !== JSON.stringify(ruleEdits)) {
      tracker.revertAll();
      tracker.applySerialized(ruleEdits);
    }
    await persistNow();
  } finally {
    busy = false;
  }
}

export function toggleResponsive(): void {
  if (state.responsiveOn) void exitResponsive();
  else void enterResponsive();
}
