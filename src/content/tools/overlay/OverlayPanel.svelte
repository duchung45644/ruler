<script lang="ts">
  import { i18n } from '#i18n';
  import type { OverlayImage } from '../../../lib/overlay-image';
  import ToolPanel from '../../../ui/ToolPanel.svelte';
  import { state as app } from '../../core/state.svelte';
  import {
    edit,
    images,
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

{#snippet num(k: NumKey)}
  <input
    type="number"
    step="1"
    class="field w-[64px]"
    value={cur?.[k]}
    oninput={(e) => edit(() => ({ [k]: Number(e.currentTarget.value) || 0 }))}
  />
{/snippet}

<div style:display={app.paused ? 'none' : undefined}>
  <ToolPanel title={i18n.t('dock.overlay')} onclose={() => setOn(false)}>
    <div class="flex flex-col gap-2">
      {#if list.length}
        <div class="flex flex-wrap gap-1">
          {#each list as it, i (i)}
            <button
              type="button"
              class="h-[40px] w-[40px] overflow-hidden rounded-btn border {i === sel
                ? 'border-accent'
                : 'border-line'}"
              style:opacity={it.visible ? undefined : 0.4}
              title={i18n.t('overlay.image', [String(i + 1)])}
              onclick={() => select(i)}
              ><img src={it.src} alt="" class="h-full w-full object-cover" /></button
            >
          {/each}
        </div>
      {/if}
      <button
        type="button"
        class="field border-dashed py-3 {over ? 'text-accent' : 'text-fg-muted'}"
        onclick={() => file.click()}
        ondragover={(e) => (e.preventDefault(), (over = true))}
        ondragleave={() => (over = false)}
        ondrop={(e) => (e.preventDefault(), (over = false), loadFiles(e.dataTransfer?.files))}
        >{list.length ? i18n.t('overlay.addAnother') : i18n.t('overlay.drop')}</button
      >
      <input
        bind:this={file}
        type="file"
        accept="image/*"
        multiple
        hidden
        onchange={() => (loadFiles(file.files), (file.value = ''))}
      />
      {#if cur}
        <div class="flex items-center gap-2">
          <span class="flex-1 text-fg-muted">{i18n.t('overlay.opacity')}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={cur.opacity}
            oninput={(e) => edit(() => ({ opacity: Number(e.currentTarget.value) }))}
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="flex-1 text-fg-muted">{i18n.t('overlay.blend')}</span>
          {#each modes as [m, label] (m)}
            <button
              type="button"
              class="field"
              class:text-accent={cur.mode === m}
              aria-pressed={cur.mode === m}
              onclick={() => edit(() => ({ mode: m }))}>{i18n.t(label)}</button
            >
          {/each}
        </div>
        <div class="flex items-center gap-2">
          <span class="flex-1 text-fg-muted">X / Y</span>
          {@render num('x')}{@render num('y')}
        </div>
        <div class="flex items-center gap-2">
          <span class="flex-1 text-fg-muted">{i18n.t('overlay.scale')}</span>
          {@render num('scale')}
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="field"
            class:text-accent={cur.visible}
            aria-pressed={cur.visible}
            onclick={() => edit((o) => ({ visible: !o.visible }))}
            >{cur.visible ? i18n.t('overlay.visible') : i18n.t('overlay.hidden')}</button
          >
          <button
            type="button"
            class="field"
            class:text-accent={cur.fixed}
            aria-pressed={cur.fixed}
            title={i18n.t('overlay.pinTitle')}
            onclick={togglePin}>{i18n.t('overlay.pin')}</button
          >
          <button type="button" class="field" onclick={removeSelected}
            >{i18n.t('overlay.remove')}</button
          >
        </div>
        <p class="text-fg-muted">{i18n.t('overlay.hint')}</p>
      {/if}
    </div>
  </ToolPanel>
</div>
