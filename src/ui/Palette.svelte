<script lang="ts">
  import { i18n } from '#i18n';
  import { runEntry, runnable } from '../content/core/keys';
  import { filterEntries, orderIds } from '../content/core/palette';
  import { DOCK_LAYOUT, items, type DockItem } from '../content/core/registry.svelte';
  import { state as app } from '../content/core/state.svelte';

  /** Shortcuts not stored on the item (Ctrl+Q is routed by keys.ts, parent/child by commands). */
  const EXTRA_KEYS: Record<string, string> = {
    quit: 'Ctrl+Q',
    select_parent: 'Alt+Shift+↑',
    select_child: 'Alt+Shift+↓',
  };

  let query = $state('');
  let index = $state(0);
  let input: HTMLInputElement;
  let list: HTMLElement;

  const labelOf = (i: DockItem) => i18n.t((i.isActive?.() && i.activeLabel) || i.label);
  const ordered = $derived.by(() => {
    const ids = orderIds(
      items.filter((i) => i.id !== 'palette' && i.id !== 'more').map((i) => i.id),
      DOCK_LAYOUT,
    );
    return ids.map((id) => items.find((i) => i.id === id)!);
  });
  const shown = $derived(filterEntries(ordered, query, labelOf));
  $effect(() => {
    void query;
    index = 0; // new filter: back to the best match
  });
  $effect(() => input.focus());
  $effect(() => {
    // keep the active row visible (one read on the row, no writes before it)
    list.children[index]?.scrollIntoView({ block: 'nearest' });
  });

  const close = () => (app.palette = false);
  function run(item: DockItem | undefined) {
    if (!item || !runnable(item)) return;
    close(); // before running: the item may open its own popover
    runEntry(item);
  }
  function onkeydown(e: KeyboardEvent) {
    const n = shown.length;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown' && n) index = (index + 1) % n;
    else if (e.key === 'ArrowUp' && n) index = (index - 1 + n) % n;
    else if (e.key === 'Enter') run(shown[index]);
    else return;
    e.preventDefault();
  }
</script>

<div
  class="fixed inset-0 grid place-items-start justify-center bg-black/20 pt-[15vh] font-sans text-fg"
  data-palette
  role="presentation"
  onmousedown={(e) => e.target === e.currentTarget && close()}
>
  <div
    class="flex max-h-[60vh] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
    role="dialog"
    aria-label={i18n.t('palette.title')}
  >
    <input
      bind:this={input}
      bind:value={query}
      {onkeydown}
      type="text"
      spellcheck="false"
      class="border-b border-line bg-transparent px-3 py-2.5 text-[13px] outline-none placeholder:text-fg-muted"
      placeholder={i18n.t('palette.placeholder')}
      role="combobox"
      aria-expanded="true"
      aria-controls="pixellens-palette-list"
    />
    <ul bind:this={list} id="pixellens-palette-list" role="listbox" class="overflow-y-auto p-1">
      {#each shown as item, i (item.id)}
        {@const Icon = (item.isActive?.() && item.activeIcon) || item.icon}
        {@const ok = runnable(item)}
        {@const key = item.key?.toUpperCase() ?? EXTRA_KEYS[item.id]}
        <li
          role="option"
          aria-selected={i === index}
          aria-disabled={!ok}
          data-palette-item={item.id}
          class="flex cursor-default items-center gap-2.5 rounded-btn px-2 py-1.5 text-[13px]"
          class:bg-line={i === index}
          class:opacity-40={!ok}
          onmousemove={() => (index = i)}
          onclick={() => run(item)}
          onkeydown={() => {}}
        >
          <Icon size={16} />
          <span class="flex-1 truncate">{labelOf(item)}</span>
          {#if key}
            <kbd
              class="rounded-[4px] border border-line px-1.5 py-px font-mono text-[11px] text-fg-muted"
              >{key}</kbd
            >
          {/if}
        </li>
      {:else}
        <li class="px-2 py-3 text-center text-[12px] text-fg-muted">
          {i18n.t('palette.empty')}
        </li>
      {/each}
    </ul>
    <div class="border-t border-line px-3 py-1.5 text-[11px] text-fg-muted">
      {i18n.t('palette.hint')}
    </div>
  </div>
</div>
