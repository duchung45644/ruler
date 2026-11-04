<script lang="ts">
  import { i18n } from '#i18n';
  import FileDiff from '@lucide/svelte/icons/file-diff';
  import { toPage } from '../store.svelte';
  import ChangeGroup, { type Group } from './ChangeGroup.svelte';
  import ConfirmDialog, { askConfirm, showAlert } from './ConfirmDialog.svelte';
  import { loadChanges, strict, takeState, type Changes } from './edit-store.svelte';

  let { changes }: { changes: Changes } = $props();

  // one group per element (6.44); a rule lands under the first element it was edited on
  const groups = $derived.by(() => {
    const out: Group[] = [];
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- built fresh inside the derived
    const byId = new Map<string, Group>();
    const of = (id: string, label: string) => {
      let g = byId.get(id);
      if (!g) {
        g = { id, label, rules: [], html: [] };
        out.push(g);
        byId.set(id, g);
      }
      return g;
    };
    for (const h of changes.html) of(h.id, h.selector).html.push(h);
    for (const c of changes.rules) {
      const label = c.address?.selector ?? c.source;
      const id = c.elementIds[0];
      if (id) of(id, byId.get(id)?.label ?? label).rules.push(c);
      else out.push({ id: null, label, rules: [c], html: [] });
    }
    return out;
  });
  const n = $derived(groups.length);

  const unreachable = () =>
    showAlert(i18n.t('dialog.tabUnavailableTitle'), i18n.t('dialog.tabUnavailable'));

  /** Edit replies carry the state; a failed send means the tab is gone (6.46). */
  async function run(send: () => Promise<unknown>): Promise<boolean> {
    try {
      const r = await send();
      if (r && typeof r === 'object' && 'canUndo' in r) takeState(r as never);
      return true;
    } catch {
      await unreachable();
      return false;
    }
  }

  async function select(id: string) {
    try {
      const found = await strict('select_edited_element', id);
      if (!found)
        await showAlert(i18n.t('dialog.elementNotFoundTitle'), i18n.t('dialog.noSelectedElement'));
    } catch {
      await unreachable();
    }
  }

  const hover = (id: string | null) =>
    void (id ? toPage('highlight_hovered', id) : toPage('remove_highlight_hovered'));

  async function clearElement(id: string) {
    if (!(await askConfirm(i18n.t('dialog.clearElementTitle'), i18n.t('dialog.clearElement'))))
      return;
    if (await run(() => strict('clear_elements_by_ids', [id], 'all'))) await loadChanges();
  }

  async function revert(recordId: string) {
    if (await run(() => strict('revert_rule_change', recordId))) await loadChanges();
  }

  async function clearAll() {
    if (!(await askConfirm(i18n.t('dialog.clearAllTitle'), i18n.t('dialog.clearAll')))) return;
    const ok =
      (await run(() => strict('revert_all_rule_changes'))) &&
      (await run(() => strict('clear_changes')));
    if (ok) await loadChanges();
  }
</script>

<div data-changes-tab>
  {#if groups.length}
    <div class="flex items-center gap-2 border-b border-line px-3 py-2">
      <span class="flex-1 font-medium text-fg-muted tabular-nums" data-elements-count
        >{n === 1
          ? i18n.t('changes.elementsOne')
          : i18n.t('changes.elementsOther', [String(n)])}</span
      >
      <button
        type="button"
        class="rounded-btn border border-line px-2 py-1 font-medium text-fg-muted hover:border-red-500/50 hover:text-red-400"
        data-clear-all
        onclick={clearAll}>{i18n.t('changes.clearChanges')}</button
      >
    </div>
    {#each groups as g, i (g.id ?? `rule${i}`)}
      <ChangeGroup
        group={g}
        onselect={select}
        onhover={hover}
        onclear={clearElement}
        onrevert={revert}
      />
    {/each}
  {:else}
    <div class="flex flex-col items-center gap-3 px-6 py-12 text-center" data-no-changes>
      <FileDiff class="size-8 text-fg-muted" />
      <h4 class="text-sm font-semibold text-fg-muted">{i18n.t('changes.none')}</h4>
    </div>
  {/if}
</div>
<ConfirmDialog />
