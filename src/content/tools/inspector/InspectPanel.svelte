<script module lang="ts">
  import {
    compositeBackground,
    contrastRatio,
    parseColor,
    toHex,
    wcagLevel,
    type BgLayer,
    type Rgba,
  } from '../../../lib/color';

  const TEXT =
    'h1 h2 h3 h4 h5 h6 p b i em strong u small mark code a label button td th blockquote pre sub sup del ins cite q'.split(
      ' ',
    );
  const BLOCK = 'li ul ol span div nav header footer section article'.split(' ');

  /** Port of isTextHeavy (:44290). */
  function isTextHeavy(el: Element): boolean {
    const text = (el as HTMLElement).innerText?.trim();
    if (!text) return false;
    const tag = el.tagName.toLowerCase();
    if (TEXT.includes(tag)) return true;
    const kids = [...el.children];
    if (BLOCK.includes(tag))
      return !kids.some((c) => [...TEXT, ...BLOCK].includes(c.tagName.toLowerCase()));
    return !kids.length;
  }

  /** Pseudo-element (with content) and own background layers of `n`, top → bottom. */
  function layersOf(n: Element): BgLayer[] {
    const out: BgLayer[] = [];
    for (const pseudo of ['::before', '::after']) {
      const ps = getComputedStyle(n, pseudo);
      if (ps.content !== 'none') out.push({ color: ps.backgroundColor, image: ps.backgroundImage });
    }
    const s = getComputedStyle(n);
    out.push({ color: s.backgroundColor, image: s.backgroundImage });
    return out;
  }

  /**
   * Port of findBackgroundColor (:43977): the target, then everything painted under its centre
   * (elementsFromPoint), skipping its descendants, our UI and invisible elements. Off-screen
   * centre falls back to the ancestor chain like legacy (:44010).
   */
  function backgroundOf(el: Element): Rgba | null {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const onScreen = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
    const under: Element[] = [];
    if (onScreen) under.push(...document.elementsFromPoint(x, y));
    else for (let n = el.parentElement; n; n = n.parentElement) under.push(n);
    const layers = layersOf(el);
    for (const n of under) {
      if (n === el || el.contains(n) || n.tagName.toLowerCase() === 'bo-doi-ui') continue;
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05)
        continue;
      layers.push(...layersOf(n));
    }
    return compositeBackground(layers);
  }

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
  import { panelTarget } from '../../core/state.svelte';

  const el = $derived(panelTarget());
  const info = $derived.by(() => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const img = el instanceof HTMLImageElement ? el : null;
    const format = img?.src.split('.').pop()?.split('?')[0]?.toUpperCase() ?? '';
    return {
      groups: inspectGroups(s, renderedFont(el)),
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
    if (!el || !(await copyText(cssSnippet(el, getComputedStyle(el))))) return;
    copied = true;
    clearTimeout(timer);
    timer = window.setTimeout(() => (copied = false), 1200);
  }
  $effect(() => () => clearTimeout(timer));
</script>

{#snippet row(name: string, value: string, swatch = false)}
  <div class="flex justify-between gap-3 py-[1px]">
    <span class="text-fg-muted">{name}:</span>
    <span class="flex min-w-0 items-center gap-1 font-mono">
      {#if swatch}<span
          class="size-[10px] shrink-0 rounded-[3px] border border-line"
          style:background={value}
        ></span>{/if}
      <span class="truncate">{value}</span>
    </span>
  </div>
{/snippet}

{#if info}
  <div
    class="flex max-h-[inherit] w-[260px] flex-col gap-2 overflow-y-auto rounded-panel border border-line bg-surface p-3 font-sans text-[11px] text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface"
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
              class="rounded-[4px] border border-line px-1"
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
  </div>
{/if}
