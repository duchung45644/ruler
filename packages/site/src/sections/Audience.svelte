<script lang="ts">
  import Code from '@lucide/svelte/icons/code';
  import Palette from '@lucide/svelte/icons/palette';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import { t } from '../lang.svelte';
  const AUDIENCE_ICONS = [Palette, Code, ShieldCheck, Sparkles];
</script>

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
