import Pipette from '@lucide/svelte/icons/pipette';
import { copyText } from '../../../lib/ext/clipboard';
import { formatCss } from '../../../lib/style/color';
import { host, layer, requestPaint } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';

declare const EyeDropper: { new (): { open(): Promise<{ sRGBHex: string }> } };

/** 3.07, port of activateEyedropper (legacy-src/content.js:34586). */
let busy = false;

async function pick(): Promise<void> {
  if (busy || !('EyeDropper' in window)) return;
  const ui = host();
  if (ui === layer) return;
  ui.dataset.hidden = ''; // theme.css :host([data-hidden]) — inline styles lose to WXT's reset
  state.hovered = null;
  requestPaint();
  const ac = new AbortController();
  const signal = AbortSignal.any([ac.signal, sessionSignal()]);
  const reveal = () => {
    ac.abort();
    delete ui.dataset.hidden;
  };
  signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
  // the picker may leave without settling; the first press after 300ms brings the UI back
  const timer = setTimeout(() => {
    document.addEventListener('pointerdown', reveal, { capture: true, signal });
    document.addEventListener('keydown', reveal, { capture: true, signal });
  }, 300);
  busy = true;
  try {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const { sRGBHex } = await new EyeDropper().open();
    reveal();
    const text = formatCss(sRGBHex, state.colorFormat);
    if (await copyText(text)) state.dockNotice = { id: 'eyedropper', color: sRGBHex, text };
  } catch {
    reveal(); // Esc cancels with AbortError
  } finally {
    busy = false;
  }
}

export function initEyedropper(): void {
  registerItem({
    id: 'eyedropper',
    forward: true,
    icon: Pipette,
    label: 'dock.eyedropper',
    key: 'c',
    run: () => void pick(),
  });
}
