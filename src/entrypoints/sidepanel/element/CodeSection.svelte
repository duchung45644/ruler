<script lang="ts">
  import { browser } from '#imports';
  import { i18n } from '#i18n';
  import { declKey, groupBySource, overriddenDecls } from '../../../lib/css/matched';
  import type { CssMap, ElementDetails, MatchedRule } from '../../../lib/element/types';
  import { sendToBackground } from '../../../lib/ext/messaging';
  import { updatePanelPrefs, type SidePanelPrefs } from '../../../lib/ext/settings';
  import Section from '../Section.svelte';
  import { panel, toPage } from '../store.svelte';
  import CopyButton from './CopyButton.svelte';

  type Mode = SidePanelPrefs['codeViewMode'];
  let { el }: { el: ElementDetails } = $props();

  const modes: [Mode, string][] = [
    ['css', i18n.t('panel.computed')],
    ['source', i18n.t('panel.source')],
    ['tailwind', i18n.t('panel.tailwind')],
  ];
  const mode = $derived(panel.prefs.codeViewMode);
  /**
   * Converted here, not in the content script, so the converter is not injected into pages;
   * loaded on first use, so it stays out of the panel bundle too (~27 KB).
   */
  let toTailwind = $state.raw<((css: CssMap) => string) | null>(null);
  $effect(() => {
    if (mode === 'tailwind' && !toTailwind)
      void import('../../../lib/css/tailwind').then((m) => (toTailwind = m.tailwindClasses));
  });
  const tailwind = $derived(mode === 'tailwind' && toTailwind ? toTailwind(el.css) : '');
  function setMode(m: Mode) {
    panel.prefs = { ...panel.prefs, codeViewMode: m };
    void updatePanelPrefs({ codeViewMode: m });
  }

  /** Rules per element; the key changes once cross-origin sheets become readable. */
  let cache = $state<Record<string, MatchedRule[] | 'loading'>>({});
  const key = $derived(`${el.id}:${el.skippedCrossOriginCount}`);
  const rules = $derived(cache[key]);
  $effect(() => {
    if (mode !== 'source' || cache[key] !== undefined) return;
    const k = key;
    cache[k] = 'loading';
    void toPage('get_matched_rules').then((r) => (cache[k] = r?.matchedRules ?? []));
  });

  let hostPermission = $state(true);
  $effect(() => {
    if (el.skippedCrossOriginCount > 0)
      void sendToBackground('has_host_permission').then(
        (ok) => (hostPermission = ok),
        () => (hostPermission = false),
      );
  });

  async function grant() {
    // permissions.request must be the first call in the click
    const ok = await browser.permissions.request({ origins: ['<all_urls>'] }).catch(() => false);
    if (!ok) return;
    hostPermission = true;
    await toPage('enable_cross_origin_styles');
    delete cache[key];
  }

  const block = (sel: string, css: CssMap) =>
    `${sel} {\n${Object.entries(css)
      .map(([p, v]) => `  ${p}: ${v};`)
      .join('\n')}\n}`;
  const computed = $derived(
    [
      block(el.name, el.css),
      el.before && block(`${el.name}::before`, el.before),
      el.after && block(`${el.name}::after`, el.after),
    ]
      .filter(Boolean)
      .join('\n\n'),
  );
  const list = $derived(Array.isArray(rules) ? rules : []);
  const groups = $derived(groupBySource(list));
  const overridden = $derived(overriddenDecls(list));
  const ruleText = (r: MatchedRule) => {
    const body = `${r.selector} {\n${r.declarations
      .map((d) => `  ${d.property}: ${d.value}${d.important ? ' !important' : ''};`)
      .join('\n')}\n}`;
    return r.wrappers.reduceRight((inner, w) => `${w} {\n${inner}\n}`, body);
  };
  const sourceText = () =>
    groups.map((g) => `/* ${g.name} */\n${g.rules.map(ruleText).join('\n\n')}`).join('\n\n');
</script>

{#snippet decls(css: CssMap)}
  {#each Object.entries(css) as [p, val] (p)}
    <div class="pl-4"><span class="text-sky-300 light:text-sky-700">{p}</span>: {val};</div>
  {/each}
{/snippet}

<Section id="css" title={i18n.t('panel.code')}>
  {#snippet actions()}
    <CopyButton
      text={() => (mode === 'css' ? computed : mode === 'source' ? sourceText() : tailwind)}
    />
  {/snippet}
  <div class="mb-2 flex rounded-btn border border-line p-0.5" role="radiogroup" data-modes>
    {#each modes as [m, label] (m)}
      <button
        type="button"
        role="radio"
        aria-checked={mode === m}
        class="flex-1 rounded-md py-1 font-medium"
        class:bg-line={mode === m}
        class:text-fg-muted={mode !== m}
        data-mode={m}
        onclick={() => setMode(m)}>{label}</button
      >
    {/each}
  </div>
  <div
    class="max-h-96 overflow-auto rounded-btn border border-line px-2.5 py-2 font-mono text-[11px] leading-[1.6]"
    data-code={mode}
  >
    {#if mode === 'css'}
      <div><span class="text-accent">{el.name}</span> {'{'}</div>
      {@render decls(el.css)}
      <div>}</div>
      {#each [['::before', el.before], ['::after', el.after]] as const as [pseudo, css] (pseudo)}
        {#if css}
          <div class="mt-2"><span class="text-accent">{el.name}{pseudo}</span> {'{'}</div>
          {@render decls(css)}
          <div>}</div>
        {/if}
      {/each}
    {:else if mode === 'source'}
      {#if el.skippedCrossOriginCount > 0 && !hostPermission}
        <div class="mb-2 font-sans text-fg-muted" data-cross-origin>
          {i18n.t('panel.crossOriginHidden', [String(el.skippedCrossOriginCount)])}
          <button type="button" class="text-accent hover:underline" onclick={grant}
            >{i18n.t('panel.enableCrossOrigin')}</button
          >
        </div>
      {/if}
      {#if rules === undefined || rules === 'loading'}
        <div class="text-fg-muted">…</div>
      {:else if !list.length}
        <div class="text-fg-muted">{i18n.t('panel.noMatchedRules')}</div>
      {:else}
        {#each groups as g (g.source)}
          <div
            class="mt-2 mb-1 truncate font-sans text-[10px] font-semibold tracking-wide text-fg-muted uppercase first:mt-0"
            title={g.source}
          >
            {g.name}
          </div>
          {#each g.rules as r (r.sourceIndex)}
            {@const i = list.indexOf(r)}
            <div class="mb-1.5" class:opacity-45={!r.mediaActive} data-rule>
              {#each r.wrappers as w, n (n)}<div class="text-fg-muted">{w} {'{'}</div>{/each}
              <div><span class="text-accent">{r.selector}</span> {'{'}</div>
              {#each r.declarations as d, n (n)}
                <div
                  class="pl-4"
                  class:line-through={overridden.has(declKey(i, d.property))}
                  class:opacity-55={overridden.has(declKey(i, d.property))}
                >
                  <span class="text-sky-300 light:text-sky-700">{d.property}</span>: {d.value}{#if d.important}<span
                      class="text-rose-500"
                    >
                      !important</span
                    >{/if};
                </div>
              {/each}
              <div>}{'}'.repeat(r.wrappers.length)}</div>
            </div>
          {/each}
        {/each}
      {/if}
    {:else}
      <div class="break-words" data-tailwind>{tailwind}</div>
    {/if}
  </div>
</Section>
