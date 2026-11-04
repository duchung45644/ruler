<script lang="ts">
  import { i18n } from '#i18n';
  import ClipboardPaste from '@lucide/svelte/icons/clipboard-paste';
  import Copy from '@lucide/svelte/icons/copy';
  import CopyPlus from '@lucide/svelte/icons/copy-plus';
  import Scissors from '@lucide/svelte/icons/scissors';
  import Trash from '@lucide/svelte/icons/trash';
  import Type from '@lucide/svelte/icons/type';
  import { panel, toPage } from '../store.svelte';
  import { command, edit, setEditTab, type EditTab } from './edit-store.svelte';

  const subTabs: [EditTab, string][] = [
    ['css', i18n.t('edit.css')],
    ['changes', i18n.t('edit.changes')],
  ];
  const actions = [
    ['edit_copy', 'dock.copy', Copy],
    ['edit_cut', 'dock.cut', Scissors],
    ['edit_paste', 'dock.paste', ClipboardPaste],
    ['edit_duplicate', 'dock.duplicate', CopyPlus],
    ['edit_delete', 'dock.delete', Trash],
  ] as const;
  let textOn = $state(false);
  const hasEl = $derived(!!panel.element);
  const enabled = (cmd: (typeof actions)[number][0]) =>
    hasEl && !textOn && (cmd !== 'edit_paste' || edit.editState.hasClipboard);
  async function toggleText() {
    textOn = (await toPage('toggle_text_edit')) ?? false;
  }
  const btn =
    'grid size-7 place-items-center rounded-btn text-fg-muted enabled:hover:bg-line enabled:hover:text-fg disabled:opacity-40';
</script>

<div class="flex items-center gap-1 border-b border-line px-2 py-1" data-edit-toolbar>
  {#each subTabs as [id, label] (id)}
    <button
      type="button"
      class="rounded-btn px-2 py-0.5 text-[12px] hover:bg-line"
      class:bg-line={edit.tab === id}
      class:text-fg-muted={edit.tab !== id}
      data-tab={id}
      onclick={() => setEditTab(id)}>{label}</button
    >
  {/each}
  <span class="flex-1"></span>
  <button
    type="button"
    class={btn}
    class:bg-line={textOn}
    class:text-accent={textOn}
    title={i18n.t('dock.editText')}
    aria-label={i18n.t('dock.editText')}
    aria-pressed={textOn}
    data-action="text"
    onclick={toggleText}><Type class="size-4" /></button
  >
  {#each actions as [cmd, label, Icon] (cmd)}
    <button
      type="button"
      class={btn}
      title={i18n.t(label)}
      aria-label={i18n.t(label)}
      disabled={!enabled(cmd)}
      data-action={cmd}
      onclick={() => void command(cmd)}><Icon class="size-4" /></button
    >
  {/each}
</div>
