import { mount, unmount, type Component } from 'svelte';
import { createShadowRootUi, type ContentScriptContext } from '#imports';
import { layer } from '../content/core/overlay';

export async function mountUi(
  ctx: ContentScriptContext,
  component: Component,
  props?: Record<string, unknown>,
  { name = 'iodob-ui' }: { name?: string } = {},
): Promise<{ host: HTMLElement; shadow: ShadowRoot; remove(): void }> {
  const ui = await createShadowRootUi(ctx, {
    name,
    position: 'inline', // stacking comes from the :host rule in theme.css
    anchor: 'html',
    // legacy makePanel stopped these at the panel (bd/core.js:238); window-capture listeners still see them first
    isolateEvents: [
      'keydown',
      'keyup',
      'keypress',
      'pointerdown',
      'mousedown',
      'click',
      'mousemove',
    ],
    onMount: (container) => mount(component, { target: container, props }),
    onRemove: (app) => app && unmount(app),
  });
  ui.mount();
  // Host stacking (fixed, max z-index) lives in theme.css as :host: WXT's shadow reset would beat inline styles.
  const host = ui.shadowHost;
  host.dataset.iodob = ''; // X-Ray skips [data-iodob]
  // Buttons never take focus, so Space/keys after a click still reach the shortcuts (not the button).
  ui.shadow.addEventListener('mousedown', (e) => {
    if ((e.target as Element).closest?.('button')) e.preventDefault();
  });
  return { host, shadow: ui.shadow, remove: () => ui.remove() };
}

/** Mount a component into a fresh div in the shadow root; returns the unmount fn. */
export function mountInShadow<P extends Record<string, unknown>>(
  shadow: ShadowRoot,
  component: Component<P>,
  props?: P,
): () => void {
  const target = shadow.appendChild(document.createElement('div'));
  const app = mount(component, { target, props: props ?? ({} as P) });
  return () => {
    unmount(app);
    target.remove();
  };
}

/** Tool panel show/hide: mounts `component` into the overlay layer's shadow root on, unmounts off. */
export function panelToggle(component: Component): (on: boolean) => void {
  let off: (() => void) | null = null;
  return (on) => {
    const shadow = layer.getRootNode();
    if (on && !off && shadow instanceof ShadowRoot) off = mountInShadow(shadow, component);
    else if (!on) {
      off?.();
      off = null;
    }
  };
}
