<script lang="ts">
  import { i18n } from '#i18n';
  import { offGrid, type AuditRow } from '../../../lib/audit';
  import { copyText } from '../../../lib/clipboard';
  import ToolPanel from '../../../ui/ToolPanel.svelte';
  import { state as app } from '../../core/state.svelte';
  import { audit, highlight, rescan, setOn, type AuditTab } from '.';

  // Port of openAuditPanel (unpacked/scripts/bd/audit.js:80).
  const TABS = ['colors', 'fonts', 'spacing'] as const;
  let tab = $state<AuditTab>('colors');
  let sel: AuditRow | null = $state.raw(null);
  let all = $state.raw(audit.rows); // raw: element sets must not become proxies
  const rows = $derived(all[tab]);
  const label = (it: AuditRow) => (tab === 'spacing' ? `${it.key}px` : it.key);
  const tip = (it: AuditRow) =>
    tab === 'colors'
      ? [...(it.uses ?? [])].join(', ')
      : tab === 'fonts'
        ? [...(it.variants ?? [])].sort().join('\n')
        : label(it);
  const off = $derived(tab === 'spacing' ? offGrid(rows) : 0);

  function reset() {
    sel = null;
    highlight(null);
  }
  function refresh() {
    rescan();
    sel = null;
    all = audit.rows;
  }
  function rowKey(e: KeyboardEvent, it: AuditRow) {
    if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    pick(it);
  }
  function pick(it: AuditRow) {
    sel = sel === it ? null : it;
    highlight(sel);
  }
</script>

<div style:display={app.paused ? 'none' : undefined}>
  <ToolPanel title={i18n.t('audit.title')} onclose={() => setOn(false)}>
    {#snippet actions()}
      <button
        type="button"
        class="rounded-btn px-1 hover:bg-line"
        title={i18n.t('audit.allTitle')}
        onclick={() => copyText(rows.map(label).join('\n'))}>⧉ {i18n.t('audit.all')}</button
      >
      <button
        type="button"
        class="rounded-btn px-1 hover:bg-line"
        title={i18n.t('audit.rescan')}
        aria-label={i18n.t('audit.rescan')}
        onclick={refresh}>↻</button
      >
    {/snippet}
    <div class="mb-2 flex gap-1">
      {#each TABS as k (k)}
        <button
          type="button"
          class="field flex-1"
          class:text-accent={k === tab}
          aria-pressed={k === tab}
          onclick={() => ((tab = k), reset())}>{i18n.t(`audit.${k}`)} ({all[k].length})</button
        >
      {/each}
    </div>
    {#if !rows.length}
      <p class="text-fg-muted">{i18n.t('audit.empty')}</p>
    {/if}
    {#if off}
      <p class="mb-1 text-fg-muted">{i18n.t('audit.offGrid', [String(off)])}</p>
    {/if}
    <div class="flex flex-col gap-[2px]">
      {#each rows as it (it.key)}
        <div
          role="button"
          tabindex="0"
          class="flex cursor-pointer items-center gap-2 rounded-btn px-2 py-1 hover:bg-line"
          class:bg-line={sel === it}
          title={i18n.t('audit.highlight')}
          onclick={() => pick(it)}
          onkeydown={(e) => rowKey(e, it)}
        >
          {#if tab === 'colors'}
            <span
              class="h-[14px] w-[14px] shrink-0 rounded-btn border border-line"
              style:background={it.key}
            ></span>
          {/if}
          <span
            class="min-w-0 flex-1 truncate font-mono"
            style:color={tab === 'spacing' && Number(it.key) % 4 !== 0 ? '#E5484D' : undefined}
            title={tip(it)}>{label(it)}</span
          >
          <span class="text-fg-muted">{it.els.size}</span>
          <button
            type="button"
            class="rounded-btn px-1 hover:bg-surface"
            title={i18n.t('audit.copy')}
            aria-label={i18n.t('audit.copy')}
            onclick={(e) => (e.stopPropagation(), copyText(label(it)))}>⧉</button
          >
        </div>
      {/each}
    </div>
  </ToolPanel>
</div>
