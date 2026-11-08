<script lang="ts">
  import { i18n } from '#i18n';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import ChevronUp from '@lucide/svelte/icons/chevron-up';
  import X from '@lucide/svelte/icons/x';
  import { onDestroy, onMount } from 'svelte';
  import { findTitle } from '../../../lib/tools/find';
  import { state as app } from '../../core/state.svelte';
  import { clearFind, find, onFindChange, runFind, stepFind } from '.';

  let query = $state(find.query);
  let input: HTMLInputElement;
  // plain module state, mirrored for the template after each search/step
  let view = $state({ index: 0, count: 0, hidden: 0 });
  let timer: ReturnType<typeof setTimeout> | undefined;

  const sync = () => (view = { index: find.index, count: find.count, hidden: find.hidden });
  const search = async () => {
    find.query = query;
    await runFind(query);
    sync();
  };
  const step = async (d: -1 | 1) => {
    await stepFind(d);
    sync();
  };

  onMount(() => {
    onFindChange(sync);
    void search();
    input.focus();
    input.select();
  });
  onDestroy(() => {
    clearTimeout(timer);
    onFindChange(null);
    find.query = query;
    clearFind();
  });
</script>

<div class="flex w-60 flex-col gap-2 font-sans text-[12px]">
  <div class="flex items-center justify-between gap-2">
    <span class="font-semibold">{findTitle(view.index, view.count, view.hidden, i18n.t)}</span>
    <div class="flex items-center gap-1 text-fg-muted">
      <button
        type="button"
        aria-label={i18n.t('find.prev')}
        class="hover:text-fg disabled:opacity-40"
        disabled={view.count < 2}
        onclick={() => void step(-1)}><ChevronUp size={14} /></button
      >
      <button
        type="button"
        aria-label={i18n.t('find.next')}
        class="hover:text-fg disabled:opacity-40"
        disabled={view.count < 2}
        onclick={() => void step(1)}><ChevronDown size={14} /></button
      >
      <button
        type="button"
        aria-label={i18n.t('common.close')}
        class="hover:text-fg"
        onclick={() => (app.popover = null)}><X size={14} /></button
      >
    </div>
  </div>
  <input
    bind:this={input}
    type="text"
    class="field"
    placeholder=".class, #id, tag"
    aria-label={i18n.t('find.selector')}
    bind:value={query}
    oninput={() => {
      clearTimeout(timer);
      timer = setTimeout(() => void search(), 150);
    }}
  />
</div>
