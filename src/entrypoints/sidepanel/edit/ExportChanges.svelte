<script lang="ts">
  import { i18n } from '#i18n';
  import Check from '@lucide/svelte/icons/check';
  import Copy from '@lucide/svelte/icons/copy';
  import { onDestroy } from 'svelte';
  import {
    toBlocks,
    toCss,
    toPrompt,
    toTailwindText,
    type ExportFormat,
  } from '../../../lib/edit/export';
  import { copyText } from '../../../lib/ext/clipboard';
  import { panel } from '../store.svelte';
  import type { Changes } from './edit-store.svelte';

  let { changes }: { changes: Changes } = $props();

  let format = $state<ExportFormat>('css');
  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onDestroy(() => clearTimeout(timer));

  const formats: [ExportFormat, string][] = [
    ['css', i18n.t('changes.formatCss')],
    ['tailwind', i18n.t('changes.formatTailwind')],
    ['prompt', i18n.t('changes.formatPrompt')],
  ];
  const blocks = $derived(
    toBlocks(
      changes.rules,
      Object.fromEntries(changes.html.map((h) => [h.id, h.cssSelector || h.selector])),
    ),
  );

  async function text(): Promise<string> {
    if (format === 'css') return toCss(blocks);
    if (format === 'prompt') return toPrompt(blocks, panel.page?.url ?? '');
    // the converter is large: loaded on first Tailwind copy, not with the panel
    const { tailwindClasses } = await import('../../../lib/css/tailwind');
    return toTailwindText(blocks, tailwindClasses);
  }

  async function copy() {
    if (!(await copyText(await text()))) return;
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="flex items-center" data-export-changes>
  <select
    class="h-[26px] rounded-l-btn border border-line bg-transparent px-1 text-fg-muted disabled:opacity-50"
    aria-label={i18n.t('changes.exportFormat')}
    disabled={!blocks.length}
    bind:value={format}
    data-export-format
  >
    {#each formats as [f, label] (f)}<option value={f}>{label}</option>{/each}
  </select>
  <button
    type="button"
    class="-ml-px inline-flex h-[26px] items-center gap-1 rounded-r-btn border border-line px-2 font-medium text-fg-muted hover:text-fg disabled:pointer-events-none disabled:opacity-50"
    class:text-emerald-500={copied}
    disabled={!blocks.length}
    title={i18n.t('changes.copyAllHint')}
    data-copy-all
    onclick={copy}
  >
    {#if copied}<Check class="size-3.5" />{:else}<Copy class="size-3.5" />{/if}
    {i18n.t(copied ? 'panel.copied' : 'changes.copyAll')}
  </button>
</div>
