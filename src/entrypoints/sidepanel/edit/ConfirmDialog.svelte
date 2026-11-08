<script lang="ts" module>
  interface Ask {
    title: string;
    message: string;
    /** false: a notice with one OK button. */
    confirm: boolean;
    done: (ok: boolean) => void;
  }
  const dialog = $state({ ask: null as Ask | null });

  function show(title: string, message: string, confirm: boolean): Promise<boolean> {
    dialog.ask?.done(false);
    return new Promise((done) => (dialog.ask = { title, message, confirm, done }));
  }
  export const askConfirm = (title: string, message: string) => show(title, message, true);
  export const showAlert = (title: string, message: string) =>
    show(title, message, false).then(() => {});
</script>

<script lang="ts">
  import { i18n } from '#i18n';
  import Dialog from '../../../ui/Dialog.svelte';

  function close(ok = false) {
    const a = dialog.ask;
    dialog.ask = null;
    a?.done(ok);
  }
</script>

{#if dialog.ask}
  <Dialog
    title={dialog.ask.title}
    message={dialog.ask.message}
    buttons={dialog.ask.confirm
      ? { cancel: i18n.t('dialog.cancel'), confirm: i18n.t('dialog.confirm') }
      : null}
    {close}
  />
{/if}
