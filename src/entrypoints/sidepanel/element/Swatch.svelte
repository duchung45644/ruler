<script lang="ts">
  let { color, size = 'size-4' }: { color: string; size?: string } = $props();
</script>

<!-- checkerboard under the colour so translucent values read as such -->
<span
  class="{size} relative inline-block shrink-0 overflow-hidden rounded-[4px] border border-line-strong bg-[conic-gradient(#ccc_25%,#fff_0_50%,#ccc_0_75%,#fff_0)] bg-[length:6px_6px]"
>
  <span class="absolute inset-0" style:background={color}></span>
</span>
