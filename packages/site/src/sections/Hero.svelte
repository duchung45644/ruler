<script lang="ts">
  import { EDGE_URL, REPO_URL } from '../i18n';
  import { t } from '../lang.svelte';
</script>

<!-- hero -->
<section class="relative overflow-hidden">
  <div
    class="pointer-events-none absolute inset-x-0 -top-40 h-144 bg-[radial-gradient(ellipse_at_center,var(--glow),transparent_65%)]"
  ></div>
  <div class="relative mx-auto max-w-6xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
    <span
      class="inline-flex items-center gap-2 rounded-full border border-line bg-tint px-3 py-1 text-xs text-fg"
    >
      <span class="size-1.5 rounded-full bg-ok"></span>
      {t().hero.badge}
    </span>
    <img
      src="./logo.svg"
      alt=""
      class="mx-auto mt-8 size-20 drop-shadow-[0_10px_24px_var(--shade)]"
    />
    <h1
      class="mx-auto mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-strong sm:text-6xl"
    >
      {t().hero.title}
    </h1>
    <p class="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted">{t().hero.lead}</p>
    <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
      {#if EDGE_URL}
        <a
          href={EDGE_URL}
          class="rounded-xl bg-accent px-6 py-3 font-medium text-white transition hover:bg-indigo-400"
          >{t().hero.cta}</a
        >
      {:else}
        <span class="rounded-xl border border-line bg-tint px-6 py-3 font-medium text-fg"
          >{t().hero.soon}</span
        >
      {/if}
      <a
        href={REPO_URL}
        class="rounded-xl border border-line px-6 py-3 font-medium text-fg transition hover:bg-tint"
        >{t().hero.source}</a
      >
    </div>
    <p class="mt-5 text-sm text-subtle">{t().hero.meta}</p>
    <img
      src="./img/hero.png"
      alt={t().shotAlt}
      width="1600"
      height="1000"
      class="mx-auto mt-14 block h-auto w-full max-w-5xl"
    />
  </div>
</section>
