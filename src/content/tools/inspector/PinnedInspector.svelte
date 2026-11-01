<script lang="ts">
  import { i18n } from '#i18n';
  import GripHorizontal from '@lucide/svelte/icons/grip-horizontal';
  import X from '@lucide/svelte/icons/x';
  import { requestPaint } from '../../core/overlay';
  import InspectPanel from './InspectPanel.svelte';
  import PinnedInspector from './PinnedInspector.svelte';
  import { pins, pinUi, raisePin, removePin, signature, type Pin } from './pins.svelte';

  // ponytail: no `pin` = the list of all pins, so one mount covers every pin
  let { pin }: { pin?: Pin } = $props();
  let sx = $state(0);
  let sy = $state(0);
  let box: HTMLDivElement | undefined = $state();

  /** Port of startPinDrag (:43574): clamp to the viewport, store page coords. */
  function drag(e: PointerEvent) {
    if (!pin || !box || e.button !== 0) return;
    e.preventDefault();
    const r = box.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    pinUi.dragging = true;
    const ac = new AbortController();
    const opts = { capture: true, signal: ac.signal };
    window.addEventListener(
      'pointermove',
      (m) => {
        pin.pageX = Math.max(0, Math.min(innerWidth - r.width, m.clientX - dx)) + scrollX;
        pin.pageY = Math.max(0, Math.min(innerHeight - r.height, m.clientY - dy)) + scrollY;
      },
      opts,
    );
    window.addEventListener(
      'pointerup',
      () => {
        ac.abort();
        pinUi.dragging = false;
        // spec §9: the click after a drag must not reach the page; flag clears after ~50ms
        const swallow = (c: Event) => {
          c.preventDefault();
          c.stopPropagation();
        };
        window.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => window.removeEventListener('click', swallow, true), 50);
      },
      opts,
    );
  }

  const hoverSource = (el: Element | null) => {
    pinUi.hovered = el;
    requestPaint();
  };
</script>

<svelte:window bind:scrollX={sx} bind:scrollY={sy} />

{#if !pin}
  {#each pins as p (p.id)}<PinnedInspector pin={p} />{/each}
{:else}
  <div
    bind:this={box}
    role="dialog"
    tabindex="-1"
    class="pointer-events-auto fixed flex min-h-[80px] min-w-[200px] resize flex-col overflow-hidden rounded-panel border border-line bg-surface font-sans text-[11px] text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
    style:left="{pin.pageX - sx}px"
    style:top="{pin.pageY - sy}px"
    style:width={pin.width ? `${pin.width}px` : undefined}
    style:height={pin.height ? `${pin.height + 48}px` : undefined}
    onpointerdown={() => raisePin(pin.id)}
    onmouseenter={() => hoverSource(pin.el.isConnected ? pin.el : null)}
    onmouseleave={() => hoverSource(null)}
  >
    <div
      class="flex cursor-move items-center justify-between px-2 pt-1"
      onpointerdown={drag}
      role="none"
    >
      <GripHorizontal size={16} class="text-fg-muted" />
      <button
        type="button"
        class="rounded-btn p-1 hover:bg-line"
        aria-label={i18n.t('common.close')}
        title={i18n.t('common.close')}
        onpointerdown={(e) => e.stopPropagation()}
        onclick={() => {
          removePin(pin.id);
          hoverSource(null);
        }}><X size={14} /></button
      >
    </div>
    <div class="truncate px-3 pb-1 font-mono text-fg-muted">{signature(pin.el)}</div>
    <div class="min-h-0 flex-1 overflow-y-auto">
      <InspectPanel el={pin.el} pinned />
    </div>
  </div>
{/if}
