<script lang="ts">
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import { i18n } from '#i18n';
  import { startResize, type Edge } from './frame';
  import FrameHeader from './FrameHeader.svelte';
  import { attachFrame, resizeFrame, shell, type ShellFrame } from './shell.svelte';

  const frame = (node: HTMLIFrameElement, id: number) => ({ destroy: attachFrame(node, id) });
  /** Stable DOM order (by id): moving an iframe node reloads it, so display order is CSS `order`. */
  const stable = $derived([...shell.frames].sort((a, b) => a.vp.id - b.vp.id));

  function grab(e: PointerEvent, f: ShellFrame, edge: Edge) {
    const id = f.vp.id;
    startResize(
      e,
      edge,
      f.vp,
      (s) => resizeFrame(id, s),
      (busy) => (shell.dragging = busy),
    );
  }
</script>

<!-- Full-screen canvas over the page (Q2); the toolbar comes in Task 8. -->
<div
  data-responsive-shell
  class="pointer-events-auto fixed inset-0 overflow-auto bg-zinc-800 font-sans text-[12px] text-fg [background-image:radial-gradient(rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:16px_16px]"
  class:select-none={shell.dragging}
>
  <div class="flex w-max items-start gap-6 px-6 pt-6 pb-24">
    {#each stable as f (f.vp.id)}
      {@const index = shell.frames.indexOf(f)}
      <div data-frame={f.vp.id} class="relative shrink-0" style:order={index}>
        <FrameHeader {f} first={index === 0} last={index === shell.frames.length - 1} />
        <div class="relative">
          <iframe
            use:frame={f.vp.id}
            title={f.vp.name || `${f.vp.width} × ${f.vp.height}`}
            name={f.name}
            src={shell.src}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            width={f.vp.width}
            height={f.vp.height}
            style:width="{f.vp.width}px"
            style:height="{f.vp.height}px"
            style:color-scheme={f.vp.scheme === 'system' ? null : f.vp.scheme}
            style:pointer-events={shell.dragging ? 'none' : null}
            class="block border-0 bg-white shadow-[0_4px_16px_rgba(0,0,0,.25)]"
          ></iframe>
          {#if f.loading}
            <div
              data-frame-loading
              class="absolute inset-0 grid place-items-center bg-zinc-900/60 text-sm text-zinc-200"
            >
              {#if f.timedOut}
                <p data-frame-timeout class="max-w-[80%] text-center">
                  {i18n.t('responsive.frameTimeout')}
                </p>
              {:else}
                <span class="flex items-center gap-2" role="status">
                  <LoaderCircle size={18} class="animate-spin" />
                  {i18n.t('responsive.loading')}
                </span>
              {/if}
            </div>
          {/if}
          <!-- Resize handles (8.13) -->
          <div
            data-handle="right"
            role="separator"
            aria-orientation="vertical"
            class="absolute top-0 -right-2 h-full w-2 cursor-ew-resize hover:bg-accent/40"
            onpointerdown={(e) => grab(e, f, 'right')}
          ></div>
          <div
            data-handle="bottom"
            role="separator"
            aria-orientation="horizontal"
            class="absolute -bottom-2 left-0 h-2 w-full cursor-ns-resize hover:bg-accent/40"
            onpointerdown={(e) => grab(e, f, 'bottom')}
          ></div>
          <div
            data-handle="corner"
            role="separator"
            class="absolute -right-2 -bottom-2 size-3 cursor-nwse-resize rounded-sm bg-white/30 hover:bg-accent"
            onpointerdown={(e) => grab(e, f, 'corner')}
          ></div>
        </div>
      </div>
    {/each}
  </div>
</div>
