import type { ContentScriptContext } from '#imports';
import Dock from '../../ui/Dock.svelte';
import FrameRoot from '../../ui/FrameRoot.svelte';
import { mountUi } from '../../ui/mount';
import { panelPrefsItem, themePref } from '../../lib/ext/settings';
import type { ColorFormat } from '../../lib/style/color';
import { detectPageIsDark, resolveTheme, type ThemePref } from '../../lib/style/theme';
import { installDragGuard, resetDrag } from './drag';
import { routeKey } from './keys';
import { mountLayer, requestPaint } from './overlay';
import { setPaused } from './registry.svelte';
import { state } from './state.svelte';

let controller: AbortController | null = null;
/** A Set: the same cleanup registered twice in a session still runs once. */
let cleanups = new Set<() => void>();
let ctxRef: ContentScriptContext | null = null;
let uiRef: { host: HTMLElement } | null = null;

/** Context of the running session (capture mounts its own hosts with it). */
export function sessionCtx(): ContentScriptContext {
  if (!ctxRef) throw new Error('no session');
  return ctxRef;
}

/** Hides the main UI while capturing (theme.css :host([data-capture='all'])). */
let hideHook: ((mode: 'all' | null) => void) | null = null;
/** Responsive shell: also hide the frames' own UI during a grab. */
export function setHideUiHook(fn: ((mode: 'all' | null) => void) | null): void {
  hideHook = fn;
}

export function hideUi(mode: 'all' | null): void {
  hideHook?.(mode);
  if (!uiRef) return;
  if (mode) uiRef.host.dataset.capture = mode;
  else delete uiRef.host.dataset.capture;
}

export function sessionSignal(): AbortSignal {
  return (controller ??= new AbortController()).signal;
}

export function onStop(fn: () => void): void {
  cleanups.add(fn);
}

export async function startSession(ctx: ContentScriptContext): Promise<void> {
  if (state.active) return;
  state.active = true; // set before await: a second call is a no-op
  try {
    await start(ctx);
  } catch (e) {
    stopSession(); // a failed start must not leave state.active stuck on
    throw e;
  }
}

async function start(ctx: ContentScriptContext): Promise<void> {
  const signal = sessionSignal();
  ctxRef = ctx;
  installDragGuard(signal); // first: runs before every tool's window-capture listener
  onStop(resetDrag);
  // responsive frame: same host (overlay, panels) without the dock (1.25)
  const ui = await mountUi(ctx, state.inFrame ? FrameRoot : Dock);
  if (signal.aborted) return ui.remove(); // stopped while mounting
  onStop(ui.remove);
  uiRef = ui;
  onStop(() => (uiRef = null));
  onStop(mountLayer(ui.shadow));
  window.addEventListener('resize', requestPaint, { signal });
  // capture: nested scrollers too (audit/find highlights)
  window.addEventListener('scroll', requestPaint, { signal, passive: true, capture: true });
  window.addEventListener('keydown', routeKey, { signal });
  // isolateEvents stops keydown at our shadow root (page never sees our typing), so route it here too
  ui.shadow.addEventListener('keydown', routeKey as EventListener, { signal });

  const applyTheme = (pref: ThemePref) => {
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = resolveTheme(pref, detectPageIsDark(document), prefersDark);
    ui.host.dataset.theme = state.theme;
  };
  const pref = await themePref.getValue();
  if (signal.aborted) return; // stopped while reading the pref
  applyTheme(pref);
  onStop(themePref.watch(applyTheme));

  const applyFormat = (p: { colorFormat?: ColorFormat } | null) =>
    (state.colorFormat = p?.colorFormat ?? 'HEX');
  const prefs = await panelPrefsItem.getValue();
  if (signal.aborted) return;
  applyFormat(prefs);
  onStop(panelPrefsItem.watch(applyFormat));
}

export function stopSession(): void {
  controller?.abort();
  controller = null;
  const fns = cleanups;
  cleanups = new Set();
  for (const fn of fns) fn();
  setPaused(false);
  Object.assign(state, {
    active: false,
    hovered: null,
    selected: null,
    inspectOn: false,
    popover: null,
    dockNotice: null,
    capturing: false,
    dialog: false,
    palette: false,
  });
  ctxRef = null;
}
