<script lang="ts">
  import { i18n } from '#i18n';
  import CornerDownRight from '@lucide/svelte/icons/corner-down-right';
  import CornerLeftUp from '@lucide/svelte/icons/corner-left-up';
  import Dot from '@lucide/svelte/icons/dot';
  import type { ElementDetails } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import { clearHighlights, hover, onPage } from './actions';

  let { el }: { el: ElementDetails } = $props();
  const row =
    'flex w-full min-w-0 items-center gap-1.5 rounded-btn px-1.5 py-1 text-left font-mono hover:bg-line disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent';
</script>

<Section id="documentOutline" title={i18n.t('panel.document')} onleave={clearHighlights}>
  <div class="flex flex-col" data-document>
    {#if el.parentName}
      <button
        type="button"
        class={row}
        title={i18n.t('panel.shortcutParent')}
        disabled={!el.parentSelectable}
        data-parent
        onclick={() => void onPage('select_parent', el.id)}
      >
        <CornerLeftUp class="size-3.5 shrink-0 text-fg-muted" />
        <span class="truncate text-fg-muted">{el.parentName}</span>
      </button>
    {/if}
    <button
      type="button"
      class="{row} pl-4"
      data-self
      onmouseenter={() => void hover('highlight_hovered', el.id)}
      onclick={() => void onPage('go_to_selected_element', el.id)}
    >
      <Dot class="size-3.5 shrink-0 text-accent" />
      <span class="truncate font-medium">{el.name}</span>
    </button>
    {#if el.childName}
      <button
        type="button"
        class="{row} pl-7"
        title={i18n.t('panel.shortcutChild')}
        data-child
        onclick={() => void onPage('select_child', el.id)}
      >
        <CornerDownRight class="size-3.5 shrink-0 text-fg-muted" />
        <span class="truncate text-fg-muted">{el.childName}</span>
      </button>
    {/if}
  </div>
</Section>
