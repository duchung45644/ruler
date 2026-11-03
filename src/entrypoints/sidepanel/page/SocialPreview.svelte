<script lang="ts">
  import { i18n } from '#i18n';
  import Download from '@lucide/svelte/icons/download';
  import type { PageData } from '../../../lib/page/types';
  import { updatePanelPrefs, type SidePanelPrefs } from '../../../lib/settings';
  import { downloadAsset, requestDownloads } from '../element/actions';
  import Section from '../Section.svelte';
  import { panel } from '../store.svelte';

  type Kind = SidePanelPrefs['socialPreviewType'];
  let { page }: { page: PageData } = $props();
  const kinds: [Kind, string][] = [
    ['facebook', i18n.t('page.facebook')],
    ['x', i18n.t('page.x')],
    ['linkedin', i18n.t('page.linkedin')],
  ];
  const kind = $derived(panel.prefs.socialPreviewType);
  const og = $derived(page.meta.openGraph);
  const tw = $derived(page.meta.twitter);
  const isX = $derived(kind === 'x');
  const title = $derived(
    (isX ? tw['twitter:title'] : null) ?? og['og:title'] ?? page.meta.seo.title ?? page.title,
  );
  const description = $derived(
    (isX ? tw['twitter:description'] : null) ?? og['og:description'] ?? page.meta.seo.description,
  );
  const image = $derived((isX ? tw['twitter:image'] : null) ?? page.ogImage);
  const domain = $derived.by(() => {
    try {
      return new URL(og['og:url'] ?? page.url).host;
    } catch {
      return '';
    }
  });
  let broken = $state<string | null>(null);

  function pick(k: Kind) {
    panel.prefs = { ...panel.prefs, socialPreviewType: k };
    void updatePanelPrefs({ socialPreviewType: k });
  }
  async function download() {
    if (!page.ogImage || !(await requestDownloads())) return;
    await downloadAsset({
      type: 'src',
      url: page.ogImage,
      renderedWidth: 0,
      renderedHeight: 0,
    }).catch(() => {});
  }
</script>

<Section id="socialPreview" title={i18n.t('page.socialPreview')}>
  {#snippet actions()}
    <button
      type="button"
      class="grid size-6 place-items-center rounded-btn text-fg-muted hover:bg-line hover:text-fg"
      title={i18n.t('panel.download')}
      aria-label={i18n.t('panel.download')}
      data-download-og
      onclick={() => void download()}><Download class="size-3.5" /></button
    >
  {/snippet}
  <div class="mb-2 flex gap-0.5 rounded-btn bg-line/60 p-0.5" role="radiogroup">
    {#each kinds as [k, label] (k)}
      <button
        type="button"
        role="radio"
        aria-checked={kind === k}
        class="flex-1 rounded-[5px] py-1 text-[11px] font-medium {kind === k
          ? 'bg-surface shadow-sm'
          : 'text-fg-muted hover:text-fg'}"
        data-kind={k}
        onclick={() => pick(k)}>{label}</button
      >
    {/each}
  </div>
  <div
    class="overflow-hidden border border-line {isX ? 'rounded-2xl' : 'rounded-btn'}"
    data-preview={kind}
  >
    {#if image && broken !== image}
      <div class="relative">
        <img
          src={image}
          alt=""
          class="aspect-[1.91/1] w-full bg-line object-cover"
          onerror={() => (broken = image)}
        />
        {#if isX && domain}
          <span class="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 text-[11px] text-white"
            >{domain}</span
          >
        {/if}
      </div>
    {/if}
    {#if !isX}
      <div class="border-t border-line bg-line/40 px-3 py-2">
        {#if kind === 'facebook'}
          <div class="truncate text-[10.5px] text-fg-muted uppercase">{domain}</div>
        {/if}
        <div class="line-clamp-2 leading-snug font-semibold" data-preview-title>{title}</div>
        {#if kind === 'facebook' && description}
          <div class="mt-0.5 line-clamp-1 text-fg-muted">{description}</div>
        {/if}
        {#if kind === 'linkedin'}
          <div class="mt-0.5 truncate text-[10.5px] text-fg-muted">{domain}</div>
        {/if}
      </div>
    {/if}
  </div>
  {#if isX}
    <div class="mt-1 truncate leading-snug" data-preview-title>{title}</div>
  {/if}
</Section>
