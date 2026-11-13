<script lang="ts">
  import { t } from '../lang.svelte';
</script>

<!-- stats: one ruled strip, numbers in mono like a read-out -->
<section class="mx-auto max-w-6xl px-4 sm:px-6">
  <dl class="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-band lg:grid-cols-4">
    {#each t().stats as [value, label], i (value)}
      <div class="px-6 py-7 {i % 2 ? 'border-l border-line-soft' : ''} {i > 1 ? 'border-t border-line-soft lg:border-t-0' : ''} {i === 2 ? 'lg:border-l' : ''}">
        <dt class="font-mono text-3xl font-semibold tracking-tight text-strong sm:text-4xl">{value}</dt>
        <dd class="mt-2 text-sm leading-snug text-muted">{label}</dd>
      </div>
    {/each}
  </dl>
</section>
