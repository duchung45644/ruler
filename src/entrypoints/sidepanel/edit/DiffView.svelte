<script lang="ts">
  import { i18n } from '#i18n';
  import { lineDiff, whitespaceOnly } from '../../../lib/edit/diff';

  let { before, after }: { before: string; after: string } = $props();
  const lines = $derived(lineDiff(before, after));
  const blank = $derived(whitespaceOnly(before, after));
</script>

{#if blank}
  <div class="px-2 py-1 text-fg-muted italic" data-whitespace>
    {i18n.t('changes.whitespaceOnly')}
  </div>
{:else}
  <div class="font-mono text-[11px] leading-[1.55]" data-diff>
    {#each lines as l, i (i)}
      <div
        class="flex {l.kind === '+'
          ? 'bg-emerald-500/12 text-emerald-300 light:text-emerald-800'
          : l.kind === '-'
            ? 'bg-red-500/12 text-red-300 light:text-red-800'
            : 'text-fg-muted'}"
        data-kind={l.kind}
      >
        <span class="w-8 shrink-0 pr-1.5 text-right text-fg-muted/60 tabular-nums select-none"
          >{l.line}</span
        >
        <span class="w-3 shrink-0 select-none">{l.kind === '=' ? '' : l.kind}</span>
        <span class="min-w-0 pr-2 break-all whitespace-pre-wrap">{l.text}</span>
      </div>
    {/each}
  </div>
{/if}
