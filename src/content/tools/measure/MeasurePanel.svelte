<script lang="ts">
  import { i18n } from '#i18n';
  import type { Field } from '../../../lib/tools/measure';
  import ToolPanel from '../../../ui/ToolPanel.svelte';
  import { state as app } from '../../core/state.svelte';
  import { boxValues, panelSync, prefs, savePrefs, setBox, setField, setOn } from '.';

  // Port of openMeasurePanel (unpacked/scripts/bd/measure-guides.js:303).
  const inputs: Partial<Record<Field, HTMLInputElement>> = {};
  let guides = $state(prefs.guides);
  let color = $state(prefs.color);

  /** Legacy syncMeasureInputs: the focused field is never overwritten. */
  function sync() {
    const v = boxValues();
    for (const [k, el] of Object.entries(inputs) as [Field, HTMLInputElement][])
      if (el !== (el.getRootNode() as ShadowRoot).activeElement)
        el.value = v ? String(Math.round(v[k])) : '';
  }
  $effect(() => {
    panelSync.fn = sync;
    sync();
    return () => (panelSync.fn = null);
  });

  function oninput(k: Field, el: HTMLInputElement) {
    if (el.value !== '') setField(k, Number(el.value));
  }
  // native arrows step 1; Shift+arrows step 10 like the old ruler
  function onkeydown(k: Field, e: KeyboardEvent) {
    if (!e.shiftKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    const el = e.currentTarget as HTMLInputElement;
    el.value = String(Number(el.value || 0) + (e.key === 'ArrowUp' ? 10 : -10));
    setField(k, Number(el.value));
  }
  const rows: [string, Field, Field][] = [
    ['W / H', 'w', 'h'],
    [i18n.t('measure.leftTop'), 'l', 't'],
    [i18n.t('measure.toEdge'), 'r', 'b'],
  ];
</script>

{#snippet num(k: Field)}
  <input
    type="number"
    step="1"
    class="field w-16"
    bind:this={inputs[k]}
    oninput={(e) => oninput(k, e.currentTarget)}
    onkeydown={(e) => onkeydown(k, e)}
  />
{/snippet}

<div style:display={app.paused ? 'none' : undefined}>
  <ToolPanel title={i18n.t('measure.title')} onclose={() => setOn(false)}>
    <div class="flex flex-col gap-2">
      {#each rows as [label, a, b] (a)}
        <div class="flex items-center gap-2">
          <span class="flex-1 text-fg-muted">{label}</span>
          {@render num(a)}{@render num(b)}
        </div>
      {/each}
      <div class="flex items-center gap-2">
        <input
          type="color"
          title={i18n.t('measure.boxColor')}
          aria-label={i18n.t('measure.boxColor')}
          bind:value={color}
          oninput={() => ((prefs.color = color), savePrefs())}
        />
        <button
          type="button"
          class="field"
          class:text-accent={guides}
          aria-pressed={guides}
          title={i18n.t('measure.edgeGuidesTitle')}
          onclick={() => ((guides = prefs.guides = !guides), savePrefs())}
          >{i18n.t('measure.edgeGuides')}</button
        >
        <button type="button" class="field" onclick={() => setBox(null)}
          >{i18n.t('measure.clear')}</button
        >
      </div>
      <p class="text-fg-muted">{i18n.t('measure.hint')}</p>
    </div>
  </ToolPanel>
</div>
