<script lang="ts">
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import { EDGE_URL } from '../i18n';
  import { t } from '../lang.svelte';
</script>

<!-- faq -->
<section id="faq" class="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
  <div class="divide-y divide-line rounded-2xl border border-line">
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
            <a class="text-accent-fg hover:text-accent-fg-strong" href={EDGE_URL}
              >{t().faq.storeLink}</a
            >
          {/if}
        </p>
      </details>
    {/each}
  </div>
</section>
