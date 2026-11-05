<script lang="ts">
  import { untrack } from 'svelte';
  import type { EditableRule } from '../../../lib/edit/types';
  import DeclEditor, { type Mark } from './DeclEditor.svelte';
  import { command, refreshPayload } from './edit-store.svelte';

  let {
    rule,
    vars,
    mark,
    dim = false,
  }: {
    rule: EditableRule;
    vars: string[];
    mark: (property: string) => Mark | null;
    /** Its @media does not hold right now. */
    dim?: boolean;
  } = $props();

  let selector = $state(untrack(() => rule.selector));
  let bad = $state(false);
  const file = $derived(
    (rule.source.split(/[?#]/)[0]!.split('/').pop() || rule.source) +
      (rule.line ? `:${rule.line}` : ''),
  );

  async function commitSelector(input: HTMLInputElement) {
    const next = selector.trim();
    if (!next || next === rule.selector) {
      selector = rule.selector;
      return;
    }
    const r = await command('rule_selector_edit', rule.address, next);
    if (r?.ok) {
      bad = false;
      await refreshPayload();
      return;
    }
    // 6.41: an invalid selector flashes red and the old one comes back
    bad = true;
    selector = rule.selector;
    input.value = rule.selector;
    setTimeout(() => (bad = false), 1200);
  }
</script>

<!-- One rule like DevTools: its @-wrappers in grey, `selector {` with the file on the right,
     the declarations, then `}`. -->
<div
  class="border-b border-line py-1.5 pr-2 font-mono text-[11px] transition-opacity"
  class:opacity-50={dim}
  data-rule={rule.selector}
>
  {#each rule.wrappers as w (w)}
    <div class="truncate pl-2 text-fg-muted" title={w}>{w}</div>
  {/each}
  <div class="flex items-center gap-2 pl-2">
    <span class="flex min-w-0 flex-1 items-center">
      {#if rule.editable}
        <input
          class="min-w-0 rounded-sm border bg-transparent px-0.5 text-fg outline-none [field-sizing:content] focus:bg-line {bad
            ? 'border-red-500'
            : 'border-transparent'}"
          bind:value={selector}
          spellcheck="false"
          autocomplete="off"
          data-selector-input
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            } else if (e.key === 'Escape') {
              selector = rule.selector;
              e.currentTarget.blur();
            }
          }}
          onblur={(e) => void commitSelector(e.currentTarget)}
        />
      {:else}
        <span class="min-w-0 truncate px-0.5" title={rule.selector}>{rule.selector}</span>
      {/if}
      <span class="shrink-0 pl-1">{'{'}</span>
    </span>
    <span
      class="max-w-[45%] shrink-0 truncate font-sans text-[10px] text-fg-muted underline decoration-line-strong"
      title={rule.source}>{file}</span
    >
  </div>
  <DeclEditor
    decls={rule.declarations}
    readonly={!rule.editable}
    {vars}
    {mark}
    memo={`${rule.source}|${rule.line}|${rule.selector}`}
    oncommit={(text) => void command('rule_edit', rule.address, text)}
  />
  <div class="pl-2">}</div>
</div>
