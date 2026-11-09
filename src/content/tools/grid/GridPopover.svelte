<script lang="ts">
  import { i18n } from '#i18n';
  import X from '@lucide/svelte/icons/x';
  import { state as app } from '../../core/state.svelte';
  import { parseMaxWidth, setGrid } from '.';

  // 3.03, port of the legacy grid popover (legacy-src/content.js:30552), reworked to apply live
  const g = app.grid;
  let maxWidth = $state(String(g.maxWidth));
  let hex = $state(g.color.replace('#', '').toUpperCase());

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  /** Live while typing: a valid number applies at once; blur shows the value in use. */
  function live(e: Event, key: 'columns' | 'gutter' | 'margin', min: number, max: number) {
    const raw = (e.currentTarget as HTMLInputElement).value;
    if (raw === '' || isNaN(+raw)) return;
    setGrid({ [key]: clamp(Math.round(+raw), min, max) });
  }
  function settle(e: Event, key: 'columns' | 'gutter' | 'margin') {
    (e.currentTarget as HTMLInputElement).value = String(g[key]);
  }
  function setColor(c: string) {
    hex = c.replace('#', '').toUpperCase();
    setGrid({ color: `#${hex}` });
  }
  const opacityPct = $derived(Math.round(g.opacity * 100));
</script>

<div class="flex w-55 flex-col gap-2 font-sans text-[12px]">
  <div class="flex items-center justify-between gap-2">
    <span class="font-semibold">{i18n.t('dock.grid')}</span>
    <div class="flex items-center gap-1">
      <button
        type="button"
        aria-label={i18n.t('common.close')}
        class="text-fg-muted hover:text-fg"
        onclick={() => (app.popover = null)}><X size={14} /></button
      >
    </div>
  </div>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.columns')}
    <input
      type="number"
      min="1"
      max="24"
      class="field w-20"
      data-grid="columns"
      value={g.columns}
      oninput={(e) => live(e, 'columns', 1, 24)}
      onblur={(e) => settle(e, 'columns')}
    />
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.maxWidth')}
    <input
      type="text"
      class="field w-20"
      data-grid="maxWidth"
      bind:value={maxWidth}
      oninput={() => setGrid({ maxWidth: parseMaxWidth(maxWidth) })}
      onblur={() => (maxWidth = String(g.maxWidth))}
    />
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.gutter')}
    <input
      type="number"
      min="0"
      max="100"
      class="field w-20"
      data-grid="gutter"
      value={g.gutter}
      oninput={(e) => live(e, 'gutter', 0, 100)}
      onblur={(e) => settle(e, 'gutter')}
    />
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.margin')}
    <input
      type="number"
      min="0"
      max="350"
      class="field w-20"
      data-grid="margin"
      value={g.margin}
      oninput={(e) => live(e, 'margin', 0, 350)}
      onblur={(e) => settle(e, 'margin')}
    />
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.color')}
    <span class="flex items-center gap-1">
      <input type="color" value={g.color} oninput={(e) => setColor(e.currentTarget.value)} />
      <input
        type="text"
        maxlength="6"
        class="field w-16"
        bind:value={hex}
        oninput={() => /^[0-9a-f]{6}$/i.test(hex) && setColor(hex)}
        onblur={() => (hex = g.color.replace('#', '').toUpperCase())}
      />
    </span>
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.opacity')}
    <span class="flex items-center gap-2">
      <input
        type="range"
        min="0.05"
        max="1"
        step="0.05"
        class="w-24"
        data-grid="opacity"
        value={g.opacity}
        oninput={(e) => setGrid({ opacity: +e.currentTarget.value })}
      />
      <span class="w-8 text-right font-mono text-fg-muted tabular-nums">{opacityPct}%</span>
    </span>
  </label>
</div>
