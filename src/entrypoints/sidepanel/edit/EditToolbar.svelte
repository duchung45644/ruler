<script lang="ts">
  import { i18n } from '#i18n';
  import ClipboardPaste from '@lucide/svelte/icons/clipboard-paste';
  import Copy from '@lucide/svelte/icons/copy';
  import CopyPlus from '@lucide/svelte/icons/copy-plus';
  import Redo2 from '@lucide/svelte/icons/redo-2';
  import Scissors from '@lucide/svelte/icons/scissors';
  import Trash from '@lucide/svelte/icons/trash';
  import Type from '@lucide/svelte/icons/type';
  import Undo2 from '@lucide/svelte/icons/undo-2';
  import { onMount } from 'svelte';
  import { toPage } from '../store.svelte';
  import StateSelect from './StateSelect.svelte';
  import { command, edit } from './edit-store.svelte';

  // seed the undo state once; later states ride on every edit reply and edit_state
  onMount(() => void command('get_history_state'));

  const actions = [
    ['edit_copy', 'dock.copy', Copy],
    ['edit_cut', 'dock.cut', Scissors],
    ['edit_paste', 'dock.paste', ClipboardPaste],
    ['edit_duplicate', 'dock.duplicate', CopyPlus],
    ['edit_delete', 'dock.delete', Trash],
  ] as const;
  let textOn = $state(false);
  const enabled = (cmd: (typeof actions)[number][0]) =>
    !textOn && (cmd !== 'edit_paste' || edit.editState.hasClipboard);
  async function toggleText() {
    textOn = (await toPage('toggle_text_edit')) ?? false;
  }

  const editable = (t: EventTarget | null) => {
    const el = t as HTMLElement | null;
    return !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable);
  };
  // D4: the panel's own undo keys drive the HTML history, as the page's do
  function onkeydown(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || editable(e.target)) return;
    const k = e.key.toLowerCase();
    const redo = (k === 'z' && e.shiftKey) || (k === 'y' && !e.shiftKey);
    if (!redo && !(k === 'z' && !e.shiftKey)) return;
    e.preventDefault();
    void command(redo ? 'edit_redo' : 'edit_undo');
  }
  const btn =
    'grid size-7 place-items-center rounded-btn text-fg-muted enabled:hover:bg-line enabled:hover:text-fg disabled:opacity-40';
</script>

<svelte:window {onkeydown} />

<div class="flex items-center gap-0.5 border-b border-line px-2 py-1" data-edit-toolbar>
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
  <span class="flex-1"></span>
  {#if edit.payload}<StateSelect payload={edit.payload} />{/if}
  {#each [['dock.undo', 'edit_undo', edit.editState.canUndo, Undo2], ['dock.redo', 'edit_redo', edit.editState.canRedo, Redo2]] as const as [label, cmd, ok, Icon] (cmd)}
    <button
      type="button"
      class={btn}
      title={i18n.t(label)}
      aria-label={i18n.t(label)}
      disabled={!ok}
      data-action={cmd}
      onclick={() => void command(cmd)}><Icon class="size-4" /></button
    >
  {/each}
</div>
