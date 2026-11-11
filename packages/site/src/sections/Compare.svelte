<script lang="ts">
  import Check from '@lucide/svelte/icons/check';
  import Minus from '@lucide/svelte/icons/minus';
  import { t } from '../lang.svelte';
  const isYes = (v: string) => v === 'Yes' || v === 'Có';
  const isNo = (v: string) => v === 'No' || v === 'Không';
</script>

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
