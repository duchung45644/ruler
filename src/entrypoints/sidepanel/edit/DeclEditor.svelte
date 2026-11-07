<script lang="ts" module>
  export interface Mark {
    kind: 'overridden' | 'not-inherited' | 'hidden';
    title: string;
  }
  /**
   * Unticked declarations per rule (`memo`): the page drops them from the rule, so the panel keeps
   * them to show again, unticked, when the rule is drawn anew (DevTools keeps them as comments).
   */
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- read once per mount, not reactive
  const unticked = new Map<string, { property: string; value: string }[]>();
</script>

<script lang="ts">
  import { i18n } from '#i18n';
  import { tick, untrack } from 'svelte';
  import {
    knownProperties,
    stepNumber,
    suggestProperties,
    suggestValues,
  } from '../../../lib/css/suggest';
  import type { Decl } from '../../../lib/edit/decls';
  import Suggest from './Suggest.svelte';

  let {
    decls,
    readonly = false,
    vars = [],
    mark,
    memo,
    oncommit,
  }: {
    decls: Decl[];
    readonly?: boolean;
    /** Custom properties in scope, offered as `var(--x)` values. */
    vars?: string[];
    mark?: (property: string) => Mark | null;
    /** Rule identity for remembering unticked declarations; no ticks without it. */
    memo?: string;
    oncommit?: (declsText: string) => void;
  } = $props();

  type Field = 'property' | 'value';
  interface Row {
    id: number;
    property: string;
    value: string;
    off?: boolean;
  }
  let seq = 0;
  const toRow = (d: Decl): Row => ({
    id: seq++,
    property: d.property,
    value: d.important ? `${d.value} !important` : d.value,
  });
  const blank = (): Row => ({ id: seq++, property: '', value: '' });
  // the parent remounts this per payload, so the rows only follow typing afterwards
  let rows = $state(
    untrack(() => {
      const live = decls.map(toRow);
      const off = (memo && unticked.get(memo)) || [];
      // an unticked one that is back in the rule (undo, edited on the page) is simply on again
      const back = off.filter((o) => !live.some((r) => r.property === o.property));
      return [...live, ...back.map((o) => ({ id: seq++, ...o, off: true }))];
    }),
  );
  function tick_(row: Row) {
    row.off = !row.off;
    if (memo)
      unticked.set(
        memo,
        rows
          .filter((r) => r.off && r.property)
          .map((r) => ({ property: r.property, value: r.value })),
      );
    flush();
  }
  const colorOf = (r: Row) => {
    const v = r.value.replace(/\s*!\s*important\s*$/i, '').trim();
    return v &&
      !v.includes('var(') &&
      supports('color', v) &&
      !/^(inherit|initial|unset|revert|currentcolor|transparent)$/i.test(v)
      ? v
      : null;
  };
  $effect(() => {
    const last = rows[rows.length - 1];
    if (!readonly && (!last || last.property || last.value)) rows.push(blank());
  });

  const text = () =>
    rows
      .filter((r) => !r.off && r.property.trim() && r.value.trim())
      .map((r) => `${r.property.trim()}: ${r.value.trim()};`)
      .join(' ');
  let sent = untrack(text);
  let timer: ReturnType<typeof setTimeout> | undefined;
  function flush() {
    clearTimeout(timer);
    const t = text();
    if (t === sent) return;
    sent = t;
    oncommit?.(t);
  }
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(flush, 150);
  };

  let known: string[] | null = null;
  let open = $state<{ id: number; field: Field } | null>(null);
  let active = $state(0);
  const items = $derived.by(() => {
    if (!open) return [];
    const row = rows.find((r) => r.id === open!.id);
    if (!row) return [];
    const list =
      open.field === 'property'
        ? row.property.trim()
          ? suggestProperties(row.property, (known ??= knownProperties()))
          : []
        : suggestValues(row.property, row.value, vars);
    const cur = open.field === 'property' ? row.property : row.value;
    return list.length === 1 && list[0] === cur.trim() ? [] : list.slice(0, 8);
  });

  let root: HTMLElement;
  async function focusField(id: number, field: Field) {
    await tick();
    root?.querySelector<HTMLInputElement>(`[data-row="${id}"] [data-field="${field}"]`)?.focus();
  }

  function accept(row: Row, field: Field, item: string) {
    row[field] = item;
    open = null;
    if (field === 'property') void focusField(row.id, 'value');
    else schedule();
  }

  function oninput(row: Row, field: Field, value: string) {
    if (field === 'property' && value.includes(':')) {
      // "color: red" typed or pasted in one go
      const at = value.indexOf(':');
      row.property = value.slice(0, at).trim();
      row.value = value.slice(at + 1).trim();
      void focusField(row.id, 'value');
    } else row[field] = value;
    open = { id: row.id, field };
    active = 0;
    schedule();
  }

  function onkeydown(e: KeyboardEvent, row: Row, field: Field) {
    if (items.length && open?.id === row.id && open.field === field) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        accept(row, field, items[active]!);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        open = null;
        return;
      }
    }
    if (field === 'value' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      const input = e.currentTarget as HTMLInputElement;
      const delta = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : e.altKey ? 0.1 : 1);
      const next = stepNumber(row.value, input.selectionStart ?? row.value.length, delta);
      if (next === null) return;
      e.preventDefault();
      const caret = input.selectionStart;
      row.value = next;
      schedule();
      void tick().then(() => caret !== null && input.setSelectionRange(caret, caret));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'property') void focusField(row.id, 'value');
      else {
        flush();
        const next = rows[rows.indexOf(row) + 1];
        if (next) void focusField(next.id, 'property');
      }
    } else if (e.key === 'Escape') (e.currentTarget as HTMLInputElement).blur();
  }

  function onblur() {
    open = null;
    flush();
  }

  const supports = (p: string, v: string) =>
    typeof CSS === 'undefined' || typeof CSS.supports !== 'function' || CSS.supports(p, v);
  const badProperty = (r: Row) =>
    !!r.property && !r.property.startsWith('--') && !supports(r.property, 'inherit');
  const badValue = (r: Row) =>
    !!r.value.trim() &&
    !!r.property &&
    !r.property.startsWith('--') &&
    !badProperty(r) &&
    !supports(r.property, r.value.replace(/\s*!\s*important\s*$/i, ''));
</script>

<div bind:this={root} class="font-mono text-[11px] leading-5" data-decls>
  {#each rows as row (row.id)}
    {@const m = row.property ? mark?.(row.property) : null}
    {@const typing = open?.id === row.id && open.field === 'property' && items.length > 0}
    {@const bp = !typing && badProperty(row)}
    {@const bv = badValue(row)}
    {@const title = bp
      ? i18n.t('edit.invalidProperty')
      : bv
        ? i18n.t('edit.invalidValue')
        : (m?.title ?? '')}
    <div
      class="group relative flex min-h-5 cursor-text items-center rounded-sm pl-5 hover:bg-line/50"
      class:opacity-50={row.off || m?.kind === 'overridden' || m?.kind === 'not-inherited'}
      data-off={row.off || undefined}
      data-row={row.id}
      data-mark={bp ? 'invalid-property' : bv ? 'invalid-value' : m?.kind}
      title={title || undefined}
    >
      {#if bp || bv || m?.kind === 'hidden'}
        <span
          class="absolute left-2 size-1.5 rounded-full {bp || bv ? 'bg-red-500' : 'bg-amber-500'}"
        ></span>
      {/if}
      {#if memo && !readonly && row.property && row.value}
        <input
          type="checkbox"
          class="absolute left-0.5 size-3 cursor-pointer opacity-0 group-hover:opacity-100 checked:opacity-100"
          class:!opacity-100={row.off}
          checked={!row.off}
          title={i18n.t('edit.toggleDecl')}
          data-toggle
          onchange={() => tick_(row)}
        />
      {/if}
      <input
        class="field min-w-[1ch] text-sky-300 light:text-sky-700"
        class:flex-1={!row.property && !row.value}
        class:line-through={row.off || m?.kind === 'overridden'}
        class:decoration-wavy={bp}
        class:underline={bp}
        class:decoration-red-500={bp}
        value={row.property}
        {readonly}
        spellcheck="false"
        autocomplete="off"
        data-field="property"
        oninput={(e) => oninput(row, 'property', e.currentTarget.value)}
        onkeydown={(e) => onkeydown(e, row, 'property')}
        {onblur}
      /><span class="text-fg-muted" class:opacity-0={!row.property && !row.value}>:</span>
      {#if colorOf(row)}
        <span
          class="ml-1 inline-block size-2.5 shrink-0 rounded-xs border border-line-strong"
          style:background={colorOf(row)}
          data-swatch
        ></span>
      {/if}
      <input
        class="field ml-1 min-w-0"
        class:line-through={row.off || m?.kind === 'overridden'}
        class:decoration-wavy={bv}
        class:underline={bv}
        class:decoration-red-500={bv}
        value={row.value}
        {readonly}
        spellcheck="false"
        autocomplete="off"
        data-field="value"
        oninput={(e) => oninput(row, 'value', e.currentTarget.value)}
        onkeydown={(e) => onkeydown(e, row, 'value')}
        {onblur}
      /><span class="text-fg-muted" class:opacity-0={!row.property || !row.value}>;</span><span
        class:flex-1={row.property || row.value}
      ></span>
      {#if open?.id === row.id && items.length}
        <div class="absolute top-full z-20 mt-0.5 {open.field === 'value' ? 'left-1/3' : 'left-3'}">
          <Suggest {items} {active} onpick={(item) => accept(row, open!.field, item)} />
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .field {
    field-sizing: content;
    border: 0;
    padding: 0 2px;
    border-radius: 2px;
    background: transparent;
    font: inherit;
    outline: none;
  }
  .field:focus {
    background: var(--color-line);
  }
  .field[readonly] {
    cursor: default;
  }
</style>
