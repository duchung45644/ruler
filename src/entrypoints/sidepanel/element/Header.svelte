<script lang="ts">
  import { i18n } from '#i18n';
  import CornerDownRight from '@lucide/svelte/icons/corner-down-right';
  import CornerLeftUp from '@lucide/svelte/icons/corner-left-up';
  import { formatSize } from '../../../lib/format';
  import type { ElementDetails } from '../../../lib/element/types';
  import CopyButton from './CopyButton.svelte';
  import { clearHighlights, hover, onPage } from './actions';

  let { el }: { el: ElementDetails } = $props();
  const near =
    'flex w-full min-w-0 items-center gap-1.5 rounded-btn px-1 py-0.5 text-left font-mono text-[11px] text-fg-muted hover:bg-line hover:text-fg disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent';
</script>

<!-- The element with its place in the document: parent above, first child below. -->
<header
  class="border-b border-line px-2 py-2"
  data-header
  data-document
  role="presentation"
  onmouseleave={clearHighlights}
>
  {#if el.parentName}
    <button
      type="button"
      class={near}
      title={i18n.t('panel.shortcutParent')}
      disabled={!el.parentSelectable}
      data-parent
      onclick={() => void onPage('select_parent', el.id)}
    >
      <CornerLeftUp class="size-3 shrink-0" />
      <span class="truncate">{el.parentName}</span>
    </button>
  {/if}
  <div class="flex items-start gap-2 py-1 pl-1">
    <div class="min-w-0 flex-1">
      <button
        type="button"
        class="block max-w-full truncate text-left font-mono text-[13px] font-medium text-fg hover:text-accent"
        title={el.selector}
        data-selector
        data-self
        onmouseenter={() => void hover('highlight_hovered', el.id)}
        onclick={() => void onPage('go_to_selected_element', el.id)}>{el.name}</button
      >
      <div class="mt-0.5 flex items-center gap-1.5 text-fg-muted">
        <span class="rounded bg-line px-1 text-[10px] tracking-wide uppercase">{el.type}</span>
        <span class="tabular-nums" data-size
          >{formatSize(el.boxModel.width, el.boxModel.height)}</span
        >
      </div>
    </div>
    <CopyButton text={el.selector} />
  </div>
  {#if el.childName}
    <button
      type="button"
      class="{near} pl-4"
      title={i18n.t('panel.shortcutChild')}
      data-child
      onclick={() => void onPage('select_child', el.id)}
    >
      <CornerDownRight class="size-3 shrink-0" />
      <span class="truncate">{el.childName}</span>
    </button>
  {/if}
</header>
