<script lang="ts">
  import { t } from '../lang.svelte';
</script>

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
