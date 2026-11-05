<script lang="ts">
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import type { Snippet } from 'svelte';
  import { updatePanelPrefs, type SectionId } from '../../lib/settings';
  import { panel } from './store.svelte';

  let {
    id,
    title,
    count,
    actions,
    onleave,
    pinned = false,
    children,
  }: {
    id: SectionId;
    title: string;
    count?: number;
    /** Controls on the right of the title row (not part of the toggle). */
    actions?: Snippet;
    onleave?: () => void;
    /** Always open, no toggle. */
    pinned?: boolean;
    children: Snippet;
  } = $props();
  const collapsed = $derived(!pinned && (panel.prefs.sectionVisibility[id]?.collapsed ?? false));

  function toggle() {
    const sectionVisibility = {
      ...panel.prefs.sectionVisibility,
      [id]: { collapsed: !collapsed },
    };
    panel.prefs = { ...panel.prefs, sectionVisibility };
    void updatePanelPrefs({ sectionVisibility });
  }
</script>

<section class="border-b border-line" aria-label={title} data-section={id} onmouseleave={onleave}>
  <div class="flex items-center pr-2">
    <button
      type="button"
      class="flex min-w-0 flex-1 items-center gap-1.5 py-2 pl-2 text-left font-semibold disabled:cursor-default"
      aria-expanded={!collapsed}
      disabled={pinned}
      onclick={toggle}
    >
      {#if !pinned}<ChevronDown
          class="size-3.5 shrink-0 text-fg-muted transition-transform {collapsed
            ? '-rotate-90'
            : ''}"
        />{/if}
      <span class="truncate">{title}</span>
      {#if count !== undefined}
        <span class="rounded-full bg-line px-1.5 text-[10px] font-medium text-fg-muted tabular-nums"
          >{count}</span
        >
      {/if}
    </button>
    {#if actions && !collapsed}{@render actions()}{/if}
  </div>
  {#if !collapsed}<div class="px-3 pb-3">{@render children()}</div>{/if}
</section>
