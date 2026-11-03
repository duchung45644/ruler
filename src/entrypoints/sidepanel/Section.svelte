<script lang="ts">
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import type { Snippet } from 'svelte';
  import { updatePanelPrefs, type SectionId } from '../../lib/settings';
  import { panel } from './store.svelte';

  let {
    id,
    title,
    count,
    children,
  }: { id: SectionId; title: string; count?: number; children: Snippet } = $props();
  const collapsed = $derived(panel.prefs.sectionVisibility[id]?.collapsed ?? false);

  function toggle() {
    const sectionVisibility = {
      ...panel.prefs.sectionVisibility,
      [id]: { collapsed: !collapsed },
    };
    panel.prefs = { ...panel.prefs, sectionVisibility };
    void updatePanelPrefs({ sectionVisibility });
  }
</script>

<section class="border-b border-line" data-section={id}>
  <button
    type="button"
    class="flex w-full items-center gap-2 px-3 py-2 text-left font-semibold hover:bg-line"
    aria-expanded={!collapsed}
    onclick={toggle}
  >
    <span class="flex-1">{title}</span>
    {#if count !== undefined}<span class="text-fg-muted tabular-nums">{count}</span>{/if}
    <ChevronDown
      class="size-4 text-fg-muted transition-transform {collapsed ? '-rotate-90' : ''}"
    />
  </button>
  {#if !collapsed}<div class="px-3 pb-3">{@render children()}</div>{/if}
</section>
