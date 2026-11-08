/** Content script inside a responsive-view iframe (legacy frame mode; 5.25, 1.25). */
import { browser } from '#imports';
import type { Channel } from './bridge';
import { connectToParent } from './bridge';
import type { ShellApi } from '../../lib/responsive/channel';
import { parseFrameName } from '../../lib/responsive/frame-name';
import { runItem, setForwardKey } from '../core/keys';
import { layer } from '../core/overlay';
import { setPaused } from '../core/registry.svelte';
import { hideUi } from '../core/session';
import { isFullyVisible } from '../../lib/capture/capture';
import { state } from '../core/state.svelte';
import { ruleTracker, setSharedHistoryState } from '../edit/mode.svelte';
import { setSelectionHook } from '../sidepanel/bridge.svelte';
import {
  applyFrameInlineStyles,
  applyFrameRuleEdits,
  frameStep,
  startFrameEdits,
  takeSharedHistory,
} from './edits';
import { createFrameSync } from './sync';
import type { McpPageType } from '../../lib/mcp/protocol';
import { runMcp } from '../mcp';
import { applyReadyAck, applySetting, frameFind, frameFindGoto } from './forward';

let controller: AbortController | null = null;
let channel: Channel<ShellApi> | null = null;

/** This window is one of our named responsive iframes. */
export function isResponsiveFrame(): boolean {
  return window !== window.top && parseFrameName(browser.runtime.id, window.name) !== null;
}

/** Connects to the shell and asks for state; idempotent. */
export function startFrameMode(): void {
  if (controller) return;
  state.inFrame = true;
  controller = new AbortController();
  const sync = createFrameSync();
  channel = connectToParent(
    {
      run_item: (id) => void runItem(id),
      set_paused: (paused) => setPaused(!!paused),
      // the shell pushes the page's CSS edits on ready and collects them back on exit (Q8)
      apply_rule_edits: applyFrameRuleEdits,
      apply_inline_styles: applyFrameInlineStyles,
      ready_ack: (s) => {
        applyFrameRuleEdits(s?.ruleEdits);
        applyFrameInlineStyles(s?.inlineStyles);
        applyUiScale(s?.uiScale);
        const n = applyReadyAck(s);
        if (n !== null) channel?.send('report_find_count', n);
      },
      set_setting: (key, value) => applySetting(key, value),
      find: (query) => frameFind(query),
      find_goto: (local) => frameFindGoto(local),
      collect_rule_edits: () => ruleTracker().serialize(),
      get_current_url: () => location.href,
      update_ui_scale: (scale) => applyUiScale(scale),
      apply_scroll_sync: (r) => sync.apply_scroll_sync(r),
      reset_scroll_conflict: () => sync.reset_scroll_conflict(),
      apply_spa_navigation: (url) => sync.apply_spa_navigation(url),
      // another frame took the selection: only one frame holds one (8.19)
      clear_selection: () => void (state.selected = null),
      // shared history (8.20): the shell picks the frame that made the step
      edit_undo: () => frameStep('undo'),
      edit_redo: () => frameStep('redo'),
      shared_history_state: (s) => takeSharedHistory(s),
      element_rect: () => selectedRect(),
      capture_hide: (on) => hideUi(on ? 'all' : null),
      // validated by the background; the frame refuses responsive / page-level commands itself
      mcp_call: (type, payload) => runMcp(type as McpPageType, payload),
    },
    controller.signal,
  );
  const ch = channel;
  setForwardKey((key) => ch.send('shortcut', key));
  setSelectionHook((selected) => ch.send('selection_changed', { selected }));
  ch.send('ready_for_state_sync');
  void ch.call('request_ui_scale').then(applyUiScale, () => {});
  watchOverflow(ch, controller.signal);
  sync.start(ch, controller.signal);
  startFrameEdits(ch, controller.signal);
}

/** Horizontal overflow badge (8.12): report documentElement wider than the frame, on change. */
export function watchOverflow(ch: Channel<ShellApi>, signal: AbortSignal): void {
  let last: boolean | null = null;
  const check = () => {
    const el = document.documentElement;
    const overflowing = el.scrollWidth > el.clientWidth;
    if (overflowing === last) return;
    last = overflowing;
    ch.send('overflow_status', { overflowing, width: el.scrollWidth });
  };
  check();
  window.addEventListener('resize', check, { signal });
  if (typeof ResizeObserver === 'undefined') return;
  const ro = new ResizeObserver(check);
  ro.observe(document.documentElement);
  if (document.body) ro.observe(document.body);
  signal.addEventListener('abort', () => ro.disconnect(), { once: true });
}

/** Selected element's viewport rect for the parent's capture, scrolled into view first (Q6). */
export async function selectedRect(): Promise<{
  left: number;
  top: number;
  right: number;
  bottom: number;
} | null> {
  const el = state.selected;
  if (!el?.isConnected) return null;
  if (!isFullyVisible(el.getBoundingClientRect(), innerWidth, innerHeight)) {
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }
  const { left, top, right, bottom } = el.getBoundingClientRect();
  return { left, top, right, bottom };
}

/** `--ui-scale` (1/zoom of the shell) on the overlay host, so on-page labels stay readable (1.28). */
export function applyUiScale(scale: unknown): void {
  const n = Number(scale);
  if (!Number.isFinite(n) || n <= 0) return;
  const root = layer.getRootNode();
  const host = root instanceof ShadowRoot ? (root.host as HTMLElement) : null;
  host?.style.setProperty('--ui-scale', String(n));
}

/** Test / teardown hook. */
export function stopFrameMode(): void {
  controller?.abort();
  controller = null;
  channel = null;
  setForwardKey(null);
  setSelectionHook(null);
  setSharedHistoryState(null);
  state.inFrame = false;
}
