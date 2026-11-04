<script lang="ts">
  import { dockGroups, itemLocked, items } from '../content/core/registry.svelte';
  import { state as app } from '../content/core/state.svelte';
  import DockButton from './DockButton.svelte';
  import Popover from './Popover.svelte';

  let dock: HTMLElement = $state()!;
  const open = $derived(items.find((i) => i.id === app.popover && i.popover));
  const groups = $derived(dockGroups());

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
  class="fixed bottom-[10px] left-1/2 flex -translate-x-1/2 items-center gap-[3px] rounded-panel border border-line bg-surface p-[5px] font-sans text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
  class:transition-all={!resizing}
>
  {#each groups as group, gi (gi)}
    {#if gi}<span class="mx-[4px] h-5 w-px bg-line-strong"></span>{/if}
    {#each group as item (item.id)}
      <DockButton {item} disabled={itemLocked(item) || !!item.isDisabled?.()} />
    {/each}
  {/each}
  {#if open?.popover}
    {#key open.id}<Popover id={open.id} {dock} body={open.popover} />{/key}
  {/if}
</div>

{#if size}
  <div
    class="fixed top-2 right-2 rounded-btn border border-line bg-surface px-2 py-1 font-mono text-[11px] text-fg backdrop-blur-surface"
  >
    {size}
  </div>
{/if}
