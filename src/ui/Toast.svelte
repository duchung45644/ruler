<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<div
  data-toast
  role="status"
  aria-live="polite"
  class="pointer-events-none fixed top-[16px] left-1/2 max-w-[360px] -translate-x-1/2 rounded-[12px] bg-zinc-900/85 px-[14px] py-[8px] font-sans text-[13px] text-white shadow-xl backdrop-blur-surface"
>
  {text}
</div>
