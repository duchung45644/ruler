<script lang="ts">
  import { t } from '../lang.svelte';
  /** Render "Ctrl+Shift+F" and lone digits in the step text as keycaps. */
  const parts = (s: string) => s.split(/(Alt\+Shift\+S|\b[0-9]\b)/g);
  const isKey = (s: string) => /^(Alt\+Shift\+S|[0-9])$/.test(s);
</script>

<!-- how -->
<section id="how" class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
  <p class="font-mono text-sm text-accent-fg">{t().more.stepsEyebrow}</p>
  <h2 class="mt-3 text-3xl font-semibold tracking-tight text-strong sm:text-5xl">{t().how.title}</h2>
  <ol class="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
    <div class="absolute top-5 right-[16%] left-[16%] hidden border-t border-dashed border-line-strong md:block" aria-hidden="true"></div>
    {#each t().how.steps as [title, body], i (title)}
      <li class="relative">
        <span class="relative flex size-10 items-center justify-center rounded-xl border border-line-strong bg-page font-mono text-sm font-semibold text-strong">0{i + 1}</span>
        <h3 class="mt-5 text-lg font-semibold text-strong">{title}</h3>
        <p class="mt-2 leading-relaxed text-muted">
          {#each parts(body) as part, j (j)}
            {#if isKey(part)}<kbd class="mx-0.5 rounded-md border border-b-2 border-line-strong bg-surface px-1.5 py-0.5 font-mono text-xs whitespace-nowrap text-strong">{part}</kbd>{:else}{part}{/if}
          {/each}
        </p>
      </li>
    {/each}
  </ol>
</section>
