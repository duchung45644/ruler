<script lang="ts">
  import { i18n } from '#i18n';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import Info from '@lucide/svelte/icons/info';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import type { SeoIssue } from '../../../lib/page/types';
  import { clearHighlights, hover, onPage } from '../element/actions';
  import Section from '../Section.svelte';

  let { issues }: { issues: SeoIssue[] } = $props();
  const PER_ELEMENT = new Set(['multiple-h1', 'missing-alt']);
  const groups = $derived.by(() => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- local, rebuilt per derive
    const by = new Map<string, SeoIssue[]>();
    for (const i of issues) by.set(i.groupingKey, [...(by.get(i.groupingKey) ?? []), i]);
    return [...by.values()];
  });
  const tone = {
    error: 'border-rose-500/40 bg-rose-500/8',
    warning: 'border-amber-500/40 bg-amber-500/8',
    info: 'border-line',
  };
</script>

<Section
  id="seoIssues"
  title={i18n.t(groups.length === 1 ? 'page.seoIssue' : 'page.seoIssues')}
  count={groups.length}
  onleave={clearHighlights}
>
  <div class="flex flex-col gap-1.5">
    {#each groups as list (list[0]!.groupingKey)}
      {@const first = list[0]!}
      {@const ids = PER_ELEMENT.has(first.groupingKey) ? list : []}
      <div
        class="rounded-btn border px-2.5 py-2 {tone[first.severity]}"
        data-seo={first.groupingKey}
      >
        <div class="flex items-start gap-2">
          {#if first.severity === 'error'}
            <CircleAlert class="mt-px size-3.5 shrink-0 text-rose-500" />
          {:else if first.severity === 'warning'}
            <TriangleAlert class="mt-px size-3.5 shrink-0 text-amber-500" />
          {:else}
            <Info class="mt-px size-3.5 shrink-0 text-sky-500" />
          {/if}
          <div class="min-w-0 flex-1">
            <div class="leading-snug font-medium">
              {first.message}
              {#if list.length > 1}<span class="text-fg-muted tabular-nums">×{list.length}</span
                >{/if}
            </div>
            <div class="mt-0.5 leading-snug text-fg-muted">{first.recommendation}</div>
          </div>
        </div>
        {#if ids.length}
          <ul class="mt-1.5 flex flex-col pl-5.5">
            {#each ids as it (it.id)}
              <li>
                <button
                  type="button"
                  class="w-full truncate rounded-[5px] px-1 text-left font-mono text-[10.5px] text-fg-muted hover:bg-line hover:text-fg"
                  title={it.selector ?? it.target}
                  data-seo-element={it.id}
                  onmouseenter={() => void hover('highlight_hovered', it.id)}
                  onclick={() => void onPage('highlight_issue_element', it.id)}
                  >{it.selector ?? it.target}</button
                >
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </div>
</Section>
