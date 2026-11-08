<script lang="ts">
  import { i18n } from '#i18n';
  import type { OverlayImage } from '../../../lib/tools/overlay-image';
  import Eye from '@lucide/svelte/icons/eye';
  import EyeOff from '@lucide/svelte/icons/eye-off';
  import Pin from '@lucide/svelte/icons/pin';
  import Plus from '@lucide/svelte/icons/plus';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import ToolPanel from '../../../ui/ToolPanel.svelte';
  import { state as app } from '../../core/state.svelte';
  import {
    edit,
    images,
    MAX_IMAGES,
    loadFiles,
    panelSync,
    removeSelected,
    select,
    selected,
    setOn,
    togglePin,
  } from '.';

  // Port of openOverlayPanel (unpacked/scripts/bd/overlay.js:183).
  type NumKey = 'x' | 'y' | 'scale';
  let list: OverlayImage[] = $state([]);
  let sel = $state(-1);
  let over = $state(false);
  let file: HTMLInputElement;
  const cur = $derived(list[sel]);

  function sync() {
    list = images().map((o) => ({ ...o }));
    sel = selected();
  }
  $effect(() => {
    panelSync.fn = sync;
    sync();
    return () => (panelSync.fn = null);
  });
  const modes = [
    ['normal', 'overlay.normal'],
    ['difference', 'overlay.difference'],
  ] as const;
</script>

{#snippet num(k: NumKey, label: string)}
  <label class="flex min-w-0 flex-col gap-1">
    <span class="text-[11px] text-fg-muted">{label}</span>
    <input
      type="number"
      step="1"
      class="field w-full font-mono"
      value={cur?.[k]}
      oninput={(e) => edit(() => ({ [k]: Number(e.currentTarget.value) || 0 }))}
    />
  </label>
{/snippet}

{#snippet drop(cls: string)}
  <button
    type="button"
    class="flex items-center justify-center rounded-btn border border-dashed transition-colors hover:border-accent hover:text-accent {over
      ? 'border-accent text-accent'
      : 'border-line-strong text-fg-muted'} {cls}"
    title={i18n.t('overlay.addAnother')}
    onclick={() => file.click()}
    ondragover={(e) => (e.preventDefault(), (over = true))}
    ondragleave={() => (over = false)}
    ondrop={(e) => (e.preventDefault(), (over = false), loadFiles(e.dataTransfer?.files))}
  >
    {#if list.length}<Plus size={16} />{:else}{i18n.t('overlay.drop')}{/if}
  </button>
{/snippet}

<div style:display={app.paused ? 'none' : undefined}>
  <ToolPanel title={i18n.t('dock.overlay')} onclose={() => setOn(false)}>
    <div class="flex flex-col gap-3">
      {#if list.length}
        <div class="flex flex-wrap gap-1.5">
          {#each list as it, i (i)}
            <button
              type="button"
              class="h-11 w-11 overflow-hidden rounded-btn border-2 {i === sel
                ? 'border-accent'
                : 'border-transparent hover:border-line-strong'}"
              style:opacity={it.visible ? undefined : 0.4}
              title={i18n.t('overlay.image', [String(i + 1)])}
              onclick={() => select(i)}
              ><img src={it.src} alt="" class="h-full w-full object-cover" /></button
            >
          {/each}
          {#if list.length < MAX_IMAGES}{@render drop('h-11 w-11')}{/if}
        </div>
      {:else}
        {@render drop('px-3 py-6 text-center')}
      {/if}
      <input
        bind:this={file}
        type="file"
        accept="image/*"
        multiple
        hidden
        onchange={() => (loadFiles(file.files), (file.value = ''))}
      />
      {#if cur}
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-[11px] text-fg-muted">
            <span>{i18n.t('overlay.opacity')}</span>
            <span class="font-mono">{cur.mode === 'difference' ? 100 : cur.opacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            class="w-full"
            disabled={cur.mode === 'difference'}
            value={cur.opacity}
            oninput={(e) => edit(() => ({ opacity: Number(e.currentTarget.value) }))}
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[11px] text-fg-muted">{i18n.t('overlay.blend')}</span>
          <div class="grid grid-cols-2 gap-0.5 rounded-btn border border-line p-0.5">
            {#each modes as [m, label] (m)}
              <button
                type="button"
                class="rounded-md py-1 {cur.mode === m
                  ? 'bg-accent text-white'
                  : 'text-fg-muted hover:bg-line'}"
                aria-pressed={cur.mode === m}
                onclick={() => edit(() => ({ mode: m }))}>{i18n.t(label)}</button
              >
            {/each}
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          {@render num('x', 'X')}{@render num('y', 'Y')}{@render num(
            'scale',
            i18n.t('overlay.scale'),
          )}
        </div>
        <div class="flex items-center gap-1 border-t border-line pt-3">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-btn px-2 py-1 hover:bg-line {cur.visible
              ? 'text-fg'
              : 'text-fg-muted'}"
            aria-pressed={!cur.visible}
            onclick={() => edit((o) => ({ visible: !o.visible }))}
            >{#if cur.visible}<Eye size={14} />{:else}<EyeOff size={14} />{/if}{cur.visible
              ? i18n.t('overlay.visible')
              : i18n.t('overlay.hidden')}</button
          >
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-btn px-2 py-1 hover:bg-line {cur.fixed
              ? 'bg-accent/15 text-accent'
              : 'text-fg-muted'}"
            aria-pressed={cur.fixed}
            title={i18n.t('overlay.pinTitle')}
            onclick={togglePin}><Pin size={14} />{i18n.t('overlay.pin')}</button
          >
          <button
            type="button"
            class="ml-auto rounded-btn p-1.5 text-fg-muted hover:bg-red-500/15 hover:text-red-400"
            aria-label={i18n.t('overlay.remove')}
            title={i18n.t('overlay.remove')}
            onclick={removeSelected}><Trash2 size={14} /></button
          >
        </div>
        <p class="text-[11px] leading-snug text-fg-muted">{i18n.t('overlay.hint')}</p>
      {/if}
    </div>
  </ToolPanel>
</div>
