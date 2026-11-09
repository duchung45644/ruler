<script lang="ts">
  import { i18n } from '#i18n';
  import { itemLocked, items, MORE_ITEMS } from '../content/core/registry.svelte';
  import { state as app } from '../content/core/state.svelte';

  const rows = $derived(MORE_ITEMS.map((id) => items.find((i) => i.id === id)).filter((i) => !!i));
</script>

<div class="flex w-52 flex-col gap-0.5 font-sans text-[12px]" data-more-menu>
  {#each rows as item (item.id)}
    {@const active = item.isActive?.() ?? false}
    {@const Icon = (active && item.activeIcon) || item.icon}
    <button
      type="button"
      data-more-item={item.id}
      class="flex items-center gap-2 rounded-btn px-2 py-1.5 text-left text-fg hover:bg-line disabled:opacity-40 disabled:hover:bg-transparent"
      class:bg-accent={active}
      class:text-white={active}
      aria-pressed={item.isActive ? active : undefined}
      disabled={itemLocked(item) || !!item.isDisabled?.()}
      onclick={() => {
        app.popover = null;
        item.run();
      }}
    >
      <Icon size={16} />
      <span class="flex-1">{i18n.t((active && item.activeLabel) || item.label)}</span>
      {#if item.key}<span class="font-mono text-fg-muted uppercase">{item.key}</span>{/if}
    </button>
  {/each}
</div>
