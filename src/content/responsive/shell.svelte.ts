/** Responsive shell in the top page: enter / exit, one iframe per viewport (8.09, 8.23, 1.48; Q2, Q5, Q8). */
import { mount, unmount } from 'svelte';
import { browser } from '#imports';
import { i18n } from '#i18n';
import { isSerializedEdit } from '../../lib/edit/serialize';
import { sendToBackground, sendToSidePanel } from '../../lib/messaging';
import type { FrameApi } from '../../lib/responsive/channel';
import { frameName } from '../../lib/responsive/frame-name';
import {
  breakpointViewports,
  cycleScheme,
  DRAG_MIN,
  MAX_VIEWPORTS,
  move,
  nextId,
  normalizeSaved,
  reset,
  rotate,
  SIZE_MAX,
  type ResponsiveSettings,
  type Viewport,
} from '../../lib/responsive/viewports';
import type { DevicePreset } from '../../lib/responsive/devices';
import { clampZoom, stepZoom } from '../../lib/responsive/zoom';
import { frameRectToParent, type Edges } from '../../lib/responsive/capture-rect';
import { getSettings, updateSettings } from '../../lib/settings';
import { confirmDialog, sizeDialog } from '../core/dialog';
import { runShortcut } from '../core/keys';
import { setHideUiHook } from '../core/session';
import { layer } from '../core/overlay';
import { state } from '../core/state.svelte';
import {
  editState,
  editor,
  ruleTracker,
  setSharedHistoryState,
  setUndoRoute,
  toggleTextEdit,
} from '../edit/mode.svelte';
import { HANDOFF_FLAG, persistNow } from '../edit/persist';
import type { Breakpoint } from '../../lib/breakpoints';
import {
  currentBreakpoints,
  pageHasBreakpoints,
  setResponsiveBreakpoints,
} from '../tools/breakpoints';
import { createShellSync, ESCAPE_MS } from './sync';
import { connectToFrame, type Channel } from './bridge';
import { BLOCK_CHECK_MS, blockedState, readDoc, type Blocked } from './blocked';
import { loadTimer } from './frame';
import { enterForward, exitForward, frameFindCount, installForward, readyState } from './forward';
import { applyInlineStyles, createShellEdits, historyFlags } from './edits';
import Shell from './Shell.svelte';

export interface ShellFrame {
  vp: Viewport;
  name: string;
  /** Until the frame's `ready_for_state_sync`. */
  loading: boolean;
  /** No ready within LOAD_TIMEOUT_MS and the page is readable (not a blocked embed). */
  timedOut: boolean;
  /** The page refuses embedding (8.15): grant link, or `still` when headers are already stripped. */
  blocked: Blocked;
  /** Frame reported documentElement wider than its viewport. */
  overflow: boolean;
}

/** `frames` is in display order; viewports, zoom and the toggles are saved (8.16). */
export const shell = $state({
  frames: [] as ShellFrame[],
  src: '',
  /** Breakpoint-frames mode (Q5): frames follow the breakpoints, so none can be removed. */
  breakpointMode: false,
  /** A handle drag is running: iframes stop taking pointer events. */
  dragging: false,
  /** Frames container scale factor (1 = 100%). */
  zoom: 1,
  /** Frames wrap onto several rows instead of one row. */
  framesWrap: false,
  /** Sync scrolling toggle (8.17). */
  syncScrollEnabled: true,
  /** enable_frame_header_rule answered true: frame-blocking headers are stripped for this tab. */
  headerRule: false,
  /** URL shown in the toolbar: follows SPA navigation in the frames (iframe `src` stays put). */
  url: '',
  /** TOAST_SCROLL_SYNC_OFF is showing (8.17). */
  syncOffToast: false,
  /** Breakpoint mode: kind per frame width, for the header label colors. */
  bpKinds: {} as Record<number, Breakpoint['kind']>,
  /** The page has breakpoints (scanned at entry): B is disabled otherwise (8.22). */
  hasBreakpoints: false,
  /** Active state of the forwarded dock items, mirrored from the frames (1.34). */
  active: {} as Record<string, boolean>,
});

/** The scroll-sync toast stays this long (legacy 8s). */
export const SYNC_TOAST_MS = 8000;

/** Saved settings are written this long after the last change (legacy debounce). */
export const SAVE_DELAY_MS = 400;

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
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping, never rendered
const blockChecks = new Map<number, ReturnType<typeof setTimeout>>();
/** Newest CSS edits (sent on ready, synced to every frame, fallback on exit) and the shared undo log. */
const edits = createShellEdits(
  () =>
    shell.frames.flatMap((f) => {
      const ch = channels.get(f.vp.id);
      return ch && wasReady.has(f.vp.id) ? [[f.vp.id, ch] as [number, Channel<FrameApi>]] : [];
    }),
  (flags) => {
    // the shell's own panel state and every frame's follow the shared log (8.20)
    if (state.responsiveOn) {
      setSharedHistoryState(flags);
      void sendToSidePanel('edit_state', editState()).catch(() => {});
    }
    for (const [id, ch] of channels) if (wasReady.has(id)) ch.send('shared_history_state', flags);
  },
);
/** Frame holding the selection (selection_changed), for "selected element" capture. */
let selectedFrame: number | null = null;
let savedOverflow = '';
let pausedMedia: HTMLMediaElement[] = [];
let busy = false;

/** HTML edits (markup, class, inline style via the engine) are not carried into the frames. */
const hasUncarryable = (): boolean => (editor()?.htmlChanges().length ?? 0) > 0;

/** Viewports as last saved: breakpoint mode writes these back unchanged. */
let savedViewports: Viewport[] = [];
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function viewports(saved: Viewport[]): { vps: Viewport[]; fromBps: boolean } {
  const bps = state.breakpointsOn ? currentBreakpoints() : [];
  const fromBps = bps.length ? breakpointViewports(bps, saved) : [];
  shell.bpKinds = Object.fromEntries(bps.map((b) => [b.width, b.kind]));
  return fromBps.length ? { vps: fromBps, fromBps: true } : { vps: saved, fromBps: false };
}

/** Swap the frame list, keeping frames (and their iframes) whose id survives. */
function replaceFrames(next: Viewport[]): void {
  const byId = new Map(shell.frames.map((f) => [f.vp.id, f]));
  shell.frames = next.map((vp) => {
    const f = byId.get(vp.id);
    if (!f) return newFrame(vp);
    f.vp = vp;
    return f;
  });
}

/**
 * Q5 / 8.22: the breakpoints item toggles breakpoint-frames mode while responsive. Entering builds
 * one frame per breakpoint; leaving puts the saved viewports back. Returns the mode now.
 */
export function setBreakpointMode(on: boolean): boolean {
  if (!state.responsiveOn) return false;
  if (on === shell.breakpointMode) return on;
  if (on) {
    if (saveTimer !== undefined) {
      clearTimeout(saveTimer);
      saveTimer = undefined;
      flushSave();
    }
    savedViewports = $state.snapshot(vps()) as Viewport[];
    const { vps: list, fromBps } = viewports(savedViewports);
    if (!fromBps) return false;
    shell.breakpointMode = true;
    replaceFrames(list);
    return true;
  }
  shell.breakpointMode = false;
  replaceFrames(savedViewports);
  return false;
}

setResponsiveBreakpoints({
  active: () => state.responsiveOn && !state.inFrame,
  available: () => shell.hasBreakpoints,
  toggle: (on) => setBreakpointMode(on),
});

installForward({
  ready: () =>
    shell.frames.flatMap((f) => {
      const ch = channels.get(f.vp.id);
      return ch && wasReady.has(f.vp.id) ? [[f.vp.id, ch] as [number, Channel<FrameApi>]] : [];
    }),
  active: shell.active,
});

function currentSettings(): ResponsiveSettings {
  return {
    viewports: shell.breakpointMode ? savedViewports : vps(),
    zoom: shell.zoom,
    framesWrap: shell.framesWrap,
    syncScrollEnabled: shell.syncScrollEnabled,
  };
}

/** Debounced save (port of saveResponsiveSettings / persistViewports). */
function scheduleSave(): void {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = undefined;
    flushSave();
  }, SAVE_DELAY_MS);
}

function flushSave(): void {
  const s = $state.snapshot(currentSettings()) as ResponsiveSettings;
  if (!shell.breakpointMode) savedViewports = s.viewports;
  void updateSettings({ responsiveMode: s }).catch(() => {});
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
  scheduleSave();
}
function vps(): Viewport[] {
  return shell.frames.map((f) => f.vp);
}

const newFrame = (vp: Viewport): ShellFrame => ({
  vp,
  name: frameName(browser.runtime.id, vp.id),
  loading: true,
  timedOut: false,
  blocked: null,
  overflow: false,
});

/** Send the overlay scale (1/zoom) so labels drawn inside frames stay readable (1.28). */
function sendUiScale(): void {
  for (const ch of channels.values()) ch.send('update_ui_scale', 1 / shell.zoom);
}

export function setZoom(z: unknown): void {
  const next = clampZoom(z);
  if (next === shell.zoom) return;
  shell.zoom = next;
  sendUiScale();
  scheduleSave();
}
export const zoomStep = (dir: 1 | -1): void => setZoom(stepZoom(shell.zoom, dir));

export function toggleFramesWrap(): void {
  shell.framesWrap = !shell.framesWrap;
  scheduleSave();
}
export function toggleSyncScroll(): void {
  shell.syncScrollEnabled = !shell.syncScrollEnabled;
  if (shell.syncScrollEnabled) {
    hideSyncOffToast();
    sync.enabled();
  }
  scheduleSave();
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function hideSyncOffToast(): void {
  clearTimeout(toastTimer);
  toastTimer = undefined;
  shell.syncOffToast = false;
}

const sync = createShellSync({
  ids: () => [...channels.keys()],
  enabled: () => shell.syncScrollEnabled,
  applyScroll: (id, r) => channels.get(id)?.send('apply_scroll_sync', r),
  resetConflict: (id) => channels.get(id)?.send('reset_scroll_conflict'),
  applySpa: (id, url) => channels.get(id)?.send('apply_spa_navigation', url),
  turnedOff: () => {
    shell.syncScrollEnabled = false;
    scheduleSave();
    hideSyncOffToast();
    shell.syncOffToast = true;
    toastTimer = setTimeout(hideSyncOffToast, SYNC_TOAST_MS);
  },
  urlChanged: (url) => void (shell.url = url),
});

// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping, never rendered
const escapes = new Map<number, ReturnType<typeof setTimeout>>();
/** Frames that said ready since their src was last set: only those can "wander off". */
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping, never rendered
const wasReady = new Set<number>();
function clearEscape(id: number): void {
  clearTimeout(escapes.get(id));
  escapes.delete(id);
}
/** Legacy onFrameEscaped: a load with no ready in 2.5s went off-site → back to the last good URL. */
function recoverEscaped(id: number): void {
  escapes.delete(id);
  const iframe = iframes.get(id);
  if (!iframe?.isConnected || !wasReady.has(id)) return;
  wasReady.delete(id);
  watchLoad(id);
  iframe.src = shell.url || shell.src;
}

export const canAddFrame = (): boolean =>
  !shell.breakpointMode && shell.frames.length < MAX_VIEWPORTS;

/** Add a device frame at the end; `custom` asks for the size first (200×300 – 3840). */
export async function addFrame(preset: DevicePreset): Promise<boolean> {
  if (!canAddFrame()) return false;
  let size: { width: number; height: number } = preset;
  const custom = preset.key === 'custom';
  if (custom) {
    const picked = await sizeDialog(i18n.t('responsive.dialogTitleCustomViewport'), preset, {
      min: DRAG_MIN,
      max: SIZE_MAX,
    });
    if (!picked || !state.responsiveOn || !canAddFrame()) return false;
    size = picked;
  }
  const vp: Viewport = {
    id: nextId(vps()),
    name: custom ? '' : preset.name,
    width: size.width,
    height: size.height,
    scheme: 'system',
  };
  if (!custom) vp.device = preset.key;
  shell.frames = [...shell.frames, newFrame(vp)];
  scheduleSave();
  return true;
}

/** Keep only the first viewport after asking (legacy resetViewports). */
export async function resetFrames(): Promise<boolean> {
  if (shell.breakpointMode) return false;
  const ok = await confirmDialog(
    i18n.t('responsive.dialogTitleResetViewports'),
    i18n.t('responsive.bodyResetViewports'),
    'responsive.buttonReset',
  );
  if (!ok || !state.responsiveOn) return false;
  applyViewports(reset(vps()));
  return true;
}

/** Host permission granted (background `reload_frames`): headers are stripped now, reload all. */
export function onFramesUnblocked(): void {
  if (!state.responsiveOn) return;
  shell.headerRule = true;
  reloadAllFrames();
}

export function reloadAllFrames(): void {
  for (const f of shell.frames) reloadFrame(f.vp.id);
}

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
  scheduleSave();
  return true;
}

/** Still loading: a blocked embed gets its overlay; otherwise `timeout` shows the timeout text. */
function checkBlocked(id: number, timeout: boolean): void {
  const f = frameOf(id);
  const iframe = iframes.get(id);
  if (!f?.loading || !iframe) return;
  const blocked = blockedState(false, readDoc(iframe), shell.headerRule);
  if (blocked) f.blocked = blocked;
  else if (timeout) f.timedOut = true;
}

function clearBlockCheck(id: number): void {
  clearTimeout(blockChecks.get(id));
  blockChecks.delete(id);
}

function watchLoad(id: number): void {
  timers.get(id)?.cancel();
  clearBlockCheck(id);
  const f = frameOf(id);
  if (f) Object.assign(f, { loading: true, timedOut: false, blocked: null });
  timers.set(
    id,
    loadTimer(() => checkBlocked(id, true)),
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
    const saved = (await getSettings().catch(() => null))?.responsiveMode;
    if (!state.active || state.responsiveOn) return false; // session stopped while asking
    const root = layer.getRootNode();
    if (!(root instanceof ShadowRoot)) return false;
    edits.reset(ruleTracker().serialize());
    setSharedHistoryState(historyFlags(edits.history));
    setUndoRoute((redo) => {
      void edits.step(redo);
      return true;
    });
    if (state.textEditOn) toggleTextEdit(); // 8.09
    controller = new AbortController();
    state.responsiveOn = true;
    enterForward();
    // the page's own selection would linger on the panel: frames take over (Task 12)
    state.selected = null;
    void sendToSidePanel('responsive_state', { on: true }).catch(() => {});
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
    shell.headerRule = false;
    void sendToBackground('enable_frame_header_rule').then(
      (on) => void (shell.headerRule = on === true),
      () => {},
    );
    shell.src = location.href;
    shell.url = location.href;
    hideSyncOffToast();
    savedViewports = normalizeSaved(saved?.viewports);
    shell.hasBreakpoints = pageHasBreakpoints();
    const { vps: list, fromBps } = viewports(savedViewports);
    shell.breakpointMode = fromBps;
    shell.dragging = false;
    shell.zoom = clampZoom(saved?.zoom);
    shell.framesWrap = saved?.framesWrap === true;
    shell.syncScrollEnabled = saved?.syncScrollEnabled !== false;
    shell.frames = list.map(newFrame);
    // before the dock in the shadow tree, so the dock (and later dialogs) stay on top
    target = document.createElement('div');
    root.prepend(target);
    app = mount(Shell, { target });
    selectedFrame = null;
    // frames' own selection boxes and labels must not end up in a capture (Q6)
    setHideUiHook((mode) => {
      for (const ch of channels.values()) ch.send('capture_hide', mode !== null);
    });
    return true;
  } finally {
    busy = false;
  }
}

/** A frame holds a selected element. */
export const hasFrameSelection = (): boolean =>
  selectedFrame !== null && channels.has(selectedFrame);

/** Selected element of the selected frame, in parent viewport CSS px (Q6), or null. */
export async function frameSelectionRect(): Promise<Edges | null> {
  const id = selectedFrame;
  const ch = id === null ? undefined : channels.get(id);
  const iframe = id === null ? undefined : iframes.get(id);
  if (!ch || !iframe) return null;
  const r = await ch.call('element_rect').catch(() => null);
  if (!r) return null;
  const o = iframe.getBoundingClientRect();
  const p = frameRectToParent(r, o, shell.zoom);
  // only the part showing inside the iframe
  const c = {
    left: Math.max(p.left, o.left),
    top: Math.max(p.top, o.top),
    right: Math.min(p.right, o.right),
    bottom: Math.min(p.bottom, o.bottom),
  };
  return c.right > c.left && c.bottom > c.top ? c : null;
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
        clearBlockCheck(id);
        const f = frameOf(id);
        if (f) Object.assign(f, { loading: false, timedOut: false, blocked: null });
        clearEscape(id);
        wasReady.add(id);
        // late frames too: paused, forwarded tools, settings, find (1.32 / 1.47)
        ch.send('ready_ack', {
          ...readyState(),
          uiScale: 1 / shell.zoom,
          ruleEdits: edits.last,
          inlineStyles: edits.inline,
        });
        ch.send('shared_history_state', historyFlags(edits.history));
      },
      request_ui_scale: () => 1 / shell.zoom,
      overflow_status: (s) => {
        const f = frameOf(id);
        if (f) f.overflow = !!s?.overflowing;
      },
      // replace-all to every other ready frame; the sender already has them (5.26)
      rule_edits_changed: (list) => edits.ruleEditsChanged(id, list),
      // inline style edits by structural locator, last write wins (element ids differ per frame)
      inline_style_changed: (e) => edits.inlineStyleChanged(id, e),
      editor_op_recorded: () => edits.opRecorded(id),
      frame_edit_state: (s) => edits.frameState(id, s),
      edit_history_key: (redo) => void edits.step(!!redo),
      shortcut: (key) => void runShortcut(String(key)),
      selection_changed: (s) => {
        if (!s?.selected) {
          if (selectedFrame === id) selectedFrame = null;
          return;
        }
        selectedFrame = id;
        for (const [other, c] of channels) if (other !== id) c.send('clear_selection');
      },
      report_find_count: (n) => frameFindCount(id, n),
      scroll_sync: (r) => sync.scroll(id, r),
      scroll_sync_conflict: () => sync.conflict(),
      spa_navigation: (url) => sync.spa(id, url),
      open_external: (url) => {
        if (typeof url === 'string' && /^https?:\/\//i.test(url))
          void sendToBackground('open_external_tab', url).catch(() => {});
      },
    },
    both,
  );
  channels.set(id, ch);
  iframe.addEventListener(
    'load',
    () => {
      void sendToBackground('inject_responsive_frames').catch(() => []);
      clearEscape(id);
      if (wasReady.has(id))
        escapes.set(
          id,
          setTimeout(() => recoverEscaped(id), ESCAPE_MS),
        );
      clearBlockCheck(id);
      blockChecks.set(
        id,
        setTimeout(() => {
          blockChecks.delete(id);
          checkBlocked(id, false);
        }, BLOCK_CHECK_MS),
      );
    },
    { signal: both },
  );
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) sync.visible(id, e.isIntersecting);
    });
    io.observe(iframe);
    both.addEventListener('abort', () => io.disconnect(), { once: true });
  }
  return () => {
    local.abort();
    edits.forget(id);
    clearEscape(id);
    wasReady.delete(id);
    sync.forget(id);
    timers.get(id)?.cancel();
    timers.delete(id);
    clearBlockCheck(id);
    if (iframes.get(id) === iframe) iframes.delete(id);
    if (channels.get(id) === ch) channels.delete(id);
  };
}

/** Synchronous part of leaving: also the session-stop fallback. */
export function teardownShell(): void {
  if (!state.responsiveOn) return;
  controller?.abort();
  controller = null;
  setHideUiHook(null);
  selectedFrame = null;
  if (saveTimer !== undefined) {
    clearTimeout(saveTimer);
    saveTimer = undefined;
    flushSave(); // a change made just before leaving is not lost
  }
  if (app) void unmount(app);
  app = null;
  target?.remove();
  target = null;
  channels.clear();
  for (const t of timers.values()) t.cancel();
  timers.clear();
  for (const t of blockChecks.values()) clearTimeout(t);
  blockChecks.clear();
  iframes.clear();
  for (const t of escapes.values()) clearTimeout(t);
  escapes.clear();
  wasReady.clear();
  hideSyncOffToast();
  shell.breakpointMode = false;
  shell.frames = [];
  shell.dragging = false;
  document.documentElement.style.overflow = savedOverflow;
  for (const m of pausedMedia) void m.play()?.catch(() => {});
  pausedMedia = [];
  layer.style.display = state.paused ? 'none' : '';
  state.responsiveOn = false;
  setUndoRoute(null);
  edits.reset([]); // drops the shared-history batch timer and per-frame state
  setSharedHistoryState(null);
  exitForward();
  void sendToSidePanel('responsive_state', { on: false }).catch(() => {});
}

/** Q8: take the first frame's edits and URL back to the page; navigate only when the URL moved. */
export async function exitResponsive(): Promise<void> {
  if (!state.responsiveOn || busy) return;
  busy = true;
  try {
    // HTML edits made in a frame stay there (8.08): CSS rules come back, the rest is lost
    if (
      edits.hasUncarryable() &&
      !(await confirmDialog(i18n.t('dock.responsive'), i18n.t('responsive.confirmPartialEdits')))
    )
      return;
    if (!state.responsiveOn) return;
    const firstId = shell.frames[0]?.vp.id;
    const first = firstId === undefined ? undefined : channels.get(firstId);
    const [collected, url] = first
      ? await Promise.all([first.call('collect_rule_edits'), first.call('get_current_url')])
      : [undefined, undefined];
    // the shell already holds the newest list; the first frame's answer is the check
    const ruleEdits = Array.isArray(collected) ? collected.filter(isSerializedEdit) : edits.last;
    const inlineStyles = edits.inline; // teardown clears them
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
    // inline edits reach the page, then persist with the rules (by locator, top frame only)
    applyInlineStyles(inlineStyles);
    await persistNow();
  } finally {
    busy = false;
  }
}

export function toggleResponsive(): void {
  if (state.responsiveOn) void exitResponsive();
  else void enterResponsive();
}
