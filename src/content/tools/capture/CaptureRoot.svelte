<script lang="ts">
  import { i18n } from '#i18n';
  import Copy from '@lucide/svelte/icons/copy';
  import Download from '@lucide/svelte/icons/download';
  import Monitor from '@lucide/svelte/icons/monitor';
  import MousePointer2 from '@lucide/svelte/icons/mouse-pointer-2';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Scan from '@lucide/svelte/icons/scan';
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import X from '@lucide/svelte/icons/x';
  import { placeSelBar } from '../../../lib/capture';
  import { state as app } from '../../core/state.svelte';
  import CapButton from './CapButton.svelte';
  import EditorView from './EditorView.svelte';
  import { startAreaSelect } from './area';
  import { openCaptureEditor } from './editor';
  import { captureFullPage } from './fullpage';
  import { capAction, closeCapture, copyCanvas, saveCanvas } from './session';
  import { cap } from './state.svelte';

  // Mode bar (at the bottom, near the dock the user just clicked) + area bar, port of openCaptureBar / startAreaSelect (capture.js:184, :204).
  let areaRoot: HTMLElement;
  let selBar: HTMLElement | undefined = $state();
  let crop: (() => Promise<HTMLCanvasElement>) | null = null;
  let copyLabel: string | null = $state(null);
  let saveLabel: string | null = $state(null);
  let busy = $state(false);
  let pos = $state({ top: 0, left: 0 });

  $effect(() => {
    const ac = new AbortController();
    crop = startAreaSelect(
      areaRoot,
      cap.snap,
      ac.signal,
      () => (cap.modeBar = false),
      (r) => (cap.sel = r),
    );
    return () => ac.abort();
  });
  $effect(() => {
    if (cap.sel && selBar)
      pos = placeSelBar(cap.sel, selBar.offsetWidth, selBar.offsetHeight, innerWidth, innerHeight);
  });

  // the page must be live to pick an element: close fully, the element capture hides the UI again
  const pick = (fn: () => void) => () => (closeCapture(), fn());
  const act = (which: 'copy' | 'save') =>
    capAction(
      (label, disabled) => {
        if (which === 'copy') copyLabel = label;
        else saveLabel = label;
        busy = disabled;
      },
      async () => (which === 'copy' ? copyCanvas : saveCanvas)(await crop!()),
      which === 'copy' ? 'capture.copied' : 'capture.saved',
      true,
    );
  async function markup() {
    const c = await crop?.().catch(() => null);
    if (c) void openCaptureEditor(c, true);
  }
</script>

<!-- area hint and selection hide under the editor (it was showing through the dim backdrop) -->
<div
  bind:this={areaRoot}
  class="font-sans text-[13px]"
  style:visibility={cap.view === 'editor' ? 'hidden' : undefined}
></div>
{#if cap.view === 'editor'}
  <EditorView />
{:else if cap.modeBar}
  <div
    data-bar="mode"
    class="bd-in pointer-events-auto fixed bottom-[16px] left-1/2 flex -translate-x-1/2 items-center gap-0.5 capbar p-[5px] font-sans text-[13px]"
  >
    {#if cap.element}
      <CapButton
        icon={MousePointer2}
        label={i18n.t('capture.element')}
        onclick={pick(cap.element)}
      />
    {/if}
    <CapButton icon={Scan} label={i18n.t('capture.area')} on />
    <CapButton
      icon={Monitor}
      label={i18n.t('capture.visible')}
      onclick={() => void openCaptureEditor(cap.snap)}
    />
    <CapButton
      icon={ScrollText}
      label={i18n.t('capture.fullPage')}
      disabled={app.responsiveOn}
      title={app.responsiveOn ? i18n.t('capture.fullPageResponsive') : undefined}
      onclick={() => {
        const snap = cap.snap;
        closeCapture({ keepCapturing: true });
        void captureFullPage(snap);
      }}
    />
    <div class="mx-1 h-[20px] w-px bg-line"></div>
    <CapButton icon={X} title={i18n.t('capture.close')} onclick={closeCapture} />
  </div>
{/if}
{#if cap.view === 'bar' && cap.sel}
  <div
    bind:this={selBar}
    data-bar="sel"
    class="pointer-events-auto fixed flex items-center gap-0.5 capbar p-[5px] font-sans text-[13px]"
    style:top="{pos.top}px"
    style:left="{pos.left}px"
  >
    <CapButton
      icon={Copy}
      label={copyLabel ?? i18n.t('capture.copy')}
      disabled={busy}
      onclick={() => act('copy')}
    />
    <CapButton
      icon={Download}
      label={saveLabel ?? i18n.t('capture.save')}
      disabled={busy}
      onclick={() => act('save')}
    />
    <CapButton icon={Pencil} label={i18n.t('capture.markupCapture')} onclick={markup} />
    <div class="mx-1 h-[20px] w-px bg-line"></div>
    <CapButton icon={X} title={i18n.t('capture.close')} onclick={closeCapture} />
  </div>
{/if}

<style>
  .bd-in {
    animation: bd-in 0.15s ease-out;
  }
  @keyframes bd-in {
    from {
      opacity: 0;
      translate: -50% 4px;
    }
  }
</style>
