<script lang="ts">
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import { t } from '../lang.svelte';
</script>

<!-- privacy -->
<section class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
  <div
    class="flex flex-col gap-6 rounded-2xl border border-line bg-band p-8 sm:flex-row sm:items-center sm:p-10"
  >
    <div
      class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-tint text-fg"
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
