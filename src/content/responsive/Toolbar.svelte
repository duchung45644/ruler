<script lang="ts">
  import ArrowDownUp from '@lucide/svelte/icons/arrow-down-up';
  import ListRestart from '@lucide/svelte/icons/list-restart';
  import Plus from '@lucide/svelte/icons/plus';
  import RefreshCw from '@lucide/svelte/icons/refresh-cw';
  import Rows3 from '@lucide/svelte/icons/rows-3';
  import ZoomIn from '@lucide/svelte/icons/zoom-in';
  import ZoomOut from '@lucide/svelte/icons/zoom-out';
  import { i18n } from '#i18n';
  import { CUSTOM_PRESET, DEVICE_GROUPS, type DevicePreset } from '../../lib/responsive/devices';
  import { ZOOM_MAX, ZOOM_MIN, zoomOptions } from '../../lib/responsive/zoom';
  import {
    addFrame,
    canAddFrame,
    reloadAllFrames,
    resetFrames,
    setZoom,
    shell,
    toggleFramesWrap,
    toggleSyncScroll,
    zoomStep,
  } from './shell.svelte';

  let menuOpen = $state(false);
  const percent = $derived(Math.round(shell.zoom * 100));
  const addable = $derived(canAddFrame());

  const btn =
    'grid size-7 shrink-0 place-items-center rounded-btn text-fg-muted hover:bg-white/10 hover:text-fg disabled:pointer-events-none disabled:opacity-35 aria-pressed:bg-accent/25 aria-pressed:text-fg';
  const item = 'block w-full rounded-md px-2 py-1 text-left whitespace-nowrap hover:bg-white/10';

  function pick(p: DevicePreset) {
    menuOpen = false;
    void addFrame(p);
  }
</script>

<!-- Top bar (8.11): dark glass like the dock (spec §7). -->
<div
  data-responsive-toolbar
  class="pointer-events-auto fixed top-2 left-1/2 z-10 flex max-w-[calc(100vw-16px)] -translate-x-1/2 items-center gap-1 rounded-panel border border-line bg-surface p-1 text-xs text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
>
  <button
    type="button"
    class={btn}
    data-action="zoom-out"
    title={i18n.t('responsive.zoomOut')}
    aria-label={i18n.t('responsive.zoomOut')}
    disabled={shell.zoom <= ZOOM_MIN}
    onclick={() => zoomStep(-1)}><ZoomOut size={15} /></button
  >
  <select
    data-zoom
    class="h-7 rounded-btn border border-line bg-transparent px-1 text-fg tabular-nums"
    title={i18n.t('responsive.zoom')}
    aria-label={i18n.t('responsive.zoom')}
    value={String(percent)}
    onchange={(e) => setZoom(Number(e.currentTarget.value) / 100)}
  >
    {#each zoomOptions(shell.zoom) as p (p)}
      <option value={String(p)} class="bg-zinc-900">{p}%</option>
    {/each}
  </select>
  <button
    type="button"
    class={btn}
    data-action="zoom-in"
    title={i18n.t('responsive.zoomIn')}
    aria-label={i18n.t('responsive.zoomIn')}
    disabled={shell.zoom >= ZOOM_MAX}
    onclick={() => zoomStep(1)}><ZoomIn size={15} /></button
  >
  <button
    type="button"
    class={btn}
    data-action="refresh-all"
    title={i18n.t('responsive.refresh')}
    aria-label={i18n.t('responsive.refresh')}
    onclick={reloadAllFrames}><RefreshCw size={15} /></button
  >
  <span
    data-url
    class="max-w-[40vw] min-w-0 truncate px-2 font-mono text-[11px] text-fg-muted"
    title={shell.url || shell.src}>{shell.url || shell.src}</span
  >
  <button
    type="button"
    class={btn}
    data-action="reset"
    title={i18n.t('responsive.titleResetViewports')}
    aria-label={i18n.t('responsive.titleResetViewports')}
    disabled={shell.breakpointMode}
    onclick={() => void resetFrames()}><ListRestart size={15} /></button
  >
  <button
    type="button"
    class={btn}
    data-action="sync-scroll"
    title={i18n.t('responsive.titleSyncScrolling')}
    aria-label={i18n.t('responsive.titleSyncScrolling')}
    aria-pressed={shell.syncScrollEnabled}
    onclick={toggleSyncScroll}><ArrowDownUp size={15} /></button
  >
  <button
    type="button"
    class={btn}
    data-action="frame-layout"
    title={i18n.t('responsive.titleFrameLayout')}
    aria-label={i18n.t('responsive.titleFrameLayout')}
    aria-pressed={shell.framesWrap}
    onclick={toggleFramesWrap}><Rows3 size={15} /></button
  >
  <div class="relative">
    <button
      type="button"
      class={btn}
      data-action="add"
      title={i18n.t('responsive.labelAddViewport')}
      aria-label={i18n.t('responsive.labelAddViewport')}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      disabled={!addable}
      onclick={() => (menuOpen = !menuOpen)}><Plus size={15} /></button
    >
    {#if menuOpen && addable}
      <div
        role="menu"
        tabindex="-1"
        class="absolute top-[calc(100%+6px)] right-0 max-h-[70vh] min-w-44 overflow-y-auto rounded-panel border border-line bg-surface p-1 text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
        onfocusout={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) menuOpen = false;
        }}
      >
        {#each DEVICE_GROUPS as group, g (g)}
          {#each group as p (p.key)}
            <button
              type="button"
              role="menuitem"
              class="{item} flex justify-between gap-4"
              data-preset={p.key}
              onclick={() => pick(p)}
              ><span>{p.name}</span><span class="text-fg-muted tabular-nums"
                >{p.width}×{p.height}</span
              ></button
            >
          {/each}
          <div role="separator" class="my-1 h-px bg-line"></div>
        {/each}
        <button
          type="button"
          role="menuitem"
          class={item}
          data-preset={CUSTOM_PRESET.key}
          onclick={() => pick(CUSTOM_PRESET)}>{CUSTOM_PRESET.name}</button
        >
      </div>
    {/if}
  </div>
</div>
