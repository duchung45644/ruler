<script lang="ts">
  import { attachFrame, shell } from './shell.svelte';

  const frame = (node: HTMLIFrameElement) => ({ destroy: attachFrame(node) });
</script>

<!-- Full-screen canvas over the page (Q2); header / handles / toolbar come in Tasks 7–8. -->
<div
  data-responsive-shell
  class="pointer-events-auto fixed inset-0 overflow-auto bg-zinc-800 [background-image:radial-gradient(rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:16px_16px]"
>
  <div class="flex w-max items-start gap-6 px-6 pt-6 pb-24">
    {#each shell.frames as f (f.vp.id)}
      <iframe
        use:frame
        title={f.vp.name || `${f.vp.width} × ${f.vp.height}`}
        name={f.name}
        src={shell.src}
        width={f.vp.width}
        height={f.vp.height}
        style:width="{f.vp.width}px"
        style:height="{f.vp.height}px"
        class="shrink-0 border-0 bg-white shadow-[0_4px_16px_rgba(0,0,0,.25)]"
      ></iframe>
    {/each}
  </div>
</div>
