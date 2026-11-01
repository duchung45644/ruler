import Pipette from '@lucide/svelte/icons/pipette';
import { copyText } from '../../../lib/clipboard';
import { parseColor, toHex } from '../../../lib/color';
import { layer, requestPaint } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { state } from '../../core/state.svelte';

declare const EyeDropper: { new (): { open(): Promise<{ sRGBHex: string }> } };

/** 3.07, port of activateEyedropper (legacy-src/content.js:34586). */
async function pick(): Promise<void> {
  if (!('EyeDropper' in window)) return;
  const host = (layer.getRootNode() as ShadowRoot).host as HTMLElement | undefined;
  if (!host) return;
  host.dataset.hidden = ''; // theme.css :host([data-hidden]) — inline styles lose to WXT's reset
  state.hovered = null;
  requestPaint();
  const ac = new AbortController();
  const reveal = () => {
    clearTimeout(timer);
    ac.abort();
    delete host.dataset.hidden;
  };
  // the picker may leave without settling; the first press after 300ms brings the UI back
  const timer = setTimeout(() => {
    document.addEventListener('pointerdown', reveal, { capture: true, signal: ac.signal });
    document.addEventListener('keydown', reveal, { capture: true, signal: ac.signal });
  }, 300);
  try {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const { sRGBHex } = await new EyeDropper().open();
    reveal();
    const c = parseColor(sRGBHex);
    if (!c) return;
    const hex = toHex(c).toUpperCase();
    if (await copyText(hex)) state.dockNotice = { id: 'eyedropper', color: hex, text: hex };
  } catch {
    reveal(); // Esc cancels with AbortError
  }
}

registerItem({
  id: 'eyedropper',
  icon: Pipette,
  label: 'dock.eyedropper',
  key: '6',
  group: 'utilities',
  run: () => void pick(),
});
