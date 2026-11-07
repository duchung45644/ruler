<script lang="ts">
  import { i18n } from '#i18n';

  // Full-screen cover (frozen screen + loading bar), port of showCover (fullpage.js:41).
  let { snap }: { snap: string } = $props();
</script>

<div class="absolute inset-0 bg-black font-sans">
  {#if snap}
    <img src={snap} alt="" class="absolute inset-0 h-full w-full brightness-[.55]" />
  {/if}
  <div
    class="absolute top-1/2 left-1/2 w-65 -translate-1/2 rounded-panel border border-line bg-surface px-4 py-3.5 text-[13px] font-medium text-fg shadow-[0_8px_24px_rgba(0,0,0,.3)]"
  >
    {i18n.t('capture.fullPageBusy')}
    <div class="mt-2.5 h-1 overflow-hidden rounded-xs bg-line">
      <i class="load block h-full w-[40%] rounded-xs bg-accent"></i>
    </div>
  </div>
</div>

<style>
  .load {
    animation: bd-load 1s ease-in-out infinite;
  }
  @keyframes bd-load {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(250%);
    }
  }
</style>
