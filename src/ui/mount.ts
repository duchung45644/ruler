import { mount, unmount, type Component } from 'svelte';
import { createShadowRootUi, type ContentScriptContext } from '#imports';

export async function mountUi(
  ctx: ContentScriptContext,
  component: Component,
  props?: Record<string, unknown>,
): Promise<{ host: HTMLElement; shadow: ShadowRoot; remove(): void }> {
  const ui = await createShadowRootUi(ctx, {
    name: 'bo-doi-ui',
    position: 'inline', // stacking comes from the :host rule in theme.css
    anchor: 'html',
    isolateEvents: true,
    onMount: (container) => mount(component, { target: container, props }),
    onRemove: (app) => app && unmount(app),
  });
  ui.mount();
  // Host stacking (fixed, max z-index) lives in theme.css as :host: WXT's shadow reset would beat inline styles.
  const host = ui.shadowHost;
  // Buttons never take focus, so Space/keys after a click still reach the shortcuts (not the button).
  ui.shadow.addEventListener('mousedown', (e) => {
    if ((e.target as Element).closest?.('button')) e.preventDefault();
  });
  return { host, shadow: ui.shadow, remove: () => ui.remove() };
}
