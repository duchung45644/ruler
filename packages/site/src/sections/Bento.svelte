<script lang="ts">
  import type { Component } from 'svelte';
  import Accessibility from '@lucide/svelte/icons/accessibility';
  import Camera from '@lucide/svelte/icons/camera';
  import LayoutGrid from '@lucide/svelte/icons/layout-grid';
  import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
  import MousePointerClick from '@lucide/svelte/icons/mouse-pointer-click';
  import Palette from '@lucide/svelte/icons/palette';
  import Play from '@lucide/svelte/icons/play';
  import PenLine from '@lucide/svelte/icons/pen-line';
  import Ruler from '@lucide/svelte/icons/ruler';
  import { SHOWCASE_IMAGES } from '../i18n';
  import { t } from '../lang.svelte';
  const ICONS: Record<string, Component> = { inspect: MousePointerClick, measure: Ruler, grid: LayoutGrid, edit: PenLine, responsive: MonitorSmartphone, styles: Palette, quality: Accessibility, palette: Camera };
  /** Big cards carry media (clip or screenshot); the rest are compact. */
  const BIG = ['inspect', 'measure', 'edit', 'responsive'];
  const VIDEOS = new Set(['inspect', 'measure', 'edit']);
  const SPAN: Record<string, string> = { inspect: 'lg:col-span-4', measure: 'lg:col-span-2', edit: 'lg:col-span-3', responsive: 'lg:col-span-3' };
  const WIDE = new Set(['inspect', 'edit', 'responsive']);
  /** Narrow cards crop the clip to the part where the action is. */
  const POS: Record<string, string> = { measure: 'lg:object-[70%_50%]' };
  const row = (id: string) => t().showcase.rows.find((r) => r.id === id)!;
  const small = $derived(t().showcase.rows.filter((r) => !BIG.includes(r.id)));
  /** Clips stay still on their poster; one plays only while its card is hovered (or tapped), then resets. */
  let playing = $state<string | null>(null);
  const clip = (card: HTMLElement) => {
    const v = card.querySelector('video');
    if (!v) return;
    const id = card.dataset.id!;
    const start = () => { playing = id; v.play().catch(() => {}); };
    const stop = () => { if (playing === id) playing = null; v.pause(); v.currentTime = 0; v.load(); };
    const tap = () => (v.paused ? start() : stop());
    card.addEventListener('mouseenter', start); card.addEventListener('mouseleave', stop); v.addEventListener('click', tap);
    return { destroy: () => { card.removeEventListener('mouseenter', start); card.removeEventListener('mouseleave', stop); v.removeEventListener('click', tap); } };
  };
</script>

<!-- features: bento grid -->
<section id="features" class="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
  <p class="font-mono text-sm text-accent-fg">{t().more.featuresEyebrow}</p>
  <h2 class="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance text-strong sm:text-5xl">{t().showcase.title}</h2>
  <p class="mt-5 max-w-2xl text-lg text-muted">{t().showcase.lead}</p>

  <div class="mt-12 grid gap-5 lg:grid-cols-6">
    {#each BIG as id (id)}
      {@const r = row(id)}
      {@const Icon = ICONS[id]}
      <article use:clip data-id={id} class="group flex flex-col overflow-hidden rounded-3xl border border-line bg-band transition hover:border-line-strong {SPAN[id]}">
        <div class="p-7 pb-6">
          <div class="flex items-center gap-3">
            <span class="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent-fg"><Icon size={18} /></span>
            <h3 class="text-xl font-semibold tracking-tight text-strong">{r.title}</h3>
          </div>
          <p class="mt-3 text-muted">{r.body}</p>
        </div>
        <div class="flex flex-1 px-7 lg:min-h-56">
          <div class="relative mt-auto w-full overflow-hidden rounded-t-xl border border-b-0 border-line shadow-xl shadow-shade {WIDE.has(id) ? '' : 'lg:h-full'}">
            {#if VIDEOS.has(id)}
              <video src="./video/{id}.mp4" poster="./video/{id}.jpg" muted loop playsinline preload="none" aria-label={r.title} width="1600" height="900"
                class="block w-full object-cover {WIDE.has(id) ? 'aspect-video' : 'aspect-video lg:aspect-auto lg:h-full ' + POS[id]}"></video>
              <span class="pointer-events-none absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-zinc-950/70 text-white backdrop-blur transition-opacity {playing === id ? 'opacity-0' : 'opacity-100'}" aria-hidden="true"><Play size={15} fill="currentColor" /></span>
            {:else}
              <img src="./img/{SHOWCASE_IMAGES[id]}.png" alt={t().shotAlt} width="1280" height="800" loading="lazy" class="block aspect-video w-full object-cover object-top" />
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </div>

  <h3 class="mt-16 text-sm font-medium tracking-wide text-subtle uppercase">{t().more.alsoTitle}</h3>
  <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {#each small as r (r.id)}
      {@const Icon = ICONS[r.id]}
      <article class="rounded-2xl border border-line p-6 transition hover:border-line-strong hover:bg-band">
        <span class="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent-fg"><Icon size={18} /></span>
        <h4 class="mt-4 font-semibold text-strong">{r.title}</h4>
        <p class="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>
      </article>
    {/each}
  </div>
  <a href="./features.html" class="mt-10 inline-flex rounded-xl border border-line px-5 py-2.5 font-medium text-fg transition hover:border-line-strong hover:bg-tint">{t().more.allFeatures} →</a>
</section>
