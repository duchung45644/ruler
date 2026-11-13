<script lang="ts">
  import { CHROME_URL, EDGE_URL } from './i18n';
  import { t } from './lang.svelte';
  import BrowserIcon from './BrowserIcon.svelte';
  /** Edge visitors get the Edge Add-ons button; Chrome (and other Chromium) visitors the Chrome one. */
  type Browser = 'edge' | 'chrome';
  const detect = (): Browser => {
    const nav = navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } };
    const brands = nav.userAgentData?.brands.map((b) => b.brand) ?? [];
    if (brands.includes('Microsoft Edge') || /\bEdg\//.test(navigator.userAgent)) return 'edge';
    if (brands.includes('Google Chrome') || /\bChrome\//.test(navigator.userAgent)) return 'chrome';
    return 'edge'; // Firefox, Safari…: Edge is the store that exists today
  };
  const browser: Browser = detect();
  /** alt: also show the "Using Edge?" line for Chrome visitors */
  let { alt = false }: { alt?: boolean } = $props();
  const live = 'inline-flex items-center gap-2.5 rounded-xl bg-accent px-6 py-3.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:bg-indigo-500';
  const soon = 'inline-flex items-center gap-2.5 rounded-xl border border-line bg-tint px-6 py-3.5 font-medium text-fg';
</script>

<div class="flex flex-col items-center gap-3">
  {#if browser === 'chrome' && CHROME_URL}
    <a href={CHROME_URL} class={live}><BrowserIcon name="chrome" />{t().hero.ctaChrome}</a>
  {:else if browser === 'chrome'}
    <span class={soon}><BrowserIcon name="chrome" />{t().hero.chromeSoon}</span>
  {:else if EDGE_URL}
    <a href={EDGE_URL} class={live}><BrowserIcon name="edge" />{t().hero.cta}</a>
  {:else}
    <span class={soon}><BrowserIcon name="edge" />{t().hero.soon}</span>
  {/if}
  {#if alt && browser === 'chrome' && EDGE_URL}
    <p class="flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-muted">
      {t().hero.edgeAlt}
      <a class="inline-flex items-center gap-1.5 text-accent-fg hover:text-accent-fg-strong" href={EDGE_URL}
        ><BrowserIcon name="edge" size={14} />{t().hero.edgeAltLink}</a
      >
    </p>
  {/if}
</div>
