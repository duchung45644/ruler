<script lang="ts">
  import { i18n } from '#i18n';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Info from '@lucide/svelte/icons/info';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import { formatCss } from '../../../lib/style/color';
  import type { Issue } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import { panel } from '../store.svelte';
  import ContrastFix from '../../../ui/ContrastFix.svelte';
  import Swatch from './Swatch.svelte';
  import { clearHighlights, hover, onPage } from './actions';

  let { issues }: { issues: Issue[] } = $props();
  const fmt = $derived(panel.prefs.colorFormat);
  /** Instance shown per issue; kept across update_issues while the issue id stays. */
  let at = $state<Record<string, number>>({});

  function show(issue: Issue, step: number) {
    const n = issue.elementIds.length;
    if (!n) return;
    const i = ((((at[issue.id] ?? 0) + step) % n) + n) % n;
    at[issue.id] = i;
    void onPage('highlight_issue_element', issue.elementIds[i]!);
  }
</script>

<Section
  id="issues"
  title={i18n.t(issues.length === 1 ? 'panel.issue' : 'panel.issues')}
  count={issues.length}
  onleave={clearHighlights}
>
  <div class="flex flex-col gap-1.5">
    {#each issues as issue (issue.id)}
      {@const n = issue.elementIds.length}
      {@const warn = issue.severity === 'warning'}
      <div
        class="cursor-pointer rounded-btn border px-2.5 py-2 {warn
          ? 'border-amber-500/40 bg-amber-500/8'
          : 'border-line'} hover:border-line-strong"
        role="button"
        tabindex="0"
        data-issue={issue.id}
        onmouseenter={() => void hover('highlight_elements_for_issue', issue.id)}
        onclick={() => show(issue, 0)}
        onkeydown={(e) => e.key === 'Enter' && show(issue, 0)}
      >
        <div class="flex items-start gap-2">
          {#if warn}
            <TriangleAlert class="mt-px size-3.5 shrink-0 text-amber-500" />
          {:else}
            <Info class="mt-px size-3.5 shrink-0 text-sky-500" />
          {/if}
          <div class="min-w-0 flex-1">
            <div class="leading-snug font-medium">{issue.message}</div>
            <div class="mt-0.5 leading-snug text-fg-muted">{issue.recommendation}</div>
          </div>
        </div>
        <div class="mt-2 flex items-center gap-2 pl-5.5">
          <span
            class="flex items-center gap-1 font-mono text-[10.5px]"
            title="{issue.metadata.color} / {issue.metadata.backgroundColor}"
          >
            <Swatch color={issue.metadata.color} size="size-3" />
            <Swatch color={issue.metadata.backgroundColor} size="size-3" />
            <span class="text-fg-muted">{formatCss(issue.metadata.color, fmt)}</span>
            <span class="font-semibold tabular-nums">{issue.metadata.contrastRatio}:1</span>
          </span>
          <span class="flex-1"></span>
          {#if n > 1}
            <span class="text-[10.5px] text-fg-muted tabular-nums" data-instances
              >{i18n.t('panel.instances')} {(at[issue.id] ?? 0) + 1}/{n}</span
            >
            <div class="flex">
              <button
                type="button"
                class="grid size-5 place-items-center rounded-[5px] text-fg-muted hover:bg-line hover:text-fg"
                aria-label={i18n.t('panel.previous')}
                title={i18n.t('panel.previous')}
                data-prev
                onclick={(e) => (e.stopPropagation(), show(issue, -1))}
                ><ChevronLeft class="size-3.5" /></button
              >
              <button
                type="button"
                class="grid size-5 place-items-center rounded-[5px] text-fg-muted hover:bg-line hover:text-fg"
                aria-label={i18n.t('panel.next')}
                title={i18n.t('panel.next')}
                data-next
                onclick={(e) => (e.stopPropagation(), show(issue, 1))}
                ><ChevronRight class="size-3.5" /></button
              >
            </div>
          {/if}
        </div>
        <div class="mt-1.5 pl-5.5">
          <ContrastFix
            aa={issue.metadata.suggestedAA}
            aaa={issue.metadata.suggestedAAA}
            format={fmt}
          />
        </div>
        <div
          class="mt-1 truncate pl-5.5 font-mono text-[10.5px] text-fg-muted"
          title={issue.selector}
        >
          {issue.selector}
        </div>
      </div>
    {/each}
  </div>
</Section>
