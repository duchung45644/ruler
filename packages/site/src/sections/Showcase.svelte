<script lang="ts">
  import type { Component } from 'svelte';
  import Accessibility from '@lucide/svelte/icons/accessibility';
  import Camera from '@lucide/svelte/icons/camera';
  import Check from '@lucide/svelte/icons/check';
  import LayoutGrid from '@lucide/svelte/icons/layout-grid';
  import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
  import MousePointerClick from '@lucide/svelte/icons/mouse-pointer-click';
  import Palette from '@lucide/svelte/icons/palette';
  import PenLine from '@lucide/svelte/icons/pen-line';
  import Ruler from '@lucide/svelte/icons/ruler';
  import { SHOWCASE_IMAGES } from '../i18n';
  import { t } from '../lang.svelte';
  let { only }: { only?: string[] } = $props();
  const ROW_ICONS: Record<string, Component> = {
    inspect: MousePointerClick,
    measure: Ruler,
    grid: LayoutGrid,
    edit: PenLine,
    responsive: MonitorSmartphone,
    styles: Palette,
    quality: Accessibility,
    palette: Camera,
  };
  /** Rows without their own screenshot borrow a related one. */
  const FALLBACK_SHOT: Record<string, string> = { edit: 'shot-inspect', quality: 'shot-more' };
  const shotOf = (id: string) => SHOWCASE_IMAGES[id] ?? FALLBACK_SHOT[id];
  /** Rows with a short looping clip (public/video/<id>.mp4 + <id>.jpg poster) instead of a still. */
  const VIDEOS = new Set(['inspect', 'measure', 'edit']);
</script>

<!-- showcase -->
<section id="features" class="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
  <h2 class="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-strong sm:text-4xl">
    {t().showcase.title}
  </h2>
  <p class="mt-4 max-w-2xl text-muted">{t().showcase.lead}</p>
  <div class="mt-16 space-y-24">
    {#each only ? t().showcase.rows.filter( (r) => only.includes(r.id) ) : t().showcase.rows as row, i (row.id)}
      {@const Icon = ROW_ICONS[row.id]}
      <article class="grid items-center gap-10 lg:grid-cols-2">
        <div class={i % 2 ? 'lg:order-2' : ''}>
          <div
            class="flex size-10 items-center justify-center rounded-lg border border-line bg-tint text-fg"
          >
            <Icon size={20} />
          </div>
          <h3 class="mt-4 text-2xl font-semibold tracking-tight text-strong">{row.title}</h3>
          <p class="mt-3 text-muted">{row.body}</p>
          <ul class="mt-6 space-y-3">
            {#each row.points as point (point)}
              <li class="flex gap-3 text-sm leading-relaxed text-fg">
                <Check size={18} class="mt-0.5 shrink-0 text-accent-fg" />
                {point}
              </li>
            {/each}
          </ul>
        </div>
        {#if VIDEOS.has(row.id)}
          <video
            src="./video/{row.id}.mp4"
            poster="./video/{row.id}.jpg"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            aria-label={row.title}
            width="1600"
            height="900"
            class="h-auto w-full rounded-xl border border-line shadow-2xl shadow-shade {i % 2
              ? 'lg:order-1'
              : ''}"
          ></video>
        {:else}
          <img
            src="./img/{shotOf(row.id)}.png"
            alt={t().shotAlt}
            width="1280"
            height="800"
            loading="lazy"
            class="h-auto w-full rounded-xl border border-line shadow-2xl shadow-shade {i % 2
              ? 'lg:order-1'
              : ''}"
          />
        {/if}
      </article>
    {/each}
  </div>
</section>
