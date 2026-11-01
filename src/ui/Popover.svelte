<script lang="ts">
  import type { Component } from 'svelte';
  import { popoverLeft } from '../lib/geometry';

  let { id, dock, body: Body }: { id: string; dock: HTMLElement; body: Component } = $props();
  let el: HTMLElement;
  let left = $state(0);

  // Measured once on open (legacy positionPopover :38491).
  $effect(() => {
    const btn = dock.querySelector(`[data-item="${id}"]`);
    if (btn)
      left = popoverLeft(btn.getBoundingClientRect(), dock.getBoundingClientRect(), el.offsetWidth);
  });
</script>

<div
  bind:this={el}
  data-popover={id}
  class="absolute bottom-[calc(100%+8px)] rounded-panel border border-line bg-surface p-2 text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
  style:left="{left}px"
>
  <Body />
</div>
