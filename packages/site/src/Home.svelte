<script lang="ts">
  import Bot from '@lucide/svelte/icons/bot';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import InstallButton from './InstallButton.svelte';
  import { t } from './lang.svelte';
  import Bento from './sections/Bento.svelte';
  import Hero from './sections/Hero.svelte';
  import How from './sections/How.svelte';
  import Stats from './sections/Stats.svelte';
</script>

<Header />
<main>
  <Hero />
  <Stats />
  <Bento />
  <How />

  <!-- AI agents + privacy: two halves of one row -->
  <section class="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 lg:grid-cols-5">
    <a href="./ai.html" class="group relative overflow-hidden rounded-3xl border border-line bg-zinc-950 p-8 text-zinc-300 transition hover:border-line-strong sm:p-10 lg:col-span-3">
      <div class="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/25 blur-3xl"></div>
      <p class="relative flex items-center gap-2 font-mono text-sm text-indigo-300"><Bot size={16} />{t().ai.eyebrow}</p>
      <h2 class="relative mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t().ai.title}</h2>
      <p class="relative mt-3 max-w-xl text-zinc-400">{t().more.aiTeaser}</p>
      <ul class="relative mt-6 flex flex-wrap gap-2">
        {#each t().ai.groups as [name] (name)}
          <li class="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-zinc-300">{name}</li>
        {/each}
      </ul>
      <span class="relative mt-8 inline-block text-sm font-medium text-indigo-300 group-hover:text-indigo-200">{t().more.aiLink} →</span>
    </a>
    <a href="./privacy.html" class="group flex flex-col rounded-3xl border border-line bg-band p-8 transition hover:border-line-strong sm:p-10 lg:col-span-2">
      <span class="flex size-11 items-center justify-center rounded-xl bg-ok/10 text-ok"><ShieldCheck size={22} /></span>
      <h2 class="mt-5 text-2xl font-semibold tracking-tight text-strong">{t().privacy.title}</h2>
      <p class="mt-3 text-muted">{t().privacy.body}</p>
      <span class="mt-auto pt-8 text-sm font-medium text-accent-fg group-hover:text-accent-fg-strong">{t().privacy.link} →</span>
    </a>
  </section>

  <!-- closing call to action -->
  <section class="relative mt-24 overflow-hidden border-t border-line-soft">
    <div class="blueprint pointer-events-none absolute inset-0"></div>
    <div class="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <img src="./logo.svg" alt="" class="mx-auto size-16 drop-shadow-[0_10px_24px_var(--shade)]" />
      <h2 class="mt-7 text-3xl font-semibold tracking-tight text-balance text-strong sm:text-5xl">{t().more.ctaTitle}</h2>
      <p class="mx-auto mt-5 max-w-xl text-lg text-muted">{t().more.ctaBody}</p>
      <div class="mt-9 flex justify-center"><InstallButton alt /></div>
    </div>
  </section>
</main>
<Footer />
