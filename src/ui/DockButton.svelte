<script lang="ts">
  import { i18n } from '#i18n';
  import type { DockItem } from '../content/core/registry.svelte';
  import { state as app } from '../content/core/state.svelte';

  let { item, disabled }: { item: DockItem; disabled: boolean } = $props();
  const active = $derived(item.isActive?.() ?? false);
  const Icon = $derived((active && item.activeIcon) || item.icon);
  const label = $derived(i18n.t((active && item.activeLabel) || item.label));
  let tip: HTMLElement;
  const notice = $derived(app.dockNotice?.id === item.id ? app.dockNotice : null);
  $effect(() => {
    const n = notice;
    if (!n) return;
    const t = setTimeout(() => app.dockNotice === n && (app.dockNotice = null), 1500);
    return () => clearTimeout(t);
  });

  /** Keep the tooltip 8px inside the viewport (port of attachTooltipClamp, content.js:35658). */
  function clamp() {
    tip.style.transform = '';
    const r = tip.getBoundingClientRect();
    const dx = r.right > innerWidth - 8 ? innerWidth - 8 - r.right : r.left < 8 ? 8 - r.left : 0;
    // Tailwind -translate-x-1/2 sets `translate`; transform composes on top, so only the offset.
    if (dx) tip.style.transform = `translateX(${Math.round(dx)}px)`;
  }
</script>

<button
  type="button"
  class="group relative grid size-[34px] place-items-center rounded-btn text-fg hover:bg-line disabled:opacity-40 disabled:hover:bg-transparent {item.id ===
  'quit'
    ? 'text-fg-muted'
    : ''}"
  class:bg-accent={active}
  class:text-white={active}
  data-item={item.id}
  aria-label={label}
  aria-pressed={item.isActive ? active : undefined}
  {disabled}
  onclick={() => item.run()}
  onmouseenter={clamp}
>
  <Icon size={19} />
  <span
    bind:this={tip}
    class:hidden={app.popover === item.id}
    class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-btn border border-line bg-surface px-2 py-1 text-[11px] opacity-0 backdrop-blur-surface group-hover:opacity-100"
  >
    {label}{#if item.key}&nbsp;<span class="font-mono text-fg-muted"
        >({item.key.toUpperCase()})</span
      >{/if}
  </span>
  {#if notice}
    <span
      class="pointer-events-none absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-[6px] whitespace-nowrap rounded-full border border-line bg-surface px-2 py-[6px] font-mono text-[12px] leading-[12px] font-medium text-fg backdrop-blur-surface"
    >
      <span class="size-[12px] rounded-[3px]" style:background={notice.color}></span>{notice.text}
    </span>
  {/if}
</button>
