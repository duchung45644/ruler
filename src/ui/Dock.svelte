<script lang="ts">
  import { dockGroups, itemLocked, items } from '../content/core/registry.svelte';
  import { state as app } from '../content/core/state.svelte';
  import { cubicOut } from 'svelte/easing';
  import DockButton from './DockButton.svelte';
  import Palette from './Palette.svelte';
  import Tour from './Tour.svelte';
  import Popover from './Popover.svelte';

  let dock: HTMLElement = $state()!;
  const open = $derived(items.find((i) => i.id === app.popover && i.popover));
  const groups = $derived(dockGroups());
  /**
   * One keyed list (separators included): leaving buttons shrink in place, so the rest slide
   * over and the dock narrows smoothly (no flip: it takes leavers out of the flow at once).
   */
  const entries = $derived(
    groups.flatMap((g, gi) => [
      ...(gi ? [{ key: `sep:${g[0]!.id}`, item: null }] : []),
      ...g.map((item) => ({ key: item.id, item })),
    ]),
  );
  const GAP = 3; // the dock's gap-[3px]
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Grow from / shrink to nothing: width, the gap after it, opacity and a little scale. */
  function collapse(node: HTMLElement) {
    const w = node.offsetWidth;
    const cs = getComputedStyle(node);
    const ml = parseFloat(cs.marginLeft) || 0;
    const mr = parseFloat(cs.marginRight) || 0;
    return {
      duration: reduced() ? 0 : 200,
      easing: cubicOut,
      css: (t: number) =>
        `width:${t * w}px;margin-left:${t * ml}px;margin-right:${t * mr - (1 - t) * GAP}px;` +
        `opacity:${t};transform:scale(${0.6 + 0.4 * t});overflow:hidden`,
    };
  }

  // Resize label (1.29): show W × H for 800ms, freeze dock transitions for 150ms.
  let size = $state('');
  let resizing = $state(false);
  let sizeTimer = 0;
  let transTimer = 0;
  function onResize() {
    size = `${innerWidth} × ${innerHeight}`;
    resizing = true;
    clearTimeout(sizeTimer);
    clearTimeout(transTimer);
    sizeTimer = window.setTimeout(() => (size = ''), 800);
    transTimer = window.setTimeout(() => (resizing = false), 150);
  }
  $effect(() => () => (clearTimeout(sizeTimer), clearTimeout(transTimer)));
</script>

<svelte:window onresize={onResize} />

<div
  bind:this={dock}
  data-dock
  class="fixed bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-[3px] rounded-panel border border-line bg-surface p-[5px] font-sans text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
  class:transition-all={!resizing}
>
  {#each entries as e (e.key)}
    <span class="flex shrink-0" transition:collapse>
      {#if e.item}
        <DockButton item={e.item} disabled={itemLocked(e.item) || !!e.item.isDisabled?.()} />
      {:else}
        <span class="mx-1 h-5 w-px self-center bg-line-strong"></span>
      {/if}
    </span>
  {/each}
  {#if !app.inFrame}<Tour {dock} />{/if}
  {#if open?.popover}
    {#key open.id}<Popover id={open.id} {dock} body={open.popover} />{/key}
  {/if}
</div>

{#if app.palette}<Palette />{/if}

{#if size}
  <div
    class="fixed top-2 right-2 rounded-btn border border-line bg-surface px-2 py-1 font-mono text-[11px] text-fg backdrop-blur-surface"
  >
    {size}
  </div>
{/if}
