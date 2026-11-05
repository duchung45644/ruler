<script lang="ts">
  import { i18n } from '#i18n';
  import { onMount, untrack } from 'svelte';

  let {
    title,
    message,
    buttons = null,
    fields = null,
    close,
  }: {
    title: string;
    message: string;
    /** Labels for a cancel / confirm pair; null shows a single OK. */
    buttons?: { cancel: string; confirm: string } | null;
    /** Number inputs (9.45, size prompt); confirm only closes when every value is in range. */
    fields?: { label: string; value: number; min: number; max: number }[] | null;
    close: (ok?: boolean, values?: number[]) => void;
  } = $props();
  let ok: HTMLButtonElement;
  const inputs: HTMLInputElement[] = [];
  /** `bind:value` on a number input gives a number, or null when empty. */
  let values = $state<(number | null)[]>(untrack(() => (fields ?? []).map((f) => f.value)));
  let tried = $state(false);
  onMount(() => (inputs[0] ?? ok).focus());

  const valid = (i: number): boolean => {
    const f = fields![i]!;
    const n = values[i];
    return typeof n === 'number' && Number.isInteger(n) && n >= f.min && n <= f.max;
  };

  function confirm() {
    if (!fields) return close(true);
    tried = true;
    if (fields.every((_, i) => valid(i))) close(true, values as number[]);
  }

  function onkeydown(e: KeyboardEvent) {
    // tools never see keys typed while the dialog is up (9.24)
    e.stopPropagation();
    if (e.key !== 'Enter' && e.key !== 'Escape') return;
    e.preventDefault();
    if (e.key === 'Enter') confirm();
    else close(false);
  }
</script>

<div class="pointer-events-auto fixed inset-0 grid place-items-center bg-black/40 font-sans">
  <div
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="bd-dialog-title"
    aria-describedby={message ? 'bd-dialog-msg' : undefined}
    class="w-[320px] rounded-panel border border-line bg-surface p-4 text-[13px] text-fg shadow-xl backdrop-blur-surface"
    tabindex="-1"
    {onkeydown}
  >
    <h2 id="bd-dialog-title" class="mb-1.5 font-semibold">{title}</h2>
    {#if message}
      <p id="bd-dialog-msg" class="mb-4 text-fg-muted">{message}</p>
    {/if}
    {#if fields}
      <div class="mb-4 flex gap-2">
        {#each fields as f, i (f.label)}
          <label class="flex min-w-0 flex-1 flex-col gap-1 text-fg-muted">
            {f.label}
            <input
              bind:this={inputs[i]}
              bind:value={values[i]}
              type="number"
              min={f.min}
              max={f.max}
              step="1"
              aria-invalid={tried && !valid(i)}
              class="rounded-btn border border-line bg-transparent px-2 py-1 text-fg tabular-nums aria-invalid:border-red-500"
            />
          </label>
        {/each}
      </div>
    {/if}
    <div class="flex justify-end gap-2">
      {#if buttons}
        <button
          type="button"
          class="rounded-btn px-4 py-1 font-medium text-fg hover:bg-line"
          onclick={() => close(false)}>{buttons.cancel}</button
        >
      {/if}
      <button
        bind:this={ok}
        type="button"
        class="rounded-btn bg-accent px-4 py-1 font-medium text-white"
        onclick={confirm}>{buttons?.confirm ?? i18n.t('dialog.ok')}</button
      >
    </div>
  </div>
</div>
