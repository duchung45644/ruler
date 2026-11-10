<script lang="ts">
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import { i18n } from '#i18n';
  import { requestHostGrant } from './blocked';
  import { startResize, type Edge } from './frame';
  import FrameHeader from './FrameHeader.svelte';
  import Toolbar from './Toolbar.svelte';
  import { bezelFor } from '../../lib/responsive/devices';
  import {
    attachFrame,
    hideSyncOffToast,
    resizeFrame,
    shell,
    type ShellFrame,
  } from './shell.svelte';

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
      shell.zoom,
    );
  }

  /** `{br}` → line break, `{grant}` → the link (strings kept verbatim from legacy). */
  const lines = (key: 'responsive.frameBlockedBody' | 'responsive.frameBlockedStill') =>
    i18n
      .t(key, { br: '\u0001', grant: '\u0002' })
      .split('\u0001')
      .map((l) => l.split('\u0002'));

  /** Unscaled size of the frames row: the outer box is that × zoom so the canvas scrolls right. */
  let size = $state({ width: 0, height: 0 });
  function measure(node: HTMLElement) {
    const read = () => (size = { width: node.offsetWidth, height: node.offsetHeight });
    read();
    if (typeof ResizeObserver === 'undefined') return {};
    const ro = new ResizeObserver(read);
    ro.observe(node);
    return { destroy: () => ro.disconnect() };
  }
</script>

<!-- Full-screen canvas over the page (Q2), toolbar on top (8.11). -->
<div
  data-responsive-shell
  class="pointer-events-auto fixed inset-0 overflow-auto bg-zinc-300 font-sans text-[12px] text-fg [background-image:radial-gradient(rgba(0,0,0,.18)_1px,transparent_1px)] [background-size:16px_16px]"
  class:select-none={shell.dragging}
>
  <Toolbar />
  <div
    data-frames-box
    class="relative mt-16 mb-10 overflow-hidden"
    style:width={size.width ? `${size.width * shell.zoom}px` : null}
    style:height={size.height ? `${size.height * shell.zoom}px` : null}
  >
    <div
      data-frames
      use:measure
      class="flex items-start gap-6 pr-8 pb-10 pl-4"
      class:w-max={!shell.framesWrap}
      class:flex-wrap={shell.framesWrap}
      style:width={shell.framesWrap ? `calc((100vw - 2rem) / ${shell.zoom})` : null}
      style:transform="scale({shell.zoom})"
      style:transform-origin="top left"
    >
      {#each stable as f (f.vp.id)}
        {@const index = shell.frames.indexOf(f)}
        {@const bezel = bezelFor(f.vp.device)}
        {@const land = f.vp.width > f.vp.height}
        <div data-frame={f.vp.id} class="relative shrink-0" style:order={index}>
          <FrameHeader {f} first={index === 0} last={index === shell.frames.length - 1} />
          <div class="relative">
            <div
              data-bezel={bezel}
              data-landscape={land || null}
              class={bezel
                ? [
                    'bg-zinc-950 shadow-[0_8px_32px_rgba(0,0,0,.45),inset_0_0_0_2px_#3f3f46]',
                    bezel === 'home'
                      ? land
                        ? 'rounded-[44px] px-16 py-3'
                        : 'rounded-[44px] px-3 py-16'
                      : bezel === 'tablet'
                        ? 'rounded-[28px] p-5'
                        : 'rounded-[52px] p-3',
                  ].join(' ')
                : null}
            >
              <div
                class="relative overflow-hidden"
                class:rounded-[40px]={bezel === 'island' || bezel === 'notch' || bezel === 'punch'}
                class:rounded-[10px]={bezel === 'tablet'}
              >
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
                  class="block border-0 bg-white"
                  class:shadow-[0_4px_16px_rgba(0,0,0,.25)]={!bezel}
                ></iframe>
                {#if bezel === 'island'}
                  <div
                    aria-hidden="true"
                    class="pointer-events-none absolute rounded-full bg-black {land
                      ? 'top-1/2 left-[11px] h-[122px] w-[34px] -translate-y-1/2'
                      : 'top-[11px] left-1/2 h-[34px] w-[122px] -translate-x-1/2'}"
                  ></div>
                {:else if bezel === 'notch'}
                  <div
                    aria-hidden="true"
                    class="pointer-events-none absolute bg-zinc-950 {land
                      ? 'top-1/2 left-0 h-[160px] w-[30px] -translate-y-1/2 rounded-r-[20px]'
                      : 'top-0 left-1/2 h-[30px] w-[160px] -translate-x-1/2 rounded-b-[20px]'}"
                  ></div>
                {:else if bezel === 'punch'}
                  <div
                    aria-hidden="true"
                    class="pointer-events-none absolute size-[14px] rounded-full bg-black ring-2 ring-zinc-800 {land
                      ? 'top-1/2 left-[12px] -translate-y-1/2'
                      : 'top-[12px] left-1/2 -translate-x-1/2'}"
                  ></div>
                {/if}
                {#if f.loading}
                  <div
                    data-frame-loading
                    class="absolute inset-0 grid place-items-center bg-zinc-900/60 text-sm text-zinc-200"
                  >
                    {#if f.blocked}
                      <p data-frame-blocked={f.blocked} class="max-w-[80%] text-center">
                        {#each lines(f.blocked === 'still' ? 'responsive.frameBlockedStill' : 'responsive.frameBlockedBody') as parts, i (i)}
                          {#if i}<br />{/if}
                          {#each parts as part, j (j)}
                            {#if j}<button
                                type="button"
                                data-action="grant-host"
                                class="font-medium text-accent hover:underline"
                                onclick={() => void requestHostGrant()}
                                >{i18n.t('responsive.frameBlockedGrant')}</button
                              >{/if}{part}
                          {/each}
                        {/each}
                      </p>
                    {:else if f.timedOut}
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
              </div>
              {#if bezel === 'home'}
                <div
                  aria-hidden="true"
                  class="pointer-events-none absolute rounded-full bg-zinc-800 {land
                    ? 'top-1/2 left-7 h-14 w-1.5 -translate-y-1/2'
                    : 'top-7 left-1/2 h-1.5 w-14 -translate-x-1/2'}"
                ></div>
                <div
                  aria-hidden="true"
                  class="pointer-events-none absolute size-11 rounded-full ring-2 ring-zinc-700 {land
                    ? 'top-1/2 right-2.5 -translate-y-1/2'
                    : 'bottom-2.5 left-1/2 -translate-x-1/2'}"
                ></div>
              {/if}
            </div>
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
              class="absolute -right-2 -bottom-2 size-3 cursor-nwse-resize rounded-sm bg-black/25 hover:bg-accent"
              onpointerdown={(e) => grab(e, f, 'corner')}
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  {#if shell.syncOffToast}
    <div
      data-sync-off-toast
      data-responsive-chrome
      role="status"
      aria-live="polite"
      class="fixed top-16 left-1/2 flex max-w-110 -translate-x-1/2 items-center gap-3 rounded-xl bg-zinc-900/90 px-3.5 py-2 text-[13px] text-white shadow-xl backdrop-blur-surface"
    >
      <span>{i18n.t('responsive.toastScrollSyncOff')}</span>
      <button
        type="button"
        data-action="dismiss-toast"
        class="shrink-0 rounded-md px-2 py-0.5 font-medium text-accent hover:bg-white/10"
        onclick={hideSyncOffToast}>{i18n.t('responsive.dismiss')}</button
      >
    </div>
  {/if}
</div>
