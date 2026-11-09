<script lang="ts">
  import { i18n } from '#i18n';
  import { filterVars, groupVars, isColorValue, type CssVar } from '../../../lib/css/variables';
  import { takeState } from '../edit/edit-store.svelte';
  import { panel, toPageData } from '../store.svelte';

  /** Rendering thousands of rows stalls the panel; the filter narrows it down. */
  const MAX_ROWS = 400;

  let vars = $state.raw<CssVar[] | null>(null);
  let filter = $state('');

  // mounted only while the section is open: read once per page, again after navigation
  $effect(() => {
    void panel.page?.url;
    void toPageData('get_root_variables').then((r) => (vars = Array.isArray(r) ? r : []));
  });

  const shown = $derived(filterVars(vars ?? [], filter));
  const groups = $derived(groupVars(shown.slice(0, MAX_ROWS)));
  const supports = (v: string) => CSS.supports('color', v);

  async function set(v: CssVar, value: string) {
    value = value.trim();
    if (value === v.value) return;
    const r = await toPageData('set_root_variable', v.name, value);
    if (!r?.ok) return;
    takeState(r);
    vars = (vars ?? []).map((x) => (x.name === v.name ? { ...x, value } : x));
  }

  function onkey(e: KeyboardEvent, v: CssVar) {
    const input = e.currentTarget as HTMLInputElement;
    if (e.key === 'Enter') input.blur();
    else if (e.key === 'Escape') {
      input.value = v.value;
      input.blur();
    }
  }
</script>

{#if vars === null}
  <p class="py-2 text-fg-muted">{i18n.t('page.loading')}</p>
{:else if !vars.length}
  <p class="py-2 text-fg-muted" data-no-vars>{i18n.t('page.noCssVariables')}</p>
{:else}
  <input
    class="mb-2 h-6 w-full rounded-sm border border-line bg-transparent px-1.5 font-mono text-[11px] outline-none placeholder:text-fg-muted focus:border-line-strong"
    placeholder={i18n.t('page.filterVariables')}
    bind:value={filter}
    spellcheck="false"
    data-var-filter
  />
  {#each groups as g (g.name)}
    <h4 class="mt-2 mb-1 text-[10px] font-semibold tracking-wide text-fg-muted uppercase">
      {g.name || i18n.t('page.otherVariables')}
    </h4>
    {#each g.vars as v (v.name)}
      <label class="flex items-center gap-2 py-0.5" data-var={v.name}>
        <span class="min-w-0 flex-1 truncate font-mono text-[11px]" title={v.name}>{v.name}</span>
        {#if isColorValue(v.value, supports)}
          <span
            class="size-3.5 shrink-0 rounded-sm border border-line"
            style:background={v.value}
            data-swatch
          ></span>
        {/if}
        <input
          class="h-6 w-[45%] min-w-0 rounded-sm bg-transparent px-1 font-mono text-[11px] outline-none hover:bg-line focus:bg-line"
          value={v.value}
          spellcheck="false"
          aria-label={v.name}
          onchange={(e) => set(v, e.currentTarget.value)}
          onkeydown={(e) => onkey(e, v)}
        />
      </label>
    {/each}
  {/each}
  {#if shown.length > MAX_ROWS}
    <p class="pt-2 text-fg-muted" data-vars-capped>
      {i18n.t('page.variablesCapped', [String(MAX_ROWS), String(shown.length)])}
    </p>
  {/if}
{/if}
