import Toast from '../../ui/Toast.svelte';
import { mountInShadow } from '../../ui/mount';
import { layer } from './overlay';
import { onStop } from './session';

let current: { unmount: () => void; timer: ReturnType<typeof setTimeout> } | null = null;
let hooked = false;

export function hideToast(): void {
  if (!current) return;
  clearTimeout(current.timer);
  current.unmount();
  current = null;
}

/** One toast at a time (D10): a new one replaces the old. */
export function showToast(text: string, ms = 5000): void {
  const root = layer.getRootNode();
  if (!(root instanceof ShadowRoot)) return;
  hideToast();
  current = { unmount: mountInShadow(root, Toast, { text }), timer: setTimeout(hideToast, ms) };
  if (!hooked) {
    hooked = true;
    onStop(() => {
      hooked = false;
      hideToast();
    });
  }
}
