<script lang="ts">
  import { i18n } from '#i18n';
  import X from '@lucide/svelte/icons/x';
  import { state as app } from '../../core/state.svelte';
  import { parseMaxWidth, setGrid } from '.';

  // 3.03, port of the legacy grid popover (legacy-src/content.js:30552)
  const COLUMNS = [2, 3, 4, 6, 8, 12, 16, 24];
  const g = app.grid;
  let maxWidth = $state(String(g.maxWidth));
  let hex = $state(g.color.replace('#', ''));

  function blurMaxWidth() {
    const v = parseMaxWidth(maxWidth);
    maxWidth = String(v);
    setGrid({ maxWidth: v });
  }
  function setColor(c: string) {
    hex = c.replace('#', '').toUpperCase();
    setGrid({ color: `#${hex}` });
  }
  const num = (e: Event) => Number((e.currentTarget as HTMLInputElement).value);
</script>

<div class="flex w-[220px] flex-col gap-2 font-sans text-[12px]">
  <div class="flex items-center justify-between gap-2">
    <span class="font-semibold">{i18n.t('dock.grid')}</span>
    <div class="flex items-center gap-1">
      <input
        type="checkbox"
        role="switch"
        aria-label={i18n.t('dock.grid')}
        checked={g.isOn}
        onchange={(e) => setGrid({ isOn: e.currentTarget.checked })}
      />
      <button
        type="button"
        aria-label={i18n.t('common.close')}
        class="text-muted hover:text-fg"
        onclick={() => (app.popover = null)}><X size={14} /></button
      >
    </div>
  </div>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.columns')}
    <select value={g.columns} onchange={(e) => setGrid({ columns: num(e) })}>
      {#each COLUMNS as c (c)}<option value={c}>{c}</option>{/each}
    </select>
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.maxWidth')}
    <input type="text" class="w-[80px]" bind:value={maxWidth} onblur={blurMaxWidth} />
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.gutter')}
    <input
      type="number"
      min="0"
      max="100"
      class="w-[80px]"
      value={g.gutter}
      onchange={(e) => setGrid({ gutter: num(e) })}
    />
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.margin')}
    <input
      type="number"
      min="0"
      max="350"
      class="w-[80px]"
      value={g.margin}
      onchange={(e) => setGrid({ margin: num(e) })}
    />
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.color')}
    <span class="flex items-center gap-1">
      <input type="color" value={g.color} oninput={(e) => setColor(e.currentTarget.value)} />
      <input
        type="text"
        maxlength="6"
        class="w-[64px]"
        bind:value={hex}
        onchange={() => /^[0-9a-f]{6}$/i.test(hex) && setColor(hex)}
      />
    </span>
  </label>
  <label class="flex items-center justify-between gap-2"
    >{i18n.t('grid.opacity')}
    <input
      type="range"
      min="0.1"
      max="0.9"
      step="0.1"
      value={g.opacity}
      oninput={(e) => setGrid({ opacity: num(e) })}
    />
  </label>
</div>
