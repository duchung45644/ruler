<script lang="ts" module>
  import type { HtmlChange } from '../../../lib/edit/changes';
  import type { RuleChange } from '../../../lib/edit/types';

  export interface Group {
    /** The element's id; null for a rule no selected element touched. */
    id: string | null;
    label: string;
    /** Set for a rule group with no element: what to look for on the page. */
    target?: { selector: string; scopeAddress: string | null };
    rules: RuleChange[];
    html: HtmlChange[];
  }
</script>

<script lang="ts">
  import { i18n } from '#i18n';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import DiffView from './DiffView.svelte';

  let {
    group,
    onselect,
    onfind,
    onhover,
    onclear,
    onrevert,
  }: {
    group: Group;
    onselect: (id: string) => void;
    onfind: (target: NonNullable<Group['target']>) => void;
    onhover: (id: string | null) => void;
    onclear: (id: string) => void;
    onrevert: (recordId: string) => void;
  } = $props();

  const n = $derived(group.rules.length);
  const file = (c: RuleChange) =>
    (c.source.split(/[?#]/)[0]!.split('/').pop() || c.source) + (c.line ? `:${c.line}` : '');
</script>

<section class="border-b border-line" data-group={group.id ?? ''}>
  <div class="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
    {#if group.id}
      {@const id = group.id}
      <button
        type="button"
        class="min-w-0 truncate text-left font-mono text-[12px] font-medium text-accent hover:underline"
        title={group.label}
        data-select
        onclick={() => onselect(id)}
        onmouseenter={() => onhover(id)}
        onmouseleave={() => onhover(null)}>{group.label}</button
      >
    {:else if group.target}
      {@const target = group.target}
      <button
        type="button"
        class="min-w-0 truncate text-left font-mono text-[12px] font-medium text-accent hover:underline"
        title={group.label}
        data-find
        onclick={() => onfind(target)}>{group.label}</button
      >
    {:else}
      <span class="min-w-0 truncate font-mono text-[12px] font-medium" title={group.label}
        >{group.label}</span
      >
    {/if}
    {#if n}
      <span class="shrink-0 rounded-full bg-line px-1.5 text-[10px] text-fg-muted tabular-nums"
        >{n === 1 ? i18n.t('changes.rulesOne') : i18n.t('changes.rulesOther', [String(n)])}</span
      >
    {/if}
    <span class="flex-1"></span>
    {#if group.id}
      {@const id = group.id}
      <button
        type="button"
        class="grid size-6 place-items-center rounded-btn text-fg-muted hover:bg-line hover:text-red-400"
        title={i18n.t('dialog.clearElementTitle')}
        aria-label={i18n.t('dialog.clearElementTitle')}
        data-clear-element
        onclick={() => onclear(id)}><Trash2 class="size-3.5" /></button
      >
    {/if}
  </div>
  <div class="flex flex-col gap-1.5 px-3 pb-3">
    {#each group.rules as c (c.recordId)}
      <div class="overflow-hidden rounded-btn border border-line" data-rule-change>
        <div class="flex items-center gap-2 border-b border-line px-2 py-1">
          <span class="min-w-0 flex-1 truncate font-mono text-[11px] text-fg-muted" title={c.source}
            >{file(c)}</span
          >
          <button
            type="button"
            class="grid size-5 place-items-center rounded text-fg-muted hover:bg-line hover:text-fg"
            title={i18n.t('changes.clearChanges')}
            aria-label={i18n.t('changes.clearChanges')}
            data-revert
            onclick={() => onrevert(c.recordId)}><RotateCcw class="size-3" /></button
          >
        </div>
        <DiffView before={c.before} after={c.after} />
      </div>
    {/each}
    {#each group.html as h, i (i)}
      <div class="overflow-hidden rounded-btn border border-line" data-html-change>
        <div
          class="border-b border-line px-2 py-1 text-[10px] font-semibold tracking-wide text-fg-muted uppercase"
        >
          HTML · {h.kind}
        </div>
        <DiffView before={h.before} after={h.after} />
      </div>
    {/each}
  </div>
</section>
