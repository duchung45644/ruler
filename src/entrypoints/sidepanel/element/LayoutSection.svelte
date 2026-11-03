<script lang="ts">
  import { i18n } from '#i18n';
  import type { FlexInfo, GridInfo } from '../../../lib/element/types';
  import Section from '../Section.svelte';

  let { layout }: { layout: FlexInfo | GridInfo } = $props();
  const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const rows = $derived(
    Object.entries(layout).filter(
      ([k, v]) =>
        k !== 'display' && k !== 'columnCount' && k !== 'rowCount' && v !== '' && v !== 'normal',
    ) as [string, string][],
  );
  const grid = $derived('columnCount' in layout ? layout : null);
</script>

<Section id="flexbox" title={i18n.t('panel.layout')}>
  <div class="mb-2 flex items-center gap-2" data-layout>
    <span class="rounded bg-accent/15 px-1.5 py-0.5 font-mono font-medium text-accent"
      >{layout.display}</span
    >
    {#if grid}
      <span class="font-mono text-fg-muted tabular-nums">{grid.columnCount} × {grid.rowCount}</span>
    {/if}
  </div>
  <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px]">
    {#each rows as [k, val] (k)}
      <dt class="text-fg-muted">{kebab(k)}</dt>
      <dd class="min-w-0 text-right break-words">{val}</dd>
    {/each}
  </dl>
</Section>
