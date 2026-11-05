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
import { getSettings, updateSettings } from '../../lib/settings';
import { confirmDialog, sizeDialog } from '../core/dialog';
import { runShortcut } from '../core/keys';
import { layer } from '../core/overlay';
import { state } from '../core/state.svelte';
import { editor, ruleTracker, toggleTextEdit } from '../edit/mode.svelte';
import { HANDOFF_FLAG, persistNow } from '../edit/persist';
import { currentBreakpoints } from '../tools/breakpoints';
import { connectToFrame, type Channel } from './bridge';
import { BLOCK_CHECK_MS, blockedState, readDoc, type Blocked } from './blocked';
import { loadTimer } from './frame';
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
  /** Sync scrolling toggle (behavior in Task 10). */
  syncScrollEnabled: true,
  /** enable_frame_header_rule answered true: frame-blocking headers are stripped for this tab. */
  headerRule: false,
});

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
/** Edits the shell last knew of: sent to frames on ready, fallback when the first frame does not answer. */
let lastEdits: SerializedEdit[] = [];
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
  return fromBps.length ? { vps: fromBps, fromBps: true } : { vps: saved, fromBps: false };
}

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
  scheduleSave();
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
    shell.headerRule = false;
    void sendToBackground('enable_frame_header_rule').then(
      (on) => void (shell.headerRule = on === true),
      () => {},
    );
    shell.src = location.href;
    savedViewports = normalizeSaved(saved?.viewports);
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
        clearBlockCheck(id);
        const f = frameOf(id);
        if (f) Object.assign(f, { loading: false, timedOut: false, blocked: null });
        ch.send('apply_rule_edits', lastEdits);
        ch.send('update_ui_scale', 1 / shell.zoom);
      },
      request_ui_scale: () => 1 / shell.zoom,
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
    () => {
      void sendToBackground('inject_responsive_frames').catch(() => []);
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
  return () => {
    local.abort();
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
