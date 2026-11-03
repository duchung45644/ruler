<script lang="ts">
  import { i18n } from '#i18n';
  import type { TypographyStyle } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import { clearHighlights, hover } from './actions';

  let { styles }: { styles: TypographyStyle[] } = $props();
  const meta = (t: TypographyStyle) =>
    [t.fontSize, t.fontWeight, t.letterSpacing && `ls ${t.letterSpacing}`, t.textTransform].filter(
      Boolean,
    );
</script>

<Section
  id="typography"
  title={i18n.t(styles.length === 1 ? 'panel.typographyStyle' : 'panel.typographyStyles')}
  count={styles.length}
  onleave={clearHighlights}
>
  <div class="flex flex-col gap-1.5">
    {#each styles as t (t.typographyKey)}
      <div
        class="rounded-btn border border-line px-2.5 py-2 hover:border-line-strong"
        role="listitem"
        data-typography={t.typographyKey}
        onmouseenter={() => void hover('highlight_elements_for_typography', t.typographyKey)}
      >
        <div class="flex items-baseline gap-2">
          <span class="flex-1 truncate font-semibold" title={t.fontStack}>{t.fontFamily}</span>
          <span class="text-[10px] text-fg-muted tabular-nums">×{t.usage}</span>
        </div>
        {#if t.sample}
          <!-- drawn dark on transparent; inverted in the dark theme so it stays legible -->
          <div class="my-1.5 overflow-hidden">
            <img
              src={t.sample.dataUrl}
              alt=""
              class="max-w-none invert light:invert-0"
              style:height="{Math.min(t.sample.height, 40)}px"
            />
          </div>
        {/if}
        <div class="flex flex-wrap gap-1 font-mono text-[10px] text-fg-muted">
          {#each meta(t) as m (m)}<span class="rounded bg-line px-1">{m}</span>{/each}
        </div>
      </div>
    {/each}
  </div>
</Section>
