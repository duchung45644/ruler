<script lang="ts">
  import { i18n } from '#i18n';
  import { onMount } from 'svelte';
  import { popoverLeft } from '../lib/dom/geometry';
  import { tourDone } from '../lib/ext/settings';
  import { state as app } from '../content/core/state.svelte';

  /** First-run tour above the dock (top page only; Dock.svelte skips it in frames). */
  const STEPS = [
    ['tour.dockTitle', 'tour.dockBody', null],
    ['tour.keysTitle', 'tour.keysBody', null],
    ['tour.menuTitle', 'tour.menuBody', 'more'], // over the ⋯ button
    ['tour.paletteTitle', 'tour.paletteBody', null],
  ] as const;

  let { dock }: { dock: HTMLElement } = $props();
  let box = $state<HTMLElement>();
  /** px from the dock's left when the step points at a button, else null (centred). */
  let left = $state<number | null>(null);

  let step = $state(-1); // -1: not shown
  const hidden = $derived(app.palette || app.paused || app.capturing || !!app.popover);

  onMount(() => {
    let live = true;
    void tourDone.getValue().then(
      (done) => live && !done && (step = 0),
      () => {},
    );
    return () => (live = false);
  });

  // measured once per step, reads only (Popover.svelte does the same)
  $effect(() => {
    const target = step >= 0 && !hidden ? STEPS[step]![2] : null;
    const btn = target && dock.querySelector(`[data-item="${target}"]`);
    left =
      btn && box
        ? popoverLeft(btn.getBoundingClientRect(), dock.getBoundingClientRect(), box.offsetWidth)
        : null;
  });

  function finish() {
    step = -1;
    void tourDone.setValue(true);
  }
  const next = () => (step + 1 < STEPS.length ? step++ : finish());
</script>

{#if step >= 0 && !hidden}
  {@const [title, body] = STEPS[step]!}
  <div
    bind:this={box}
    data-tour={step}
    role="dialog"
    aria-label={i18n.t(title)}
    class="absolute bottom-[calc(100%+10px)] w-[min(300px,calc(100vw-32px))] rounded-panel border border-line bg-surface p-3 text-fg shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur-surface {left ===
    null
      ? 'left-1/2 -translate-x-1/2'
      : ''}"
    style:left={left === null ? undefined : `${left}px`}
  >
    <div class="text-[13px] font-semibold">{i18n.t(title)}</div>
    <p class="mt-1 text-[12px] leading-[1.45] text-fg-muted">{i18n.t(body)}</p>
    <div class="mt-3 flex items-center gap-2 text-[12px]">
      <span class="flex-1 font-mono text-fg-muted">{step + 1}/{STEPS.length}</span>
      {#if step + 1 < STEPS.length}
        <button
          type="button"
          data-action="tour-skip"
          class="rounded-btn px-2 py-1 text-fg-muted hover:bg-line"
          onclick={finish}>{i18n.t('tour.skip')}</button
        >
      {/if}
      <button
        type="button"
        data-action="tour-next"
        class="rounded-btn bg-accent px-2.5 py-1 font-medium text-white"
        onclick={next}>{step + 1 < STEPS.length ? i18n.t('tour.next') : i18n.t('tour.done')}</button
      >
    </div>
  </div>
{/if}
