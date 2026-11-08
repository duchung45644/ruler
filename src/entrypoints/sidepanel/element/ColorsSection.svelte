<script lang="ts">
  import { i18n } from '#i18n';
  import { formatCss, type ColorFormat } from '../../../lib/style/color';
  import type { ElementColors } from '../../../lib/element/types';
  import { copyText } from '../../../lib/ext/clipboard';
  import { updatePanelPrefs } from '../../../lib/ext/settings';
  import Section from '../Section.svelte';
  import { panel } from '../store.svelte';
  import Swatch from './Swatch.svelte';
  import { clearHighlights, hover } from './actions';

  let { colors }: { colors: ElementColors } = $props();
  const FORMATS: ColorFormat[] = ['HEX', 'RGB', 'HSL', 'HSB'];
  const fmt = $derived(panel.prefs.colorFormat);
  const total = $derived(new Set([...colors.text, ...colors.backgrounds, ...colors.borders]).size);
  const groups = $derived(
    (
      [
        [i18n.t('panel.text'), colors.text],
        [i18n.t('panel.backgrounds'), colors.backgrounds],
        [i18n.t('panel.borders'), colors.borders],
      ] as [string, string[]][]
    ).filter(([, list]) => list.length),
  );
  function setFormat(f: ColorFormat) {
    panel.prefs = { ...panel.prefs, colorFormat: f };
    void updatePanelPrefs({ colorFormat: f });
  }
  let copied = $state<string | null>(null);
  async function copy(value: string) {
    if (!(await copyText(value))) return;
    copied = value;
    setTimeout(() => copied === value && (copied = null), 1500);
  }
</script>

<Section
  id="colors"
  title={i18n.t(total === 1 ? 'panel.color' : 'panel.colors')}
  count={total}
  onleave={clearHighlights}
>
  {#snippet actions()}
    <div class="flex gap-0.5" role="radiogroup" data-formats>
      {#each FORMATS as f (f)}
        <button
          type="button"
          role="radio"
          aria-checked={fmt === f}
          class="rounded-md px-1.5 py-0.5 text-[10px] font-semibold hover:bg-line"
          class:bg-line={fmt === f}
          class:text-fg-muted={fmt !== f}
          data-format={f}
          onclick={() => setFormat(f)}>{f}</button
        >
      {/each}
    </div>
  {/snippet}
  <div class="flex flex-col gap-2.5">
    {#each groups as [label, list] (label)}
      <div>
        <div class="mb-1 text-[10px] font-semibold tracking-wide text-fg-muted uppercase">
          {label}
        </div>
        <div class="flex flex-wrap gap-1">
          {#each list as hex (hex)}
            {@const value = formatCss(hex, fmt)}
            <button
              type="button"
              class="flex max-w-full items-center gap-1.5 rounded-btn border border-line py-0.5 pr-2 pl-0.5 font-mono text-[11px] hover:border-line-strong hover:bg-line"
              title={i18n.t('panel.copy')}
              data-color-copy={value}
              onmouseenter={() => void hover('highlight_elements_for_color', hex)}
              onclick={() => void copy(value)}
            >
              <Swatch color={hex} />
              <span class="truncate">{copied === value ? i18n.t('panel.copied') : value}</span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</Section>
