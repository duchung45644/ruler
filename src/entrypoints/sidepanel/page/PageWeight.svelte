<script lang="ts">
  import { i18n } from '#i18n';
  import { formatBytes } from '../../../lib/format';
  import { PW_TYPES, type PageWeight } from '../../../lib/page/types';
  import Section from '../Section.svelte';

  let { weight }: { weight: PageWeight } = $props();
  const label = {
    document: i18n.t('page.pwDocument'),
    script: i18n.t('page.pwScript'),
    css: i18n.t('page.pwCss'),
    img: i18n.t('page.pwImg'),
    font: i18n.t('page.pwFont'),
    fetch: i18n.t('page.pwFetch'),
    media: i18n.t('page.pwMedia'),
    other: i18n.t('page.pwOther'),
  };
  const color = {
    document: 'bg-zinc-400',
    script: 'bg-amber-400',
    css: 'bg-sky-400',
    img: 'bg-emerald-400',
    font: 'bg-violet-400',
    fetch: 'bg-rose-400',
    media: 'bg-pink-400',
    other: 'bg-zinc-500',
  };
  const rows = $derived(
    (
      [
        ['document', weight.document],
        ...PW_TYPES.map((t) => [t, weight.byType[t]] as const),
      ] as const
    ).filter(([, b]) => b > 0),
  );
</script>

<Section id="pageWeight" title={i18n.t('page.pageWeight')}>
  {#snippet actions()}
    <span class="font-mono font-semibold tabular-nums" data-pw-total
      >{formatBytes(weight.total)}</span
    >
  {/snippet}
  {#if weight.total > 0}
    <div class="mb-2 flex h-2 overflow-hidden rounded-full bg-line">
      {#each rows as [t, b] (t)}
        <div class={color[t]} style:width="{(b / weight.total) * 100}%"></div>
      {/each}
    </div>
  {/if}
  <table class="w-full">
    <tbody>
      {#each rows as [t, b] (t)}
        <tr data-pw={t}>
          <td class="py-0.5"
            ><span class="mr-1.5 inline-block size-2 rounded-full {color[t]}"></span>{label[t]}</td
          >
          <td class="py-0.5 text-right font-mono text-fg-muted tabular-nums"
            >{weight.total ? Math.round((b / weight.total) * 100) : 0}%</td
          >
          <td class="w-20 py-0.5 text-right font-mono tabular-nums">{formatBytes(b)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if weight.unknownCount > 0}
    <p class="mt-1.5 text-[10.5px] text-fg-muted" data-pw-hidden>
      {i18n.t('page.pwHidden', [String(weight.unknownCount)])}
    </p>
  {/if}
  {#if weight.bufferFull}
    <p class="mt-1 text-[10.5px] text-amber-500" data-pw-full>{i18n.t('page.pwBufferFull')}</p>
  {/if}
</Section>
