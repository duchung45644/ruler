<script lang="ts">
  import { formatSize } from '../../../lib/format';
  import type { ElementDetails } from '../../../lib/element/types';
  import CopyButton from './CopyButton.svelte';
  import { onPage } from './actions';

  let { el }: { el: ElementDetails } = $props();
</script>

<header class="flex items-start gap-2 border-b border-line px-3 py-2.5" data-header>
  <div class="min-w-0 flex-1">
    <button
      type="button"
      class="block max-w-full truncate text-left font-mono text-[13px] font-medium text-fg hover:text-accent"
      title={el.selector}
      data-selector
      onclick={() => void onPage('go_to_selected_element', el.id)}>{el.name}</button
    >
    <div class="mt-0.5 flex items-center gap-1.5 text-fg-muted">
      <span class="rounded bg-line px-1 text-[10px] tracking-wide uppercase">{el.type}</span>
      <span class="tabular-nums" data-size>{formatSize(el.boxModel.width, el.boxModel.height)}</span
      >
    </div>
  </div>
  <CopyButton text={el.selector} />
</header>
