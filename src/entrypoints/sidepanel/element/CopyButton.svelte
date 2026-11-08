<script lang="ts">
  import { i18n } from '#i18n';
  import Check from '@lucide/svelte/icons/check';
  import Copy from '@lucide/svelte/icons/copy';
  import { onDestroy } from 'svelte';
  import { copyText } from '../../../lib/ext/clipboard';

  let { text, label = false }: { text: string | (() => string); label?: boolean } = $props();
  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onDestroy(() => clearTimeout(timer));

  async function copy(e: MouseEvent) {
    e.stopPropagation();
    if (!(await copyText(typeof text === 'function' ? text() : text))) return;
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1500);
  }
  const name = $derived(i18n.t(copied ? 'panel.copied' : 'panel.copy'));
</script>

<button
  type="button"
  class="inline-flex h-6 shrink-0 items-center gap-1 rounded-btn px-1.5 text-fg-muted hover:bg-line hover:text-fg"
  class:text-emerald-500={copied}
  title={name}
  aria-label={name}
  data-copy
  onclick={copy}
>
  {#if copied}<Check class="size-3.5" />{:else}<Copy class="size-3.5" />{/if}
  {#if label}<span>{name}</span>{/if}
</button>
