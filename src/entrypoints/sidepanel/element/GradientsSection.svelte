<script lang="ts">
  import { i18n } from '#i18n';
  import { formatCss } from '../../../lib/color';
  import type { Gradient } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import { panel } from '../store.svelte';
  import CopyButton from './CopyButton.svelte';
  import Swatch from './Swatch.svelte';

  let { gradients }: { gradients: Gradient[] } = $props();
  const fmt = $derived(panel.prefs.colorFormat);
  const meta = (g: Gradient) =>
    [g.type, g.angle !== null ? `${g.angle}deg` : null, g.shape].filter(Boolean).join(' · ');
</script>

<Section
  id="gradients"
  title={i18n.t(gradients.length === 1 ? 'panel.gradient' : 'panel.gradients')}
  count={gradients.length}
>
  <div class="flex flex-col gap-3">
    {#each gradients as g, n (n)}
      <div data-gradient>
        <div class="h-10 rounded-btn border border-line" style:background-image={g.raw}></div>
        <div class="mt-1.5 flex items-center gap-2">
          <span class="flex-1 font-mono text-[11px] text-fg-muted">{meta(g)}</span>
          <CopyButton text={g.raw} />
        </div>
        <ul class="flex flex-col gap-1 font-mono text-[11px]">
          {#each g.stops as s, i (i)}
            <li class="flex items-center gap-2">
              <Swatch color={s.color} size="size-3.5" />
              <span class="flex-1 truncate">{formatCss(s.color, fmt)}</span>
              {#if s.position !== null}<span class="text-fg-muted tabular-nums"
                  >{s.position}{s.unit}</span
                >{/if}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</Section>
