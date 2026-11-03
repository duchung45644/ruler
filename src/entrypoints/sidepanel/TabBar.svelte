<script lang="ts">
  import { i18n } from '#i18n';
  import AppWindow from '@lucide/svelte/icons/app-window';
  import PanelRight from '@lucide/svelte/icons/panel-right';
  import { panel, toggleDetach, type PanelTab } from './store.svelte';

  const tabs: [PanelTab, string][] = [
    ['element', i18n.t('panel.tabElement')],
    ['page', i18n.t('panel.tabPage')],
  ];
  const dockLabel = $derived(i18n.t(panel.detached ? 'panel.dock' : 'panel.undock'));
  const scroller = () => (document.scrollingElement ?? document.documentElement).scrollTop;
</script>

<div
  class="sticky top-0 z-10 flex items-center gap-1 border-b border-line bg-surface px-2 py-1.5"
  role="tablist"
>
  {#each tabs as [id, label] (id)}
    <button
      type="button"
      role="tab"
      class="rounded-btn px-2.5 py-1 font-medium hover:bg-line"
      class:bg-line={panel.selectedTab === id}
      class:text-fg-muted={panel.selectedTab !== id}
      aria-selected={panel.selectedTab === id}
      onclick={() => (panel.selectedTab = id)}>{label}</button
    >
  {/each}
  <span class="flex-1"></span>
  {#if panel.tabId !== null && !panel.switching}
    <button
      type="button"
      class="grid size-7 place-items-center rounded-btn text-fg-muted hover:bg-line hover:text-fg"
      title={dockLabel}
      aria-label={dockLabel}
      data-action="detach"
      onclick={() => void toggleDetach(scroller())}
    >
      {#if panel.detached}<PanelRight class="size-4" />{:else}<AppWindow class="size-4" />{/if}
    </button>
  {/if}
</div>
