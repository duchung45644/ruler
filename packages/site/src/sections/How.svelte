<script lang="ts">
  import { t } from '../lang.svelte';
</script>

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
