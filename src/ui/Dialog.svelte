<script lang="ts">
  import { i18n } from '#i18n';
  import { onMount } from 'svelte';

  let { title, message, close }: { title: string; message: string; close: () => void } = $props();
  let ok: HTMLButtonElement;
  onMount(() => ok.focus());

  function onkeydown(e: KeyboardEvent) {
    // tools never see keys typed while the dialog is up (9.24)
    e.stopPropagation();
    if (e.key !== 'Enter' && e.key !== 'Escape') return;
    e.preventDefault();
    close();
  }
</script>

<div class="pointer-events-auto fixed inset-0 grid place-items-center bg-black/40 font-sans">
  <div
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="bd-dialog-title"
    aria-describedby="bd-dialog-msg"
    class="w-[320px] rounded-panel border border-line bg-surface p-4 text-[13px] text-fg shadow-xl backdrop-blur-surface"
    tabindex="-1"
    {onkeydown}
  >
    <h2 id="bd-dialog-title" class="mb-1.5 font-semibold">{title}</h2>
    <p id="bd-dialog-msg" class="mb-4 text-fg-muted">{message}</p>
    <div class="flex justify-end">
      <button
        bind:this={ok}
        type="button"
        class="rounded-btn bg-accent px-4 py-1 font-medium text-white"
        onclick={close}>{i18n.t('dialog.ok')}</button
      >
    </div>
  </div>
</div>
