<script lang="ts">
  import { i18n } from '#i18n';
  import X from '@lucide/svelte/icons/x';
  import type { Snippet } from 'svelte';
  import { startDrag } from '../content/core/drag';

  // Port of makePanel (unpacked/scripts/bd/core.js:218).
  let {
    title,
    onclose,
    actions,
    children,
  }: { title: string; onclose: () => void; actions?: Snippet; children: Snippet } = $props();
  let box: HTMLDivElement;
  let pos: { left: number; top: number } | null = $state(null);

  function drag(e: PointerEvent) {
    if ((e.target as Element).closest('button')) return;
    const r = box.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    startDrag(e, (m) => {
      pos = { left: Math.max(0, m.clientX - dx), top: Math.max(0, m.clientY - dy) };
    });
  }
</script>

<div
  bind:this={box}
  role="dialog"
  aria-label={title}
  class="pointer-events-auto fixed flex max-h-[calc(100vh-120px)] w-75 flex-col overflow-hidden rounded-panel border border-line bg-surface font-sans text-[12px] text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
  style:left={pos ? `${pos.left}px` : undefined}
  style:top="{pos ? pos.top : 16}px"
  style:right={pos ? undefined : '16px'}
>
  <div
    class="flex cursor-move items-center justify-between gap-2 border-b border-line px-3 py-2"
    onpointerdown={drag}
    role="none"
  >
    <span class="truncate font-medium">{title}</span>
    <div class="flex items-center gap-1">
      {@render actions?.()}
      <button
        type="button"
        class="rounded-btn p-1 hover:bg-line"
        aria-label={i18n.t('common.close')}
        title={i18n.t('common.close')}
        onclick={onclose}><X size={14} /></button
      >
    </div>
  </div>
  <div class="min-h-0 flex-1 overflow-y-auto p-3">{@render children()}</div>
</div>
