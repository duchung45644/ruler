<script lang="ts">
  import { i18n } from '#i18n';
  import { copyText } from '../lib/ext/clipboard';
  import { formatCss, type ColorFormat } from '../lib/style/color';

  /** Suggested foregrounds (HEX) for AA / AAA; a level without a suggestion is left out. */
  let { aa, aaa, format }: { aa?: string | null; aaa?: string | null; format: ColorFormat } =
    $props();
  const fixes = $derived(
    (
      [
        ['AA', aa],
        ['AAA', aaa],
      ] as const
    ).filter((f): f is readonly ['AA' | 'AAA', string] => !!f[1]),
  );
  let copied = $state<string | null>(null);

  async function copy(e: MouseEvent, text: string) {
    e.stopPropagation(); // rows under it are clickable
    if (!(await copyText(text))) return;
    copied = text;
    setTimeout(() => copied === text && (copied = null), 1500);
  }
</script>

{#if fixes.length}
  <div class="flex flex-wrap items-center gap-1.5 font-mono text-[10.5px]" data-contrast-fix>
    <span class="font-sans text-fg-muted">{i18n.t('contrastFix.suggested')}</span>
    {#each fixes as [level, hex] (level)}
      {@const text = formatCss(hex, format)}
      <button
        type="button"
        class="flex items-center gap-1 rounded-[5px] border border-line px-1 py-0.5 hover:border-line-strong"
        title={i18n.t('contrastFix.copy')}
        data-fix={level}
        onclick={(e) => copy(e, text)}
      >
        <span class="size-3 rounded-sm border border-line-strong" style:background={hex}></span>
        <span class="font-semibold">{level}</span>
        <span class="text-fg-muted">{copied === text ? i18n.t('contrastFix.copied') : text}</span>
      </button>
    {/each}
  </div>
{/if}
