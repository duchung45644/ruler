<script lang="ts">
  import { i18n } from '#i18n';
  import { onMount, type Snippet } from 'svelte';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import Dialog from '../../ui/Dialog.svelte';
  import McpPrompt from '../../ui/McpPrompt.svelte';
  import { MIN_MCP_SERVER_VERSION } from '../../lib/mcp/protocol';
  import { IDLE_STATUS, type McpStatus } from '../../lib/mcp/status';
  import { handleMessages, sendToBackground } from '../../lib/ext/messaging';
  import type { ColorFormat } from '../../lib/style/color';
  import { clearAllPersistedEdits } from '../../lib/edit/persist-key';
  import {
    getPanelPrefs,
    mcpIntent,
    mergePanelPrefs,
    panelPrefsItem,
    themePref,
    updatePanelPrefs,
  } from '../../lib/ext/settings';
  import { applyDocTheme, type ThemePref } from '../../lib/style/theme';

  let { onready }: { onready?: () => void } = $props();

  let theme = $state<ThemePref>('system');
  let colorFormat = $state<ColorFormat>('HEX');
  let loaded = $state(false);
  let confirming = $state(false);
  let mcp = $state<McpStatus>(IDLE_STATUS);
  let prompt = $state<string | null>(null);
  let outdatedOpen = $state(false);
  /** The prompt is shown while waiting for the agent (or after a reject): it carries the token. */
  const showPrompt = $derived(mcp.intent && !mcp.connected);

  const setMcp = (s: McpStatus | undefined) => {
    if (s) mcp = s;
  };
  $effect(() => {
    if (!showPrompt || prompt) return;
    void sendToBackground('mcp_prompt').then(
      (p) => (prompt = p ?? null),
      () => {},
    );
  });
  async function toggleMcp() {
    setMcp(
      await sendToBackground(mcp.intent ? 'mcp_disconnect' : 'mcp_connect').catch(() => undefined),
    );
  }
  const mql = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

  $effect(() => applyDocTheme(document, theme, mql));

  onMount(() => {
    const ac = new AbortController();
    mql?.addEventListener('change', () => applyDocTheme(document, theme, mql), {
      signal: ac.signal,
    });
    void Promise.all([
      themePref.getValue().catch(() => 'system' as const),
      getPanelPrefs().catch(() => null),
    ]).then(([t, prefs]) => {
      if (ac.signal.aborted) return;
      theme = t ?? 'system';
      if (prefs) colorFormat = prefs.colorFormat;
      loaded = true;
      onready?.();
    });
    void sendToBackground('mcp_status').then(setMcp, () => {});
    // the background pushes connection changes; it is the only one that knows them (9.07, 10.03)
    handleMessages('options', { mcp_status: (s) => setMcp(s) }, ac.signal);
    // changes made elsewhere (side panel, another tab) show up here (9.07)
    const unwatch = [
      mcpIntent.watch(() => void sendToBackground('mcp_status').then(setMcp, () => {})),
      themePref.watch((t) => (theme = t ?? 'system')),
      panelPrefsItem.watch((p) => (colorFormat = mergePanelPrefs(p).colorFormat)),
    ];
    return () => {
      ac.abort();
      unwatch.forEach((u) => u());
    };
  });

  const themes: [ThemePref, string][] = [
    ['system', i18n.t('theme.system')],
    ['light', i18n.t('theme.light')],
    ['dark', i18n.t('theme.dark')],
  ];
  // labels stay verbatim, as in legacy options/index.html
  const formats: [ColorFormat, string][] = [
    ['HEX', 'HEX/HEXA'],
    ['RGB', 'RGB/RGBA'],
    ['HSL', 'HSL/HSLA'],
    ['HSB', 'HSB/HSBA'],
  ];
  const selectCls =
    'rounded-btn border border-line bg-transparent px-2 py-1 text-fg outline-none focus-visible:border-accent';
</script>

{#snippet row(title: string, secondary: string | null, control: Snippet)}
  <div class="flex items-center justify-between gap-4 px-4 py-3">
    <div class="flex min-w-0 flex-col gap-0.5">
      <span class="font-medium">{title}</span>
      {#if secondary}<span class="text-[12px] text-fg-muted">{secondary}</span>{/if}
    </div>
    <div class="shrink-0">{@render control()}</div>
  </div>
{/snippet}

{#snippet section(title: string, body: Snippet)}
  <section class="flex flex-col gap-2">
    <h2 class="px-1 text-[12px] font-semibold text-fg-muted uppercase">{title}</h2>
    <div class="divide-y divide-line rounded-panel border border-line">{@render body()}</div>
  </section>
{/snippet}

<main class="mx-auto flex max-w-160 flex-col gap-5 p-4" aria-busy={!loaded}>
  {#snippet appearance()}
    {#snippet themeSelect()}
      <select
        class={selectCls}
        data-setting="theme"
        value={theme}
        onchange={(e) => void themePref.setValue((theme = e.currentTarget.value as ThemePref))}
      >
        {#each themes as [id, label] (id)}<option value={id}>{label}</option>{/each}
      </select>
    {/snippet}
    {@render row(i18n.t('options.rowTheme'), null, themeSelect)}
  {/snippet}
  {@render section(i18n.t('options.sectionAppearance'), appearance)}

  {#snippet extension()}
    {#snippet formatSelect()}
      <select
        class={selectCls}
        data-setting="colorFormat"
        value={colorFormat}
        onchange={(e) =>
          // updatePanelPrefs keeps sectionVisibility, codeViewMode… (9.02)
          void updatePanelPrefs({
            colorFormat: (colorFormat = e.currentTarget.value as ColorFormat),
          })}
      >
        {#each formats as [id, label] (id)}<option value={id}>{label}</option>{/each}
      </select>
    {/snippet}
    {#snippet clearButton()}
      <button
        type="button"
        class="rounded-btn border border-line px-3 py-1 font-medium hover:bg-line"
        data-action="clear-saved-edits"
        onclick={() => (confirming = true)}>{i18n.t('options.savedEditsClear')}</button
      >
    {/snippet}
    {@render row(
      i18n.t('options.rowColorFormat'),
      i18n.t('options.colorFormatSecondary'),
      formatSelect,
    )}
    {@render row(
      i18n.t('options.savedEditsTitle'),
      i18n.t('options.savedEditsSecondary'),
      clearButton,
    )}
  {/snippet}
  {@render section(i18n.t('options.sectionExtension'), extension)}

  {#snippet terminalAi()}
    {#snippet mcpControl()}
      <div class="flex items-center gap-2">
        {#if mcp.versionMismatch}
          <button
            type="button"
            data-action="mcp-outdated"
            class="grid size-7 place-items-center rounded-btn text-amber-500 hover:bg-line"
            aria-label={i18n.t('options.mcpOutdatedTooltip')}
            title={i18n.t('options.mcpOutdatedTooltip')}
            onclick={() => (outdatedOpen = true)}><TriangleAlert size={16} /></button
          >
        {/if}
        <button
          type="button"
          data-action="mcp-toggle"
          class="rounded-btn border border-line px-3 py-1 font-medium hover:bg-line"
          onclick={() => void toggleMcp()}
          >{mcp.intent ? i18n.t('options.mcpDisconnect') : i18n.t('options.mcpConnect')}</button
        >
      </div>
    {/snippet}
    {@render row(i18n.t('options.rowMcpServer'), i18n.t('options.mcpServerSecondary'), mcpControl)}
    {#if showPrompt && prompt}
      <div class="px-4 py-3"><McpPrompt {prompt} /></div>
    {/if}
  {/snippet}
  {@render section(i18n.t('options.sectionTerminalAi'), terminalAi)}
</main>

{#if outdatedOpen}
  <Dialog
    title={i18n.t('options.mcpOutdatedTitle')}
    message={i18n.t('options.mcpOutdatedBody', [
      mcp.serverVersion ?? i18n.t('options.mcpVersionUnknown'),
      MIN_MCP_SERVER_VERSION,
    ])}
    close={() => (outdatedOpen = false)}
  />
{/if}

{#if confirming}
  <Dialog
    title={i18n.t('options.savedEditsConfirmTitle')}
    message={i18n.t('options.savedEditsConfirmBody')}
    buttons={{ cancel: i18n.t('dialog.cancel'), confirm: i18n.t('dialog.confirm') }}
    close={(ok) => {
      confirming = false;
      // storage only: a tab with iodob on keeps its edits in memory (Q7, as legacy)
      if (ok) void clearAllPersistedEdits();
    }}
  />
{/if}
