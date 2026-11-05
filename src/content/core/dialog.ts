import { i18n } from '#i18n';
import Dialog from '../../ui/Dialog.svelte';
import { mountInShadow } from '../../ui/mount';
import { layer } from './overlay';
import type { MessageKey } from './registry.svelte';
import { onStop } from './session';
import { state } from './state.svelte';

type Field = { label: string; value: number; min: number; max: number };

function open(
  title: string,
  message: string,
  buttons: { cancel: string; confirm: string } | null,
  fields: Field[] | null = null,
): Promise<{ ok: boolean; values?: number[] }> {
  const root = layer.getRootNode();
  if (!(root instanceof ShadowRoot)) return Promise.resolve({ ok: false });
  return new Promise((resolve) => {
    let unmount: (() => void) | null = null;
    const close = (ok = false, values?: number[]) => {
      if (!unmount) return;
      unmount();
      unmount = null;
      state.dialog = false;
      resolve({ ok, values });
    };
    state.dialog = true;
    unmount = mountInShadow(root, Dialog, { title, message, buttons, fields, close });
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
  }).then((r) => r.ok);
}

/** Width / height prompt (9.45, port of ou): integers within min–max, null when cancelled. */
export async function sizeDialog(
  title: string,
  initial: { width: number; height: number },
  range: { min: { width: number; height: number }; max: number },
): Promise<{ width: number; height: number } | null> {
  const r = await open(
    title,
    '',
    { cancel: i18n.t('dialog.cancel'), confirm: i18n.t('dialog.ok') },
    [
      {
        label: i18n.t('responsive.labelWidth'),
        value: initial.width,
        min: range.min.width,
        max: range.max,
      },
      {
        label: i18n.t('responsive.labelHeight'),
        value: initial.height,
        min: range.min.height,
        max: range.max,
      },
    ],
  );
  const [width, height] = r.values ?? [];
  return r.ok && width !== undefined && height !== undefined ? { width, height } : null;
}
