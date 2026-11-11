<script lang="ts">
  import Bot from '@lucide/svelte/icons/bot';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import { t } from './lang.svelte';
  import Hero from './sections/Hero.svelte';
  import How from './sections/How.svelte';
  import PrivacyBand from './sections/PrivacyBand.svelte';
  import Showcase from './sections/Showcase.svelte';
  import Stats from './sections/Stats.svelte';
</script>

<Header />
<main>
  <Hero />
  <Stats />
  <How />
  <Showcase only={['inspect', 'measure', 'responsive']} />
  <div class="mx-auto max-w-6xl px-4 pt-4 pb-24 sm:px-6">
    <a
      href="./features.html"
      class="inline-flex rounded-xl border border-line px-5 py-2.5 font-medium text-fg transition hover:bg-tint"
      >{t().more.allFeatures} →</a
    >
  </div>

  <section class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
    <a
      href="./ai.html"
      class="group flex flex-col gap-6 rounded-2xl border border-line bg-band p-8 transition hover:border-line-strong sm:flex-row sm:items-center sm:p-10"
    >
      <div
        class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-tint text-fg"
      >
        <Bot size={24} />
      </div>
      <div>
        <h2 class="text-xl font-semibold text-strong">{t().ai.title}</h2>
        <p class="mt-2 max-w-2xl text-muted">{t().more.aiTeaser}</p>
      </div>
      <span class="shrink-0 text-sm font-medium text-accent-fg sm:ml-auto">{t().more.aiLink} →</span
      >
    </a>
  </section>

  <PrivacyBand />
</main>
<Footer />
