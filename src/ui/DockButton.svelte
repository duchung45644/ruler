<script lang="ts">
  import { i18n } from '#i18n';
  import type { DockItem } from '../content/core/registry.svelte';

  let { item, disabled }: { item: DockItem; disabled: boolean } = $props();
  const active = $derived(item.isActive?.() ?? false);
  const Icon = $derived((active && item.activeIcon) || item.icon);
  const label = $derived(i18n.t((active && item.activeLabel) || item.label));
  let tip: HTMLElement;

  /** Keep the tooltip 8px inside the viewport (port of attachTooltipClamp, content.js:35658). */
  function clamp() {
    tip.style.transform = '';
    const r = tip.getBoundingClientRect();
    const dx = r.right > innerWidth - 8 ? innerWidth - 8 - r.right : r.left < 8 ? 8 - r.left : 0;
    if (dx) tip.style.transform = `translateX(calc(-50% + ${Math.round(dx)}px))`;
  }
</script>

<button
  type="button"
  class="group relative grid size-[26px] place-items-center rounded-btn text-fg hover:bg-line disabled:opacity-40 disabled:hover:bg-transparent {item.id ===
  'quit'
    ? 'text-fg-muted'
    : ''}"
  class:bg-accent={active}
  class:text-white={active}
  aria-label={label}
  aria-pressed={item.isActive ? active : undefined}
  {disabled}
  onclick={() => item.run()}
  onmouseenter={clamp}
>
  <Icon size={15} />
  <span
    bind:this={tip}
    class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-btn border border-line bg-surface px-2 py-1 text-[11px] opacity-0 backdrop-blur-surface group-hover:opacity-100"
  >
    {label}{#if item.key}&nbsp;<span class="font-mono text-fg-muted">({item.key})</span>{/if}
  </span>
</button>
