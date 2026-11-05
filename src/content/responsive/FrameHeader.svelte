<script lang="ts">
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Ellipsis from '@lucide/svelte/icons/ellipsis';
  import Moon from '@lucide/svelte/icons/moon';
  import RotateCw from '@lucide/svelte/icons/rotate-cw';
  import Sun from '@lucide/svelte/icons/sun';
  import SunMoon from '@lucide/svelte/icons/sun-moon';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import X from '@lucide/svelte/icons/x';
  import { i18n } from '#i18n';
  import { breakpointLabel } from '../../lib/breakpoints';
  import { COLORS } from '../tools/breakpoints';
  import {
    cycleFrameScheme,
    frameLabel,
    moveFrame,
    reloadFrame,
    removeFrame,
    rotateFrame,
    shell,
    type ShellFrame,
  } from './shell.svelte';

  let { f, first, last }: { f: ShellFrame; first: boolean; last: boolean } = $props();
  let menuOpen = $state(false);

  const id = $derived(f.vp.id);
  const bpKind = $derived(shell.breakpointMode ? shell.bpKinds[f.vp.width] : undefined);
  const SchemeIcon = $derived(
    f.vp.scheme === 'light' ? Sun : f.vp.scheme === 'dark' ? Moon : SunMoon,
  );
  const schemeName = $derived(
    f.vp.scheme === 'light'
      ? i18n.t('responsive.schemeLight')
      : f.vp.scheme === 'dark'
        ? i18n.t('responsive.schemeDark')
        : i18n.t('responsive.schemeSystem'),
  );
  const btn =
    'grid size-6 place-items-center rounded-md text-fg-muted hover:bg-white/10 hover:text-fg disabled:pointer-events-none disabled:opacity-35';
  const item = 'block w-full rounded-md px-2 py-1 text-left whitespace-nowrap hover:bg-white/10';

  function pick(run: () => void) {
    menuOpen = false;
    run();
  }
</script>

<div
  data-frame-header={id}
  class="flex h-8 items-center gap-1 rounded-t-panel border border-b-0 border-line bg-surface px-1 text-xs text-fg backdrop-blur-surface"
>
  <button
    type="button"
    class={btn}
    data-action="move-left"
    title={i18n.t('responsive.moveLeft')}
    aria-label={i18n.t('responsive.moveLeft')}
    disabled={first}
    onclick={() => moveFrame(id, -1)}><ChevronLeft size={14} /></button
  >
  <button
    type="button"
    class={btn}
    data-action="move-right"
    title={i18n.t('responsive.moveRight')}
    aria-label={i18n.t('responsive.moveRight')}
    disabled={last}
    onclick={() => moveFrame(id, 1)}><ChevronRight size={14} /></button
  >
  {#if bpKind}
    <span
      data-frame-breakpoint={bpKind}
      class="shrink-0 rounded px-1.5 py-px font-semibold text-white tabular-nums"
      style:background={COLORS[bpKind]}>{breakpointLabel({ width: f.vp.width, kind: bpKind })}</span
    >
  {/if}
  <span data-frame-label class="min-w-0 flex-1 truncate px-1 font-medium tabular-nums"
    >{frameLabel(f.vp)}</span
  >
  {#if f.overflow}
    <span
      data-overflow-warning
      class="grid size-6 place-items-center text-amber-400"
      title={i18n.t('responsive.warnOverflow')}
      aria-label={i18n.t('responsive.warnOverflow')}
      role="img"><TriangleAlert size={14} /></span
    >
  {/if}
  <button
    type="button"
    class={btn}
    data-action="rotate"
    title={i18n.t('responsive.rotate')}
    aria-label={i18n.t('responsive.rotate')}
    onclick={() => rotateFrame(id)}><RotateCw size={14} /></button
  >
  <button
    type="button"
    class={btn}
    data-action="scheme"
    data-scheme={f.vp.scheme}
    title="{i18n.t('responsive.colorScheme')}: {schemeName}"
    aria-label="{i18n.t('responsive.colorScheme')}: {schemeName}"
    onclick={() => cycleFrameScheme(id)}><SchemeIcon size={14} /></button
  >
  {#if !shell.breakpointMode}
    <button
      type="button"
      class={btn}
      data-action="remove"
      title={i18n.t('responsive.titleRemove')}
      aria-label={i18n.t('responsive.titleRemove')}
      onclick={() => void removeFrame(id)}><X size={14} /></button
    >
  {/if}
  <div class="relative">
    <button
      type="button"
      class={btn}
      data-action="more"
      title={i18n.t('responsive.moreActions')}
      aria-label={i18n.t('responsive.moreActions')}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}><Ellipsis size={14} /></button
    >
    {#if menuOpen}
      <div
        role="menu"
        tabindex="-1"
        class="absolute top-[calc(100%+4px)] right-0 z-10 min-w-32 rounded-panel border border-line bg-surface p-1 text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
        onfocusout={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) menuOpen = false;
        }}
      >
        <button
          type="button"
          role="menuitem"
          class={item}
          data-menu="refresh"
          onclick={() => pick(() => reloadFrame(id))}>{i18n.t('responsive.refresh')}</button
        >
        <button
          type="button"
          role="menuitem"
          class={item}
          data-menu="rotate"
          onclick={() => pick(() => rotateFrame(id))}>{i18n.t('responsive.rotate')}</button
        >
        <button
          type="button"
          role="menuitem"
          class={item}
          data-menu="scheme"
          onclick={() => pick(() => cycleFrameScheme(id))}
          >{i18n.t('responsive.colorScheme')}</button
        >
        {#if !shell.breakpointMode}
          <button
            type="button"
            role="menuitem"
            class={item}
            data-menu="remove"
            onclick={() => pick(() => void removeFrame(id))}
            >{i18n.t('responsive.titleRemove')}</button
          >
        {/if}
      </div>
    {/if}
  </div>
</div>
