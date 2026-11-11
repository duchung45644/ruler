<script lang="ts">
  import { t } from '../lang.svelte';
</script>

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
