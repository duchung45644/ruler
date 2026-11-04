<script lang="ts">
  import { i18n } from '#i18n';
  import Redo2 from '@lucide/svelte/icons/redo-2';
  import Undo2 from '@lucide/svelte/icons/undo-2';
  import type { ElementDetails } from '../../../lib/element/types';
  import { onPage } from '../element/actions';
  import { command, edit } from './edit-store.svelte';

  let { el }: { el: ElementDetails } = $props();
  const n = $derived(edit.editState.editCount);
  const count = $derived(
    n === 0
      ? i18n.t('edit.countNone')
      : n === 1
        ? i18n.t('edit.countOne')
        : i18n.t('edit.countOther', [String(n)]),
  );
  const undo = i18n.t('dock.undo');
  const redo = i18n.t('dock.redo');
</script>

<header class="flex items-center gap-2 border-b border-line px-3 py-2" data-edit-header>
  <div class="min-w-0 flex-1">
    <button
      type="button"
      class="block max-w-full truncate text-left font-mono text-[13px] font-medium text-fg hover:text-accent"
      title={el.selector}
      data-selector
      onclick={() => void onPage('go_to_selected_element', el.id)}>{el.name}</button
    >
    <div class="mt-0.5 text-fg-muted tabular-nums" data-edit-count>{count}</div>
  </div>
  <div class="flex items-center gap-0.5">
    {#each [[undo, 'edit_undo', edit.editState.canUndo, Undo2], [redo, 'edit_redo', edit.editState.canRedo, Redo2]] as const as [label, cmd, enabled, Icon] (cmd)}
      <button
        type="button"
        class="grid size-7 place-items-center rounded-btn text-fg-muted enabled:hover:bg-line enabled:hover:text-fg disabled:opacity-40"
        title={label}
        aria-label={label}
        disabled={!enabled}
        data-action={cmd}
        onclick={() => void command(cmd)}><Icon class="size-4" /></button
      >
    {/each}
  </div>
</header>
