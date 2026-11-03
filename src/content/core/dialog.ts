import { i18n } from '#i18n';
import Dialog from '../../ui/Dialog.svelte';
import { mountInShadow } from '../../ui/mount';
import { layer } from './overlay';
import type { MessageKey } from './registry.svelte';
import { onStop } from './session';
import { state } from './state.svelte';

function open(
  title: string,
  message: string,
  buttons: { cancel: string; confirm: string } | null,
): Promise<boolean> {
  const root = layer.getRootNode();
  if (!(root instanceof ShadowRoot)) return Promise.resolve(false);
  return new Promise((resolve) => {
    let unmount: (() => void) | null = null;
    const close = (ok = false) => {
      if (!unmount) return;
      unmount();
      unmount = null;
      state.dialog = false;
      resolve(ok);
    };
    state.dialog = true;
    unmount = mountInShadow(root, Dialog, { title, message, buttons, close });
    onStop(close);
  });
}

/** Alert in the main host (port of tu, content.js:11899); resolves when dismissed. */
export async function alertDialog(title: string, message: string): Promise<void> {
  await open(title, message, null);
}

/** Cancel / confirm dialog (9.44): Esc cancels, Enter confirms, session stop cancels. */
export function confirmDialog(
  title: string,
  message: string,
  confirmKey: MessageKey = 'dialog.confirm',
): Promise<boolean> {
  return open(title, message, {
    cancel: i18n.t('dialog.cancel'),
    confirm: i18n.t(confirmKey),
  });
}
