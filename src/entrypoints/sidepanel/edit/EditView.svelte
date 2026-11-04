<script lang="ts">
  import { onMount } from 'svelte';
  import { panel } from '../store.svelte';
  import ChangesTab from './ChangesTab.svelte';
  import CssEditor from './CssEditor.svelte';
  import EditEmpty from './EditEmpty.svelte';
  import EditHeader from './EditHeader.svelte';
  import { command, edit, loadChanges } from './edit-store.svelte';

  // seed the header once; later states ride on every edit reply and edit_state
  onMount(() => void command('get_history_state'));

  $effect(() => {
    if (edit.tab === 'changes' && edit.changes === null) void loadChanges();
  });

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
</script>

<svelte:window {onkeydown} />

<div data-edit-view>
  {#if edit.tab === 'css'}
    {#if panel.element && edit.payload}
      <EditHeader el={panel.element} payload={edit.payload} />
      <CssEditor el={panel.element} payload={edit.payload} />
    {:else}
      <EditEmpty />
    {/if}
  {:else}
    {#if edit.changes}<ChangesTab changes={edit.changes} />{/if}
  {/if}
</div>
