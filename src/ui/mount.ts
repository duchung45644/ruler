import { mount, unmount, type Component } from 'svelte';
import { createShadowRootUi, type ContentScriptContext } from '#imports';

export async function mountUi(
  ctx: ContentScriptContext,
  component: Component,
  props?: Record<string, unknown>,
): Promise<{ host: HTMLElement; shadow: ShadowRoot; remove(): void }> {
  const ui = await createShadowRootUi(ctx, {
    name: 'bo-doi-ui',
    position: 'inline', // WXT leaves an inline host unstyled: we own its stacking below
    anchor: 'html',
    isolateEvents: true,
    onMount: (container) => mount(component, { target: container, props }),
    onRemove: (app) => app && unmount(app),
  });
  ui.mount();
  // A static host gives every in-page surface z-index:auto, so any page z-index (sticky
  // toolbars) paints over it. Fixed + max z-index makes the host the topmost stacking context;
  // !important beats page rules like `html > * { position: relative !important }`.
  const host = ui.shadowHost;
  for (const [k, v] of Object.entries({
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    overflow: 'visible',
    'z-index': '2147483647',
  }))
    host.style.setProperty(k, v, 'important');
  // Buttons never take focus, so Space/keys after a click still reach the shortcuts (not the button).
  ui.shadow.addEventListener('mousedown', (e) => {
    if ((e.target as Element).closest?.('button')) e.preventDefault();
  });
  return { host, shadow: ui.shadow, remove: () => ui.remove() };
}
