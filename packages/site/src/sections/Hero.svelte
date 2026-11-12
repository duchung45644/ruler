<script lang="ts">
  import { CHROME_URL, EDGE_URL } from '../i18n';
  import { t } from '../lang.svelte';
  import BrowserIcon from '../BrowserIcon.svelte';
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

  /** Hero clips: each plays once, then the next one starts; a tab click jumps to that clip. */
  const CLIPS = ['inspect', 'measure', 'edit'];
  let clip = $state(0);
</script>

<!-- hero -->
<section class="relative overflow-hidden">
  <div
    class="pointer-events-none absolute inset-x-0 -top-40 h-144 bg-[radial-gradient(ellipse_at_center,var(--glow),transparent_65%)]"
  ></div>
  <div class="relative mx-auto max-w-6xl px-4 pt-10 pb-12 text-center sm:px-6 sm:pt-14">
    <img src="./logo.svg" alt="" class="mx-auto size-20 drop-shadow-[0_10px_24px_var(--shade)]" />
    <h1
      class="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-strong sm:text-6xl"
    >
      {t().hero.title}
    </h1>
    <p class="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted">{t().hero.lead}</p>
    <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      {#if browser === 'chrome' && CHROME_URL}
        <a
          href={CHROME_URL}
          class="inline-flex items-center gap-2.5 rounded-xl bg-accent px-6 py-3 font-medium text-white transition hover:bg-indigo-400"
          ><BrowserIcon name="chrome" />{t().hero.ctaChrome}</a
        >
      {:else if browser === 'chrome'}
        <span
          class="inline-flex items-center gap-2.5 rounded-xl border border-line bg-tint px-6 py-3 font-medium text-fg"
          ><BrowserIcon name="chrome" />{t().hero.chromeSoon}</span
        >
      {:else if EDGE_URL}
        <a
          href={EDGE_URL}
          class="inline-flex items-center gap-2.5 rounded-xl bg-accent px-6 py-3 font-medium text-white transition hover:bg-indigo-400"
          ><BrowserIcon name="edge" />{t().hero.cta}</a
        >
      {:else}
        <span
          class="inline-flex items-center gap-2.5 rounded-xl border border-line bg-tint px-6 py-3 font-medium text-fg"
          ><BrowserIcon name="edge" />{t().hero.soon}</span
        >
      {/if}
    </div>
    {#if browser === 'chrome' && EDGE_URL}
      <p class="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-muted">
        {t().hero.edgeAlt}
        <a
          class="inline-flex items-center gap-1.5 text-accent-fg hover:text-accent-fg-strong"
          href={EDGE_URL}><BrowserIcon name="edge" size={14} />{t().hero.edgeAltLink}</a
        >
      </p>
    {/if}
    <div class="mx-auto mt-10 max-w-5xl">
      <div
        class="relative aspect-video overflow-hidden rounded-xl border border-line bg-tint shadow-2xl shadow-shade"
      >
        {#key clip}
          <video
            src="./video/{CLIPS[clip]}.mp4"
            poster="./video/{CLIPS[clip]}.jpg"
            autoplay
            muted
            playsinline
            preload="auto"
            aria-label={t().hero.slides[clip]}
            class="absolute inset-0 h-full w-full"
            onended={() => (clip = (clip + 1) % CLIPS.length)}
          ></video>
        {/key}
      </div>
      <div class="mt-5 flex justify-center gap-1.5" role="tablist">
        {#each t().hero.slides as label, i (label)}
          <button
            type="button"
            role="tab"
            aria-selected={clip === i}
            class="rounded-full px-3.5 py-1.5 text-sm transition-colors {clip === i
              ? 'bg-tint-strong text-strong'
              : 'text-muted hover:text-fg'}"
            onclick={() => (clip = i)}>{label}</button
          >
        {/each}
      </div>
    </div>
  </div>
</section>
