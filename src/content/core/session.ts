import type { ContentScriptContext } from '#imports';
import Dock from '../../ui/Dock.svelte';
import { mountUi } from '../../ui/mount';
import { themePref } from '../../lib/settings';
import { detectPageIsDark, resolveTheme, type ThemePref } from '../../lib/theme';
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
  const signal = sessionSignal();
  const ui = await mountUi(ctx, Dock);
  if (signal.aborted) return ui.remove(); // stopped while mounting
  onStop(ui.remove);

  const applyTheme = (pref: ThemePref) => {
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = resolveTheme(pref, detectPageIsDark(document), prefersDark);
    ui.host.dataset.theme = state.theme;
  };
  applyTheme(await themePref.getValue());
  onStop(themePref.watch(applyTheme));
}

export function stopSession(): void {
  controller?.abort();
  controller = null;
  const fns = cleanups;
  cleanups = [];
  for (const fn of fns) fn();
  Object.assign(state, { active: false, hovered: null, selected: null, inspectOn: false });
}
