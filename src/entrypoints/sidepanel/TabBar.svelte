<script lang="ts">
  import { i18n } from '#i18n';
  import AppWindow from '@lucide/svelte/icons/app-window';
  import PanelRight from '@lucide/svelte/icons/panel-right';
  import { edit, setEditTab, type EditTab } from './edit/edit-store.svelte';
  import { panel, toggleDetach, type PanelTab } from './store.svelte';

  const inspectTabs: [PanelTab, string][] = [
    ['element', i18n.t('panel.tabElement')],
    ['page', i18n.t('panel.tabPage')],
  ];
  const editTabs: [EditTab, string][] = [
    ['css', i18n.t('edit.css')],
    ['changes', i18n.t('edit.changes')],
  ];
  // edit mode swaps Element / Page for CSS / Changes (6.38)
  const tabs = $derived(panel.mode === 'edit' ? editTabs : inspectTabs);
  const current = $derived(panel.mode === 'edit' ? edit.tab : panel.selectedTab);
  function pick(id: string) {
    if (panel.mode === 'edit') setEditTab(id as EditTab);
    else panel.selectedTab = id as PanelTab;
  }
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
      class:bg-line={current === id}
      class:text-fg-muted={current !== id}
      aria-selected={current === id}
      data-tab={id}
      onclick={() => pick(id)}>{label}</button
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
