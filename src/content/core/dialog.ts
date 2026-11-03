import Dialog from '../../ui/Dialog.svelte';
import { mountInShadow } from '../../ui/mount';
import { layer } from './overlay';
import { onStop } from './session';
import { state } from './state.svelte';

/** Alert in the main host (port of tu, content.js:11899); resolves when dismissed. */
export function alertDialog(title: string, message: string): Promise<void> {
  const root = layer.getRootNode();
  if (!(root instanceof ShadowRoot)) return Promise.resolve();
  return new Promise((resolve) => {
    let unmount: (() => void) | null = null;
    const close = () => {
      if (!unmount) return;
      unmount();
      unmount = null;
      state.dialog = false;
      resolve();
    };
    state.dialog = true;
    unmount = mountInShadow(root, Dialog, { title, message, close });
    onStop(close);
  });
}
