<script lang="ts">
  import { i18n } from '#i18n';
  import ArrowIcon from '@lucide/svelte/icons/move-up-right';
  import Copy from '@lucide/svelte/icons/copy';
  import Download from '@lucide/svelte/icons/download';
  import Highlighter from '@lucide/svelte/icons/highlighter';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Square from '@lucide/svelte/icons/square';
  import Type from '@lucide/svelte/icons/type';
  import Undo2 from '@lucide/svelte/icons/undo-2';
  import X from '@lucide/svelte/icons/x';
  import Frame from '@lucide/svelte/icons/frame';
  import { BACKDROPS, PADDINGS } from '../../../lib/frame';
  import { MARK_COLORS, MARK_SIZES, MARK_TOOLS } from '../../../lib/markup';
  import CapButton from './CapButton.svelte';
  import { attachEditor, framed, setBackdrop, setTool } from './editor';
  import { capAction, closeCapture, copyCanvas, saveCanvas } from './session';
  import { cap } from './state.svelte';

  // Editor view, port of editor.js:24 (no fade, spec §9).
  const ICONS = { pen: Pencil, arrow: ArrowIcon, rect: Square, hl: Highlighter, text: Type };
  let ed: HTMLElement;
  let canvas: HTMLCanvasElement;
  let api: ReturnType<typeof attachEditor> | null = null;
  let copyLabel: string | null = $state(null);
  let saveLabel: string | null = $state(null);
  let busy = $state(false);
  const e = cap.editor;

  $effect(() => {
    const img = e.img;
    if (!img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    api = attachEditor(canvas, ed, img);
    return () => {
      api?.destroy();
      api = null;
    };
  });

  const act = (which: 'copy' | 'save') => {
    api?.commitText();
    void capAction(
      (label, disabled) => {
        if (which === 'copy') copyLabel = label;
        else saveLabel = label;
        busy = disabled;
      },
      () => (which === 'copy' ? copyCanvas : saveCanvas)(framed(canvas)),
      which === 'copy' ? 'capture.copied' : 'capture.saved',
      false,
    );
  };
</script>

<div
  bind:this={ed}
  class="pointer-events-auto fixed inset-0 flex flex-col items-center justify-center bg-[rgba(0,0,0,.72)] py-[16px] font-sans text-[13px]"
>
  {#if e.note}
    <div
      class="mb-[12px] max-w-[min(720px,calc(100vw-32px))] rounded-panel border border-line bg-surface px-[12px] py-[8px] text-[12px] text-fg shadow-[inset_3px_0_0_#F0A03C]"
    >
      {e.note}
    </div>
  {/if}
  <div
    class="flex min-h-0 w-full flex-[0_1_auto] items-start justify-center overflow-auto px-[16px]"
  >
    <!-- the frame preview is CSS; copy/save draw the same frame with framed() -->
    <div
      class="shrink-0 rounded-[10px]"
      style:padding="{e.pad}px"
      style:background={e.pad ? BACKDROPS.find((b) => b.id === e.backdrop)?.css : undefined}
    >
      <canvas
        bind:this={canvas}
        class="block bg-white {e.pad
          ? 'rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,.25)]'
          : 'rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,.4)]'}"
        class:cursor-crosshair={e.marking && e.tool !== 'text'}
        class:cursor-text={e.marking && e.tool === 'text'}
      ></canvas>
    </div>
  </div>
  <div
    data-bar="editor"
    class="mt-[14px] flex max-w-[calc(100vw-32px)] shrink-0 flex-wrap items-center justify-center gap-0.5 capbar p-[5px]"
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
    <CapButton
      icon={Pencil}
      label={i18n.t('capture.markup')}
      on={e.marking}
      onclick={() => {
        api?.commitText();
        e.marking = !e.marking;
      }}
    />
    <div class="mx-1 h-[20px] w-px bg-line"></div>
    <div data-frame class="flex items-center gap-1" title={i18n.t('capture.padding')}>
      <Frame size={16} class="mx-1 text-fg-muted" />
      {#each PADDINGS as p (p)}
        <button
          type="button"
          class="h-[28px] min-w-[28px] rounded-btn px-1.5 text-[12px] {e.pad === p
            ? 'bg-line shadow-[inset_0_0_0_1.5px_var(--color-accent)]'
            : 'text-fg-muted hover:bg-line'}"
          aria-pressed={e.pad === p}
          onclick={() => (e.pad = p)}>{p}</button
        >
      {/each}
      {#if e.pad}
        {#each BACKDROPS as b (b.id)}
          <button
            type="button"
            class="size-[22px] rounded-full {e.backdrop === b.id
              ? 'shadow-[0_0_0_2px_var(--color-accent)]'
              : 'shadow-[inset_0_0_0_1px_var(--color-line)]'}"
            style:background={b.css}
            aria-label={b.id}
            aria-pressed={e.backdrop === b.id}
            onclick={() => setBackdrop(b.id)}
          ></button>
        {/each}
      {/if}
    </div>
    {#if e.marking}
      <div data-tools class="flex items-center gap-1">
        <div class="mx-1 h-[20px] w-px bg-line"></div>
        {#each MARK_TOOLS as t (t.id)}
          {@const I = ICONS[t.id]}
          <button
            type="button"
            data-tool={t.id}
            class="grid size-[32px] place-items-center rounded-btn {e.tool === t.id
              ? 'shadow-[inset_0_0_0_1.5px_var(--color-accent)] bg-line'
              : 'hover:bg-line'}"
            aria-pressed={e.tool === t.id}
            title="{i18n.t(t.label)} ({t.key.toUpperCase()})"
            onclick={() => setTool(t.id)}
          >
            <I size={16} />
          </button>
        {/each}
        <div class="mx-1 h-[20px] w-px bg-line"></div>
        {#each MARK_COLORS as c (c)}
          <button
            type="button"
            class="size-[22px] rounded-full {e.color === c
              ? 'bg-clip-content p-[2px] shadow-[0_0_0_2px_var(--color-accent)]'
              : 'shadow-[inset_0_0_0_1px_var(--color-line)]'}"
            style:background-color={c}
            title={c}
            aria-label={c}
            onclick={() => (e.color = c)}
          ></button>
        {/each}
        <div class="mx-1 h-[20px] w-px bg-line"></div>
        {#each MARK_SIZES as n (n)}
          <button
            type="button"
            class="grid size-[32px] place-items-center rounded-btn {e.size === n
              ? 'shadow-[inset_0_0_0_1.5px_var(--color-accent)] bg-line'
              : 'hover:bg-line'}"
            title="{n}px"
            aria-label="{n}px"
            onclick={() => (e.size = n)}
            ><span
              class="block rounded-full bg-current"
              style:width="{n + 4}px"
              style:height="{n + 4}px"
            ></span></button
          >
        {/each}
        <CapButton
          icon={Undo2}
          title={i18n.t('capture.undo')}
          disabled={!e.canUndo}
          onclick={() => api?.undo()}
        />
      </div>
    {/if}
    <div class="mx-1 h-[20px] w-px bg-line"></div>
    <CapButton icon={X} title={i18n.t('capture.close')} onclick={closeCapture} />
  </div>
</div>
