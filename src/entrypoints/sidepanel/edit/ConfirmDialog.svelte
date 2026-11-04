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

  function close(ok: boolean) {
    const a = dialog.ask;
    dialog.ask = null;
    a?.done(ok);
  }
  let confirmButton = $state<HTMLButtonElement>();
  $effect(() => {
    if (dialog.ask) confirmButton?.focus();
  });
</script>

{#if dialog.ask}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
    role="presentation"
    onclick={(e) => e.target === e.currentTarget && close(false)}
    onkeydown={(e) => e.key === 'Escape' && close(false)}
  >
    <div
      class="w-full max-w-72 rounded-panel border border-line-strong bg-surface p-4 shadow-xl"
      role={dialog.ask.confirm ? 'alertdialog' : 'dialog'}
      aria-modal="true"
      aria-labelledby="bd-dialog-title"
      data-dialog
    >
      <h2 id="bd-dialog-title" class="mb-1.5 text-[13px] font-semibold">{dialog.ask.title}</h2>
      <p class="mb-4 text-fg-muted">{dialog.ask.message}</p>
      <div class="flex justify-end gap-2">
        {#if dialog.ask.confirm}
          <button
            type="button"
            class="rounded-btn px-3 py-1.5 font-medium text-fg-muted hover:bg-line hover:text-fg"
            data-dialog-cancel
            onclick={() => close(false)}>{i18n.t('dialog.cancel')}</button
          >
        {/if}
        <button
          type="button"
          bind:this={confirmButton}
          class="rounded-btn bg-accent px-3 py-1.5 font-medium text-white hover:brightness-110"
          data-dialog-confirm
          onclick={() => close(true)}
          >{i18n.t(dialog.ask.confirm ? 'dialog.confirm' : 'dialog.ok')}</button
        >
      </div>
    </div>
  </div>
{/if}
