<script lang="ts">
  import { i18n } from '#i18n';
  import type { Snippet } from 'svelte';
  import { formatDim, formatSize } from '../../../lib/format';
  import type { CanvasInfo, ElementDetails, Sides } from '../../../lib/element/types';
  import Section from '../Section.svelte';

  let { el, fps }: { el: ElementDetails; fps: number | null } = $props();
  const b = $derived(el.boxModel);
  const any = (s: Sides) => s.top || s.right || s.bottom || s.left;
  const v = (n: number) => (n ? formatDim(n) : '-');
  const canvasRows = (c: CanvasInfo): [string, string][] => [
    [i18n.t('panel.contextType'), c.contextType ?? i18n.t('panel.unknown')],
    [i18n.t('panel.canvasDimensions'), formatSize(c.width, c.height)],
    [i18n.t('panel.pixelRatio'), `${c.pixelRatio}x`],
    ...(fps !== null ? [['FPS', String(fps)] as [string, string]] : []),
  ];
</script>

<!-- One ring of the box: label top-left, side values around, the next ring inside. Rings with
     a non-zero side are tinted (legacy box-model.html), zero sides read "-". -->
{#snippet ring(name: string, kind: string, s: Sides, tint: string, inner: Snippet)}
  <div
    class="grid grid-cols-[minmax(2rem,auto)_1fr_minmax(2rem,auto)] rounded-[5px] border border-dashed border-line-strong text-center tabular-nums {any(
      s,
    )
      ? tint
      : ''}"
    data-ring={kind}
  >
    <div class="col-span-3 grid grid-cols-[1fr_auto_1fr] items-center px-1.5 pt-0.5">
      <span class="text-left text-[10px] text-fg-muted">{name}</span>
      <span class:text-fg-muted={!s.top} data-side="top">{v(s.top)}</span>
      <span></span>
    </div>
    <span class="self-center px-1" class:text-fg-muted={!s.left} data-side="left">{v(s.left)}</span>
    <div class="py-0.5">{@render inner()}</div>
    <span class="self-center px-1" class:text-fg-muted={!s.right} data-side="right"
      >{v(s.right)}</span
    >
    <span class="col-span-3 pb-0.5" class:text-fg-muted={!s.bottom} data-side="bottom"
      >{v(s.bottom)}</span
    >
  </div>
{/snippet}

{#snippet content()}
  <div
    class="mx-auto rounded-[3px] border border-sky-500/50 bg-sky-500/15 px-2 py-1.5 font-medium tabular-nums"
    data-content
  >
    {formatSize(b.contentWidth, b.contentHeight)}
  </div>
{/snippet}
{#snippet padding()}
  {@render ring(i18n.t('panel.padding'), 'padding', b.padding, 'bg-emerald-500/12', content)}
{/snippet}
{#snippet border()}
  {@render ring(i18n.t('panel.border'), 'border', b.border, 'bg-amber-400/15', padding)}
{/snippet}

<Section id="layout" title={i18n.t('panel.boxModel')} pinned>
  <div class="font-mono text-[11px]" data-box>
    {@render ring(i18n.t('panel.margin'), 'margin', b.margin, 'bg-orange-500/12', border)}
  </div>
  {#if el.canvas}
    <div class="mt-3" data-canvas>
      <div class="mb-1 font-semibold">{i18n.t('panel.canvas')}</div>
      <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {#each canvasRows(el.canvas) as [k, val] (k)}
          <dt class="text-fg-muted">{k}</dt>
          <dd class="text-right font-mono tabular-nums">{val}</dd>
        {/each}
      </dl>
    </div>
  {/if}
</Section>
