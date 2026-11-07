<script lang="ts">
  import { i18n } from '#i18n';
  import Download from '@lucide/svelte/icons/download';
  import { justifiedRows } from '../../../lib/element/assets';
  import type { Asset } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import { assetPreview, downloadAsset, requestDownloads } from './actions';

  let { assets }: { assets: Asset[] } = $props();
  const GAP = 4;
  let width = $state(0);
  // before the first measure (and in tests) assume a typical panel width
  const rows = $derived(
    justifiedRows(
      assets.map((a) => ({ w: a.renderedWidth || 1, h: a.renderedHeight || 1 })),
      width || 280,
      88,
      GAP,
    ),
  );
  const ratio = (a: Asset) =>
    Math.max(0.66, Math.min(2.5, (a.renderedWidth || 1) / (a.renderedHeight || 1)));

  async function download(list: Asset[]) {
    if (!(await requestDownloads())) return;
    for (const a of list) await downloadAsset(a).catch(() => {});
  }
</script>

<Section
  id="assets"
  title={i18n.t(assets.length === 1 ? 'panel.asset' : 'panel.assets')}
  count={assets.length}
>
  {#snippet actions()}
    {#if assets.length > 1}
      <button
        type="button"
        class="inline-flex h-6 items-center gap-1 rounded-btn px-1.5 text-fg-muted hover:bg-line hover:text-fg"
        data-download-all
        onclick={() => void download(assets)}
      >
        <Download class="size-3.5" />{i18n.t('panel.downloadAll')}
      </button>
    {/if}
  {/snippet}
  <!-- ResizeObserver via bind: the grid re-justifies when the panel is resized -->
  <div class="flex flex-col" style:gap="{GAP}px" bind:clientWidth={width} data-assets>
    {#each rows as row, r (r)}
      <div class="flex" style:gap="{GAP}px" style:height="{row.height}px">
        {#each row.items as i (i)}
          {@const a = assets[i]!}
          <div
            class="group relative overflow-hidden rounded-md border border-line bg-[conic-gradient(var(--color-line)_25%,transparent_0_50%,var(--color-line)_0_75%,transparent_0)] bg-[length:12px_12px]"
            style:width="{row.height * ratio(a)}px"
            data-asset={a.type}
          >
            <img src={assetPreview(a)} alt="" class="size-full object-contain" loading="lazy" />
            <button
              type="button"
              class="absolute right-1 bottom-1 grid size-6 place-items-center rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 focus:opacity-100"
              title={i18n.t('panel.download')}
              aria-label={i18n.t('panel.download')}
              data-download
              onclick={() => void download([a])}
            >
              <Download class="size-3.5" />
            </button>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</Section>
