<script lang="ts">
  let { title, lead }: { title: string; lead: string } = $props();
</script>

<section class="border-b border-line-soft bg-band">
  <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
    <h1 class="text-4xl font-semibold tracking-tight text-balance text-strong sm:text-5xl">
      {title}
    </h1>
    <p class="mt-4 max-w-2xl text-lg text-muted">{lead}</p>
  </div>
</section>
