<script lang="ts">
  import { i18n } from '#i18n';
  import { formatCss } from '../../../lib/color';
  import type { Shadow } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import { panel } from '../store.svelte';
  import CopyButton from './CopyButton.svelte';
  import Swatch from './Swatch.svelte';

  let { shadows }: { shadows: Shadow[] } = $props();
  const fmt = $derived(panel.prefs.colorFormat);
</script>

<Section
  id="boxShadow"
  title={i18n.t(shadows.length === 1 ? 'panel.boxShadow' : 'panel.boxShadows')}
  count={shadows.length}
>
  <div class="flex flex-col gap-2">
    {#each shadows as s, n (n)}
      <div class="flex items-center gap-3" data-shadow>
        <div class="grid size-12 shrink-0 place-items-center rounded-btn bg-line/40">
          <div class="size-7 rounded-[5px] bg-white" style:box-shadow={s.raw}></div>
        </div>
        <div class="min-w-0 flex-1 font-mono text-[11px]">
          <div class="flex items-center gap-1.5">
            <Swatch color={s.color} size="size-3" />
            <span class="truncate">{formatCss(s.color, fmt)}</span>
            {#if s.inset}<span class="rounded bg-line px-1 text-[10px] text-fg-muted">inset</span
              >{/if}
          </div>
          <div class="mt-0.5 text-fg-muted tabular-nums">{s.x} {s.y} {s.blur} {s.spread}</div>
        </div>
        <CopyButton text={s.raw} />
      </div>
    {/each}
  </div>
</Section>
