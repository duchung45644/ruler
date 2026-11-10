<script lang="ts">
  import type { Component } from 'svelte';
  import Accessibility from '@lucide/svelte/icons/accessibility';
  import Bot from '@lucide/svelte/icons/bot';
  import Camera from '@lucide/svelte/icons/camera';
  import Check from '@lucide/svelte/icons/check';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import Code from '@lucide/svelte/icons/code';
  import LayoutGrid from '@lucide/svelte/icons/layout-grid';
  import Minus from '@lucide/svelte/icons/minus';
  import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
  import MousePointerClick from '@lucide/svelte/icons/mouse-pointer-click';
  import Palette from '@lucide/svelte/icons/palette';
  import PenLine from '@lucide/svelte/icons/pen-line';
  import Ruler from '@lucide/svelte/icons/ruler';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import { EDGE_URL, EXTENSION_ID, REPO_URL, SHOWCASE_IMAGES } from './i18n';
  import { t } from './lang.svelte';

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
  const AUDIENCE_ICONS = [Palette, Code, ShieldCheck, Sparkles];
  /** Rows without their own screenshot borrow a related one. */
  const FALLBACK_SHOT: Record<string, string> = { edit: 'shot-inspect', quality: 'shot-more' };
  const shotOf = (id: string) => SHOWCASE_IMAGES[id] ?? FALLBACK_SHOT[id];
  const isYes = (v: string) => v === 'Yes' || v === 'Có';
  const isNo = (v: string) => v === 'No' || v === 'Không';
</script>

<Header />

<main>
  <!-- hero -->
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-x-0 -top-40 h-144 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.28),transparent_65%)]"
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
        class="mx-auto mt-8 size-20 drop-shadow-[0_8px_30px_rgba(99,102,241,0.45)]"
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
            class="rounded-xl bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400"
            >{t().hero.cta}</a
          >
        {:else}
          <span
            class="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-6 py-3 font-medium text-accent-fg-strong"
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

  <!-- stats -->
  <section class="border-y border-line-soft bg-band">
    <dl class="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
      {#each t().stats as [value, label] (value)}
        <div class="px-2 py-8 text-center">
          <dt class="text-3xl font-semibold tracking-tight text-strong">{value}</dt>
          <dd class="mt-1 text-sm text-muted">{label}</dd>
        </div>
      {/each}
    </dl>
  </section>

  <!-- how -->
  <section id="how" class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
    <h2 class="text-3xl font-semibold tracking-tight text-strong sm:text-4xl">{t().how.title}</h2>
    <ol class="mt-10 grid gap-6 md:grid-cols-3">
      {#each t().how.steps as [title, body], i (title)}
        <li class="rounded-2xl border border-line p-6">
          <span
            class="flex size-9 items-center justify-center rounded-full bg-accent font-mono text-sm font-semibold text-white"
            >{i + 1}</span
          >
          <h3 class="mt-5 font-medium text-strong">{title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </li>
      {/each}
    </ol>
  </section>

  <!-- showcase -->
  <section id="features" class="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
    <h2
      class="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-strong sm:text-4xl"
    >
      {t().showcase.title}
    </h2>
    <p class="mt-4 max-w-2xl text-muted">{t().showcase.lead}</p>
    <div class="mt-16 space-y-24">
      {#each t().showcase.rows as row, i (row.id)}
        {@const Icon = ROW_ICONS[row.id]}
        <article class="grid items-center gap-10 lg:grid-cols-2">
          <div class={i % 2 ? 'lg:order-2' : ''}>
            <div
              class="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-accent-fg"
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
        </article>
      {/each}
    </div>
  </section>

  <!-- audience -->
  <section class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
    <h2 class="text-3xl font-semibold tracking-tight text-strong sm:text-4xl">
      {t().audience.title}
    </h2>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each t().audience.items as [title, body], i (title)}
        {@const Icon = AUDIENCE_ICONS[i]}
        <div class="rounded-2xl border border-line p-6">
          <Icon size={22} class="text-accent-fg" />
          <h3 class="mt-4 font-medium text-strong">{title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- compare -->
  <section class="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
    <h2 class="text-3xl font-semibold tracking-tight text-strong sm:text-4xl">
      {t().compare.title}
    </h2>
    <div class="mt-10 overflow-x-auto rounded-2xl border border-line">
      <table class="w-full min-w-120 text-left text-sm">
        <thead class="bg-tint text-fg">
          <tr>
            {#each t().compare.head as h, i (i)}
              <th class="px-5 py-3 font-medium {i ? 'text-center' : ''}">{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-line-soft">
          {#each t().compare.rows as [feature, devtools, ours] (feature)}
            <tr>
              <td class="px-5 py-3 text-fg">{feature}</td>
              <td class="px-5 py-3 text-center text-subtle">
                {#if isNo(devtools)}
                  <Minus size={16} class="mx-auto" aria-label={devtools} />
                {:else}
                  {devtools}
                {/if}
              </td>
              <td class="px-5 py-3 text-center">
                {#if isYes(ours)}
                  <Check size={18} class="mx-auto text-ok" aria-label={ours} />
                {:else}
                  {ours}
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <!-- AI -->
  <section id="ai" class="border-y border-line-soft bg-band">
    <div class="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
      <div>
        <p class="flex items-center gap-2 text-sm font-medium text-accent-fg">
          <Bot size={16} />
          {t().ai.eyebrow}
        </p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-balance text-strong sm:text-4xl">
          {t().ai.title}
        </h2>
        <p class="mt-5 leading-relaxed text-muted">{t().ai.body}</p>
        <p class="mt-4 flex gap-3 text-sm leading-relaxed text-muted">
          <ShieldCheck size={18} class="mt-0.5 shrink-0 text-ok" />
          {t().ai.safe}
        </p>
        <ol class="mt-8 space-y-3">
          {#each t().ai.steps as step, i (step)}
            <li class="flex gap-3 text-sm text-fg">
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-xs"
                >{i + 1}</span
              >
              <span class="pt-0.5">{step}</span>
            </li>
          {/each}
        </ol>
      </div>
      <div class="min-w-0 space-y-6">
        <pre
          class="overflow-x-auto rounded-2xl border border-line bg-page p-6 font-mono text-[13px] leading-relaxed text-muted"><code
            ><span class="text-subtle">// .mcp.json</span>
&#123;
  <span class="text-accent-fg">"mcpServers"</span>: &#123;
    <span class="text-accent-fg">"PixelLens"</span>: &#123;
      <span class="text-accent-fg">"command"</span>: <span class="text-code-str">"node"</span>,
      <span class="text-accent-fg">"args"</span>: [
        <span class="text-code-str">"…/mcp-server/dist/cli.js"</span>,
        <span class="text-code-str">"--extension-id"</span>,
        <span class="text-code-str">"{EXTENSION_ID}"</span>
      ],
      <span class="text-accent-fg">"env"</span>: &#123; <span class="text-accent-fg"
              >"PIXELLENS_MCP_TOKEN"</span
            >: <span class="text-code-str">"…"</span> &#125;
    &#125;
  &#125;
&#125;</code
          ></pre>
        <div class="rounded-2xl border border-line p-6">
          <h3 class="font-medium text-strong">{t().ai.groupsTitle}</h3>
          <dl class="mt-4 space-y-3 text-sm">
            {#each t().ai.groups as [name, body] (name)}
              <div class="grid gap-1 sm:grid-cols-[8rem_1fr]">
                <dt class="font-medium text-fg">{name}</dt>
                <dd class="text-muted">{body}</dd>
              </div>
            {/each}
          </dl>
        </div>
      </div>
    </div>
  </section>

  <!-- keys -->
  <section id="keys" class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
    <h2 class="text-3xl font-semibold tracking-tight text-strong sm:text-4xl">{t().keys.title}</h2>
    <p class="mt-4 max-w-2xl text-muted">{t().keys.body}</p>
    <div class="mt-10 grid gap-8 lg:grid-cols-3">
      {#each t().keys.groups as group (group.name)}
        <div>
          <h3 class="text-sm font-medium tracking-wide text-subtle uppercase">{group.name}</h3>
          <ul class="mt-4 divide-y divide-line-soft rounded-2xl border border-line">
            {#each group.list as [key, label] (key)}
              <li class="flex items-center justify-between gap-4 px-4 py-2.5">
                <span class="text-sm text-fg">{label}</span>
                <span class="flex gap-1">
                  {#each key.split(' ') as k (k)}
                    <kbd
                      class="min-w-7 rounded-md border border-b-2 border-line-strong bg-surface px-1.5 py-0.5 text-center font-mono text-xs text-strong"
                      >{k}</kbd
                    >
                  {/each}
                </span>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </section>

  <!-- faq -->
  <section id="faq" class="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
    <h2 class="text-3xl font-semibold tracking-tight text-strong sm:text-4xl">{t().faq.title}</h2>
    <div class="mt-10 divide-y divide-line rounded-2xl border border-line">
      {#each t().faq.items as [q, a], i (q)}
        <details class="group px-6 py-4">
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fg [&::-webkit-details-marker]:hidden"
          >
            {q}
            <ChevronDown size={18} class="shrink-0 text-subtle transition group-open:rotate-180" />
          </summary>
          <p class="mt-3 text-sm leading-relaxed text-muted">
            {a}
            {#if i === t().faq.items.length - 1}
              <a class="text-accent-fg hover:text-accent-fg-strong" href="{REPO_URL}/issues"
                >github.com/duchung45644/ruler/issues</a
              >
            {/if}
          </p>
        </details>
      {/each}
    </div>
  </section>

  <!-- privacy -->
  <section class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
    <div
      class="flex flex-col gap-6 rounded-2xl border border-line bg-linear-to-br from-indigo-500/10 to-transparent p-8 sm:flex-row sm:items-center sm:p-10"
    >
      <div
        class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-accent-fg"
      >
        <ShieldCheck size={24} />
      </div>
      <div>
        <h2 class="text-xl font-semibold text-strong">{t().privacy.title}</h2>
        <p class="mt-2 max-w-2xl text-muted">{t().privacy.body}</p>
      </div>
      <a
        href="./privacy.html"
        class="shrink-0 text-sm font-medium text-accent-fg hover:text-accent-fg-strong sm:ml-auto"
        >{t().privacy.link} →</a
      >
    </div>
  </section>
</main>

<Footer />
