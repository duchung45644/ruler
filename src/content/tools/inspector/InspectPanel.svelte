<script module lang="ts">
  import { contrastRatio, parseColor, toHex, wcagLevel } from '../../../lib/color';
  import { backgroundOf, isTextHeavy } from '../../core/contrast';

  /** Port of getTextColorWithAccessibility (:43944) + renderAccessibilityInfo (:43350). */
  function contrastOf(el: Element, s: CSSStyleDeclaration) {
    if (!isTextHeavy(el)) return null;
    const bg = backgroundOf(el);
    const fg = parseColor(s.color);
    if (!bg || !fg) return null;
    const size = parseFloat(s.fontSize);
    const large = size >= 18 || (size >= 14 && parseInt(s.fontWeight) >= 700);
    const opacity = parseFloat(s.opacity);
    const ratio = contrastRatio({ ...fg, a: fg.a * (isNaN(opacity) ? 1 : opacity) }, bg);
    return {
      fg: toHex(fg),
      bg: toHex(bg),
      ratio: Math.round(ratio * 100) / 100,
      level: wcagLevel(ratio, large),
    };
  }

  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain cache, not UI state
  const sizes = new Map<string, Promise<string | null>>();
  const fmt = (n: number) =>
    n < 1024
      ? `${n} B`
      : n < 1048576
        ? `${(n / 1024).toFixed(1)} KB`
        : `${(n / 1048576).toFixed(2)} MB`;

  /** Port of getImageFileSize (:43219): resource timing → HEAD → GET; cached; null on any failure. */
  function fileSize(src: string): Promise<string | null> {
    let p = sizes.get(src);
    if (!p) {
      p = (async () => {
        try {
          for (const e of performance.getEntriesByName(src) as PerformanceResourceTiming[]) {
            const n = e.encodedBodySize || e.decodedBodySize;
            if (n > 0) return fmt(n);
          }
          const head = await fetch(src, { method: 'HEAD' });
          const len = parseInt(head.headers.get('content-length') ?? '0', 10);
          if (len > 0) return fmt(len);
          const blob = await (await fetch(src)).blob();
          return blob.size > 0 ? fmt(blob.size) : null;
        } catch {
          return null;
        }
      })();
      sizes.set(src, p);
    }
    return p;
  }
</script>

<script lang="ts">
  import { i18n } from '#i18n';
  import Copy from '@lucide/svelte/icons/copy';
  import { copyText } from '../../../lib/clipboard';
  import { cssSnippet, inspectGroups, renderedFont } from '../../../lib/css/inspect';
  import Info from '@lucide/svelte/icons/info';
  import { pinHintDone } from '../../../lib/settings';
  import { panelTarget, state as core } from '../../core/state.svelte';

  /** `el` set = content of a pinned inspector (fixed element, no frame, no hint). */
  let { el: fixed, pinned = false }: { el?: Element; pinned?: boolean } = $props();
  const el = $derived(fixed ?? panelTarget());

  let hintDone = $state(true);
  $effect(() => {
    if (pinned) return;
    void pinHintDone.getValue().then((v) => (hintDone = v));
    return pinHintDone.watch((v) => (hintDone = v));
  });
  const info = $derived.by(() => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const img = el instanceof HTMLImageElement ? el : null;
    const format = img?.src.split('.').pop()?.split('?')[0]?.toUpperCase() ?? '';
    return {
      groups: inspectGroups(s, renderedFont(el), core.colorFormat),
      contrast: contrastOf(el, s),
      img: img && {
        natural:
          img.naturalWidth && img.naturalHeight ? `${img.naturalWidth} × ${img.naturalHeight}` : '',
        format: format.length <= 4 ? format : '',
        src: img.src,
      },
    };
  });

  let size = $state<string | null>(null);
  $effect(() => {
    const src = info?.img?.src;
    size = null;
    if (src) void fileSize(src).then((v) => src === info?.img?.src && (size = v));
  });

  let copied = $state(false);
  let timer = 0;
  async function copy() {
    if (!el || !(await copyText(cssSnippet(el, getComputedStyle(el), core.colorFormat)))) return;
    copied = true;
    clearTimeout(timer);
    timer = window.setTimeout(() => (copied = false), 1200);
  }
  $effect(() => () => clearTimeout(timer));
</script>

{#snippet row(name: string, value: string, swatch = false)}
  <div class="flex justify-between gap-3 py-px">
    <span class="text-fg-muted">{name}:</span>
    <span class="flex min-w-0 items-center gap-1 font-mono">
      {#if swatch}<span
          class="size-2.5 shrink-0 rounded-[3px] border border-line"
          style:background={value}
        ></span>{/if}
      <!-- an unparsed colour (not HEX) wraps in full instead of being cut -->
      <span class={swatch && !value.startsWith('#') ? 'text-[10px] break-all' : 'truncate'}
        >{value}</span
      >
    </span>
  </div>
{/snippet}

{#if info}
  <div
    class={pinned
      ? 'flex flex-col gap-2 px-3 pb-3'
      : 'flex max-h-[inherit] w-65 flex-col gap-2 overflow-y-auto rounded-panel border border-line bg-surface p-3 font-sans text-[11px] text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface'}
  >
    <button
      type="button"
      class="flex items-center gap-1 self-end rounded-btn px-2 py-1 hover:bg-line"
      onclick={copy}
    >
      <Copy size={13} />{i18n.t(copied ? 'inspect.copied' : 'inspect.copyCss')}
    </button>
    {#each info.groups as g (g.label)}
      <section>
        <div class="mb-1 font-semibold">{i18n.t(g.label)}</div>
        {#each g.rows as [p, v] (p)}{@render row(p, v, p.includes('color'))}{/each}
      </section>
    {/each}
    {#if info.contrast}
      {@const c = info.contrast}
      <section>
        <div class="mb-1 font-semibold">{i18n.t('inspect.accessibility')}</div>
        <div class="flex items-center justify-between gap-3">
          <span class="text-fg-muted">{i18n.t('inspect.contrast')}:</span>
          <span class="flex items-center gap-2 font-mono">
            <span
              class="rounded-sm border border-line px-1"
              style:background={c.bg}
              style:color={c.fg}>Aa</span
            >
            {c.ratio}
            <span class={c.level === 'fail' ? 'text-red-400' : 'text-green-400'}>
              {c.level === 'fail' ? 'AA' : c.level}
            </span>
          </span>
        </div>
      </section>
    {/if}
    {#if info.img}
      <section>
        <div class="mb-1 font-semibold">{i18n.t('inspect.image')}</div>
        {#if info.img.natural}{@render row(i18n.t('inspect.natural'), info.img.natural)}{/if}
        {#if size}{@render row(i18n.t('inspect.fileSize'), size)}{/if}
        {#if info.img.format}{@render row(i18n.t('inspect.format'), info.img.format)}{/if}
      </section>
    {/if}
    {#if !pinned && !hintDone}
      <div class="flex items-center gap-1 border-t border-line pt-2 text-fg-muted">
        <Info size={13} />{i18n.t('inspect.pinHint')}
      </div>
    {/if}
  </div>
{/if}
