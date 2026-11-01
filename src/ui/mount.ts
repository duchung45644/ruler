import { mount, unmount, type Component } from 'svelte';
import { createShadowRootUi, type ContentScriptContext } from '#imports';

export async function mountUi(
  ctx: ContentScriptContext,
  component: Component,
  props?: Record<string, unknown>,
): Promise<{ host: HTMLElement; shadow: ShadowRoot; remove(): void }> {
  const ui = await createShadowRootUi(ctx, {
    name: 'bo-doi-ui',
    position: 'inline',
    anchor: 'html',
    isolateEvents: true,
    onMount: (container) => mount(component, { target: container, props }),
    onRemove: (app) => app && unmount(app),
  });
  ui.mount();
  return { host: ui.shadowHost, shadow: ui.shadow, remove: () => ui.remove() };
}
