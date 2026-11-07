<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<div
  data-toast
  role="status"
  aria-live="polite"
  class="pointer-events-none fixed top-4 left-1/2 max-w-90 -translate-x-1/2 rounded-xl bg-zinc-900/85 px-3.5 py-2 font-sans text-[13px] text-white shadow-xl backdrop-blur-surface"
>
  {text}
</div>
