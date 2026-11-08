<script lang="ts">
  import { i18n } from '#i18n';
  import type { Snippet } from 'svelte';
  import { formatDim, formatSize } from '../../../lib/style/format';
  import type { CanvasInfo, ElementDetails, Sides } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import { toPage } from '../store.svelte';

  let { el, fps }: { el: ElementDetails; fps: number | null } = $props();
  const b = $derived(el.boxModel);
  /** Ring under the pointer: like DevTools, only it keeps its colour, the rest go white. */
  let hot = $state<string | null>(null);
  // the same part lights up on the page, like DevTools (nothing is sent until a ring is hovered)
  let lit = false;
  $effect(() => {
    if (!hot && !lit) return;
    lit = !!hot;
    void toPage('highlight_box_part', hot as 'margin' | null);
  });
  $effect(() => () => void (lit && toPage('highlight_box_part', null)));
  const paint = (kind: string, fill: string) => (hot && hot !== kind ? '#fff' : fill);
  const v = (n: number) => (n ? formatDim(n) : '0');
  const canvasRows = (c: CanvasInfo): [string, string][] => [
    [i18n.t('panel.contextType'), c.contextType ?? i18n.t('panel.unknown')],
    [i18n.t('panel.canvasDimensions'), formatSize(c.width, c.height)],
    [i18n.t('panel.pixelRatio'), `${c.pixelRatio}x`],
    ...(fps !== null ? [['FPS', String(fps)] as [string, string]] : []),
  ];
</script>

<!-- One ring of the box, drawn like the browser's DevTools: fixed fill per ring, black borders
     (margin and padding dashed, border solid), label top-left, side values around. -->
{#snippet ring(name: string, kind: string, s: Sides, fill: string, line: string, inner: Snippet)}
  <!-- svelte-ignore a11y_mouse_events_have_key_events (pointer-only colour hint) -->
  <div
    class="grid grid-cols-[minmax(1.5rem,auto)_1fr_minmax(1.5rem,auto)] border border-black {line} text-center tabular-nums"
    style:background={paint(kind, fill)}
    data-ring={kind}
    role="presentation"
    onmouseover={(e) => {
      e.stopPropagation();
      hot = kind;
    }}
  >
    <div class="col-span-3 grid grid-cols-[1fr_auto_1fr] items-center px-1 leading-4">
      <span class="text-left lowercase">{name}</span>
      <span data-side="top">{v(s.top)}</span>
      <span></span>
    </div>
    <span class="self-center px-0.5" data-side="left">{v(s.left)}</span>
    <div>{@render inner()}</div>
    <span class="self-center px-0.5" data-side="right">{v(s.right)}</span>
    <span class="col-span-3 leading-4" data-side="bottom">{v(s.bottom)}</span>
  </div>
{/snippet}

{#snippet content()}
  <!-- svelte-ignore a11y_mouse_events_have_key_events (pointer-only colour hint) -->
  <div
    class="border border-black px-1.5 leading-4 tabular-nums"
    style:background={paint('content', '#8cb6c0')}
    data-content
    role="presentation"
    onmouseover={(e) => {
      e.stopPropagation();
      hot = 'content';
    }}
  >
    {formatSize(b.contentWidth, b.contentHeight)}
  </div>
{/snippet}
{#snippet padding()}
  {@render ring(i18n.t('panel.padding'), 'padding', b.padding, '#c3d08b', 'border-dashed', content)}
{/snippet}
{#snippet border()}
  {@render ring(i18n.t('panel.border'), 'border', b.border, '#fddd9b', 'border-solid', padding)}
{/snippet}

<Section id="layout" title={i18n.t('panel.boxModel')} pinned>
  <div
    class="mx-auto w-65 max-w-full font-sans text-[11px] text-[#222]"
    data-box
    role="presentation"
    onmouseleave={() => (hot = null)}
  >
    {@render ring(
      i18n.t('panel.margin'),
      'margin',
      b.margin,
      'bg-orange-500/12',
      'border-dashed',
      border,
    )}
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
