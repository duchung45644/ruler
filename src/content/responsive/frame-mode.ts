/** Content script inside a responsive-view iframe (legacy frame mode; 5.25, 1.25). */
import { browser } from '#imports';
import type { Channel } from './bridge';
import { connectToParent } from './bridge';
import type { ShellApi } from '../../lib/responsive/channel';
import { parseFrameName } from '../../lib/responsive/frame-name';
import { runItem, setForwardKey } from '../core/keys';
import { layer } from '../core/overlay';
import { setPaused } from '../core/registry.svelte';
import { state } from '../core/state.svelte';
import { isSerializedEdit } from '../../lib/edit/serialize';
import { ruleTracker } from '../edit/mode.svelte';

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
  channel = connectToParent(
    {
      run_item: (id) => void runItem(id),
      set_paused: (paused) => setPaused(!!paused),
      // the shell pushes the page's CSS edits on ready and collects them back on exit (Q8)
      apply_rule_edits: (edits) => {
        const list = Array.isArray(edits) ? edits.filter(isSerializedEdit) : [];
        ruleTracker().applySerialized(list);
      },
      collect_rule_edits: () => ruleTracker().serialize(),
      get_current_url: () => location.href,
      update_ui_scale: (scale) => applyUiScale(scale),
    },
    controller.signal,
  );
  const ch = channel;
  setForwardKey((key) => ch.send('shortcut', key));
  ch.send('ready_for_state_sync');
  void ch.call('request_ui_scale').then(applyUiScale, () => {});
  watchOverflow(ch, controller.signal);
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
  state.inFrame = false;
}
