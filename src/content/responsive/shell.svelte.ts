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
  defaultViewports,
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
import Shell from './Shell.svelte';

export interface ShellFrame {
  vp: Viewport;
  name: string;
}

export const shell = $state({ frames: [] as ShellFrame[], src: '' });

let controller: AbortController | null = null;
let app: ReturnType<typeof mount> | null = null;
let target: HTMLElement | null = null;
let channels: Channel<FrameApi>[] = [];
/** Edits the shell last knew of: sent to frames on ready, fallback when the first frame does not answer. */
let lastEdits: SerializedEdit[] = [];
let savedOverflow = '';
let pausedMedia: HTMLMediaElement[] = [];
let busy = false;

/** HTML edits (markup, class, inline style via the engine) are not carried into the frames. */
const hasUncarryable = (): boolean => (editor()?.htmlChanges().length ?? 0) > 0;

function viewports(): Viewport[] {
  const defaults = defaultViewports(); // Task 8 reads saved settings
  const bps = state.breakpointsOn ? currentBreakpoints() : [];
  const fromBps = bps.length ? breakpointViewports(bps, defaults) : [];
  return fromBps.length ? fromBps : defaults;
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
    shell.frames = viewports().map((vp) => ({ vp, name: frameName(browser.runtime.id, vp.id) }));
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
export function attachFrame(iframe: HTMLIFrameElement): () => void {
  const signal = controller?.signal;
  if (!signal) return () => {};
  const local = new AbortController();
  const both = AbortSignal.any([signal, local.signal]);
  const ch: Channel<FrameApi> = connectToFrame(
    iframe,
    {
      ready_for_state_sync: () => ch.send('apply_rule_edits', lastEdits),
      rule_edits_changed: (edits) => {
        if (Array.isArray(edits)) lastEdits = edits.filter(isSerializedEdit);
      },
      shortcut: (key) => void runShortcut(String(key)),
    },
    both,
  );
  channels.push(ch);
  iframe.addEventListener(
    'load',
    () => void sendToBackground('inject_responsive_frames').catch(() => []),
    { signal: both },
  );
  return () => {
    local.abort();
    channels = channels.filter((c) => c !== ch);
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
  channels = [];
  shell.frames = [];
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
    const first = channels[0];
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
