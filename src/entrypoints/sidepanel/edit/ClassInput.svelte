<script lang="ts" module>
  // page classes per tab: get_page_classes walks the whole DOM
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- a cache, never rendered
  const cache = new Map<number, Promise<string[]>>();
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { panel, toPage } from '../store.svelte';
  import { command, edit, refreshPayload } from './edit-store.svelte';
  import Suggest from './Suggest.svelte';

  let { id }: { id: string } = $props();
  let value = $state(untrack(() => edit.classes));
  let all = $state<string[]>([]);
  let open = $state(false);
  let active = $state(0);

  $effect(() => {
    const tab = panel.tabId;
    if (tab === null) return;
    if (!cache.has(tab))
      cache.set(
        tab,
        toPage('get_page_classes').then((r) => (Array.isArray(r) ? r : [])),
      );
    void cache.get(tab)!.then((r) => (all = r));
  });

  const token = $derived(/(\S*)$/.exec(value)![1]!);
  const items = $derived.by(() => {
    if (!open || !token) return [];
    const have = new Set(value.split(/\s+/));
    return all.filter((c) => c.startsWith(token) && !have.has(c)).slice(0, 8);
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  // undo / redo on the page resends the classes; typing not yet committed wins
  $effect(() => {
    const cls = edit.classes;
    if (timer === undefined) value = cls;
  });

  async function commit() {
    clearTimeout(timer);
    timer = undefined;
    const next = value.trim().replace(/\s+/g, ' ');
    if (next === edit.classes) return;
    const r = await command('set_element_classes', id, next);
    if (!r?.ok) return;
    edit.classes = next;
    if (panel.element) {
      const base = panel.element.name.replace(/\..*$/, '');
      panel.element.name = next ? `${base}.${next.split(' ').join('.')}` : base;
    }
    await refreshPayload();
  }
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void commit(), 300);
  };

  function accept(item: string) {
    value = value.slice(0, value.length - token.length) + item + ' ';
    open = false;
    schedule();
  }

  function onkeydown(e: KeyboardEvent) {
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (k === 'z' || k === 'y')) {
      // the page's history owns class edits (D4), not the field's own undo
      e.preventDefault();
      clearTimeout(timer);
      timer = undefined;
      void command((k === 'z' && e.shiftKey) || k === 'y' ? 'edit_redo' : 'edit_undo');
      return;
    }
    if (items.length) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        accept(items[active]!);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        open = false;
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      void commit();
    }
  }
</script>

<div class="relative flex items-center gap-1.5 font-mono text-[11px]">
  <span class="text-fg-muted">.</span>
  <input
    class="h-7 min-w-0 flex-1 rounded-btn border border-line bg-transparent px-2 text-fg outline-none focus:border-accent"
    bind:value
    placeholder="class"
    spellcheck="false"
    autocomplete="off"
    aria-label="class"
    data-class-input
    oninput={() => {
      open = true;
      active = 0;
      schedule();
    }}
    {onkeydown}
    onblur={() => {
      open = false;
      void commit();
    }}
  />
  {#if items.length}
    <div class="absolute top-full left-3 z-20 mt-0.5">
      <Suggest {items} {active} onpick={accept} />
    </div>
  {/if}
</div>
