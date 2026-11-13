<script lang="ts">
  import Check from '@lucide/svelte/icons/check';
  import { t } from '../lang.svelte';
  import InstallButton from '../InstallButton.svelte';

  /** Hero clips: each plays once, then the next one starts; a tab click jumps to that clip. */
  const CLIPS = ['inspect', 'measure', 'edit'];
  let clip = $state(0);
  let progress = $state(0);
  // live size of the highlighted phrase, shown in its inspector-style tag
  let bw = $state(0), bh = $state(0);
  /** The hero clip plays only while it is on screen. */
  const inView = (v: HTMLVideoElement) => {
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.15 });
    io.observe(v);
    return { destroy: () => io.disconnect() };
  };
  const go = (i: number) => { clip = i; progress = 0; };
</script>

<!-- hero -->
<section class="relative overflow-hidden">
  <div class="blueprint pointer-events-none absolute inset-0"></div>
  <div class="pointer-events-none absolute inset-x-0 -top-48 h-[36rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-accent)_16%,transparent),transparent_62%)]"></div>
  <div class="relative mx-auto max-w-6xl px-4 pt-14 pb-16 text-center sm:px-6 sm:pt-20">
    <p class="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-page/70 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur sm:text-sm">
      <img src="./logo.svg" alt="" class="size-4" />{t().hero.eyebrow}
    </p>
    <h1 class="mx-auto mt-7 max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-strong sm:text-6xl lg:text-7xl">
      <span class="block">{t().hero.titleParts[0]}</span>
      <span class="mt-[0.42em] mb-[0.12em] block">
        <span class="inspected" bind:clientWidth={bw} bind:clientHeight={bh}>
          {t().hero.titleParts[1]}
          <i class="-top-1 -left-1"></i><i class="-top-1 -right-1"></i><i class="-bottom-1 -left-1"></i><i class="-right-1 -bottom-1"></i>
          <span class="absolute -top-6 left-0 rounded-md bg-accent px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium tracking-normal whitespace-nowrap text-white" aria-hidden="true">h1 · {bw} × {bh}</span>
        </span>
      </span>
      <span class="block">{t().hero.titleParts[2]}</span>
    </h1>
    <p class="mx-auto mt-7 max-w-2xl text-lg text-pretty text-muted sm:text-xl">{t().hero.lead}</p>
    <div class="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start">
      <InstallButton alt />
      <a href="./features.html" class="inline-flex items-center rounded-xl border border-line bg-page/60 px-6 py-3.5 font-medium text-fg backdrop-blur transition hover:border-line-strong hover:bg-tint">{t().more.allFeatures} →</a>
    </div>
    <ul class="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
      {#each t().hero.trust as item (item)}
        <li class="inline-flex items-center gap-1.5"><Check size={15} class="text-ok" />{item}</li>
      {/each}
    </ul>

    <div class="mx-auto mt-14 max-w-5xl">
      <!-- browser-style frame; the tabs double as a progress indicator -->
      <div class="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl ring-1 shadow-shade ring-line-soft">
        <div class="flex items-center gap-3 border-b border-line-soft px-4 py-2.5">
          <span class="hidden gap-1.5 sm:flex" aria-hidden="true">
            <i class="size-2.5 rounded-full bg-tint-strong"></i><i class="size-2.5 rounded-full bg-tint-strong"></i><i class="size-2.5 rounded-full bg-tint-strong"></i>
          </span>
          <div class="mx-auto flex gap-1" role="tablist">
            {#each t().hero.slides as label, i (label)}
              <button type="button" role="tab" aria-selected={clip === i}
                class="relative overflow-hidden rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors {clip === i ? 'bg-page text-strong shadow-sm' : 'text-muted hover:text-fg'}"
                onclick={() => go(i)}>
                {label}
                {#if clip === i}
                  <span class="absolute bottom-0 left-0 h-0.5 bg-accent" style="width:{progress * 100}%"></span>
                {/if}
              </button>
            {/each}
          </div>
          <span class="hidden w-[46px] sm:block"></span>
        </div>
        <div class="relative aspect-video bg-tint">
          {#key clip}
            <video use:inView src="./video/{CLIPS[clip]}.mp4" poster="./video/{CLIPS[clip]}.jpg" autoplay muted playsinline preload="auto"
              aria-label={t().hero.slides[clip]} class="absolute inset-0 h-full w-full"
              ontimeupdate={(e) => { const v = e.currentTarget; progress = v.duration ? v.currentTime / v.duration : 0; }}
              onended={() => go((clip + 1) % CLIPS.length)}></video>
          {/key}
        </div>
      </div>
    </div>
  </div>
</section>
