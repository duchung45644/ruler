import type { ContentScriptContext } from '#imports';
import Dock from '../../ui/Dock.svelte';
import { mountUi } from '../../ui/mount';
import { themePref } from '../../lib/settings';
import { detectPageIsDark, resolveTheme, type ThemePref } from '../../lib/theme';
import { installDragGuard, resetDrag } from './drag';
import { routeKey } from './keys';
import { mountLayer } from './overlay';
import { setPaused } from './registry.svelte';
import { state } from './state.svelte';

let controller: AbortController | null = null;
let cleanups: (() => void)[] = [];

export function sessionSignal(): AbortSignal {
  return (controller ??= new AbortController()).signal;
}

export function onStop(fn: () => void): void {
  cleanups.push(fn);
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
  installDragGuard(signal); // first: runs before every tool's window-capture listener
  onStop(resetDrag);
  const ui = await mountUi(ctx, Dock);
  if (signal.aborted) return ui.remove(); // stopped while mounting
  onStop(ui.remove);
  onStop(mountLayer(ui.shadow));
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
}

export function stopSession(): void {
  controller?.abort();
  controller = null;
  const fns = cleanups;
  cleanups = [];
  for (const fn of fns) fn();
  setPaused(false);
  Object.assign(state, {
    active: false,
    hovered: null,
    selected: null,
    inspectOn: false,
    dockCollapsed: false,
    popover: null,
  });
}
