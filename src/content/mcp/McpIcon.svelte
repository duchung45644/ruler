<script lang="ts">
  import Plug from '@lucide/svelte/icons/plug';
  import { dockState } from '../../lib/mcp/status';
  import { CONNECTED_DOT, mcp } from './dock.svelte';

  /** Dock icon with a status dot: none idle, amber waiting, green connected, red outdated. */
  let { size = 19 }: { size?: number } = $props();
  const s = $derived(dockState(mcp.status));
  const DOT = { idle: '', waiting: '#F59E0B', connected: CONNECTED_DOT, outdated: '#EF4444' };
</script>

<span class="relative grid place-items-center" data-mcp-state={s}>
  <Plug {size} />
  {#if DOT[s]}
    <span
      class="absolute -right-0.5 -bottom-0.5 size-2 rounded-full ring-2 ring-surface"
      class:animate-pulse={s === 'waiting'}
      style:background={DOT[s]}
    ></span>
  {/if}
</span>
