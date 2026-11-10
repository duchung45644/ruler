<script lang="ts">
  import type { Component } from 'svelte';
  import Accessibility from '@lucide/svelte/icons/accessibility';
  import Bot from '@lucide/svelte/icons/bot';
  import Camera from '@lucide/svelte/icons/camera';
  import Check from '@lucide/svelte/icons/check';
  import ClipboardCopy from '@lucide/svelte/icons/clipboard-copy';
  import Gauge from '@lucide/svelte/icons/gauge';
  import Layers from '@lucide/svelte/icons/layers';
  import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
  import MousePointerClick from '@lucide/svelte/icons/mouse-pointer-click';
  import PenLine from '@lucide/svelte/icons/pen-line';
  import Ruler from '@lucide/svelte/icons/ruler';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import { EDGE_URL, REPO_URL } from './i18n';
  import { t } from './lang.svelte';

  const ICONS: Record<string, Component> = {
    inspect: MousePointerClick,
    measure: Ruler,
    edit: PenLine,
    export: ClipboardCopy,
    responsive: MonitorSmartphone,
    compare: Layers,
    a11y: Accessibility,
    vitals: Gauge,
    capture: Camera,
  };

  /** Real screenshots, shown when present in public/img. */
  const SHOTS = [
    'shot-responsive',
    'shot-ruler',
    'shot-grid',
    'shot-palette',
    'shot-colors',
    'shot-more',
  ];
</script>

<Header />

<main>
  <!-- hero -->
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-x-0 -top-40 h-[36rem] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.28),transparent_65%)]"
    ></div>
    <div class="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
      <img
        src="./logo.svg"
        alt=""
        class="mx-auto size-20 drop-shadow-[0_8px_30px_rgba(99,102,241,0.45)]"
      />
      <h1
        class="mx-auto mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl"
      >
        {t().hero.title}
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-lg text-pretty text-zinc-400">{t().hero.lead}</p>
      <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {#if EDGE_URL}
          <a
            href={EDGE_URL}
            class="rounded-xl bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400"
            >{t().hero.cta}</a
          >
        {:else}
          <span
            class="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-6 py-3 font-medium text-indigo-200"
            >{t().hero.soon}</span
          >
        {/if}
        <a
          href={REPO_URL}
          class="rounded-xl border border-white/10 px-6 py-3 font-medium text-zinc-200 transition hover:bg-white/5"
          >{t().hero.source}</a
        >
      </div>
      <p class="mt-5 text-sm text-zinc-500">{t().hero.meta}</p>

      <div class="mx-auto mt-14 max-w-5xl">
        <img
          src="./img/hero.png"
          alt="PixelLens inspecting a web page"
          width="1600"
          height="1000"
          class="block h-auto w-full"
        />
      </div>
    </div>
  </section>

  <!-- features -->
  <section id="features" class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
    <h2 class="max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
      {t().features.title}
    </h2>
    <div
      class="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3"
    >
      {#each t().features.items as [id, title, body] (id)}
        {@const Icon = ICONS[id]}
        <div class="bg-zinc-950 p-6">
          <div
            class="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300"
          >
            <Icon size={20} />
          </div>
          <h3 class="mt-4 font-medium text-white">{title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
        </div>
      {/each}
    </div>

    <div class="mt-16 grid gap-6 md:grid-cols-2">
      {#each SHOTS as name (name)}
        <img
          src="./img/{name}.png"
          alt=""
          width="1280"
          height="800"
          loading="lazy"
          class="h-auto w-full rounded-xl border border-white/10"
          onerror={(e) => (e.currentTarget as HTMLElement).remove()}
        />
      {/each}
    </div>
  </section>

  <!-- AI -->
  <section id="ai" class="border-y border-white/5 bg-zinc-900/40">
    <div class="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
      <div>
        <p class="flex items-center gap-2 text-sm font-medium text-indigo-300">
          <Bot size={16} />
          {t().ai.eyebrow}
        </p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
          {t().ai.title}
        </h2>
        <p class="mt-5 leading-relaxed text-zinc-400">{t().ai.body}</p>
        <ul class="mt-8 space-y-3">
          {#each t().ai.points as point (point)}
            <li class="flex items-center gap-3 text-zinc-300">
              <Check size={18} class="shrink-0 text-indigo-300" />
              {point}
            </li>
          {/each}
        </ul>
      </div>
      <pre
        class="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 font-mono text-[13px] leading-relaxed text-zinc-400"><code
          ><span class="text-zinc-500">// .mcp.json</span>
&#123;
  <span class="text-indigo-300">"mcpServers"</span>: &#123;
    <span class="text-indigo-300">"PixelLens"</span>: &#123;
      <span class="text-indigo-300">"command"</span>: <span class="text-emerald-300">"node"</span>,
      <span class="text-indigo-300">"args"</span>: [<span class="text-emerald-300"
            >"…/mcp-server/dist/cli.js"</span
          >,
               <span class="text-emerald-300">"--extension-id"</span>, <span
            class="text-emerald-300">"bkgdfebicmlicjnkgbemlidlnpbnaofh"</span
          >],
      <span class="text-indigo-300">"env"</span>: &#123; <span class="text-indigo-300"
            >"PIXELLENS_MCP_TOKEN"</span
          >: <span class="text-emerald-300">"…"</span> &#125;
    &#125;
  &#125;
&#125;</code
        ></pre>
    </div>
  </section>

  <!-- keys -->
  <section id="keys" class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
    <h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t().keys.title}</h2>
    <p class="mt-4 text-zinc-400">{t().keys.body}</p>
    <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {#each t().keys.list as [key, label] (key)}
        <div class="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
          <kbd
            class="min-w-8 rounded-md border border-white/15 border-b-2 bg-zinc-900 px-2 py-0.5 text-center font-mono text-sm text-white"
            >{key}</kbd
          >
          <span class="text-sm text-zinc-300">{label}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- privacy -->
  <section class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
    <div
      class="flex flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-transparent p-8 sm:flex-row sm:items-center sm:p-10"
    >
      <div
        class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300"
      >
        <ShieldCheck size={24} />
      </div>
      <div>
        <h2 class="text-xl font-semibold text-white">{t().privacy.title}</h2>
        <p class="mt-2 max-w-2xl text-zinc-400">{t().privacy.body}</p>
      </div>
      <a
        href="./privacy.html"
        class="shrink-0 text-sm font-medium text-indigo-300 hover:text-indigo-200 sm:ml-auto"
        >{t().privacy.link} →</a
      >
    </div>
  </section>
</main>

<Footer />
