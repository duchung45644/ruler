<script lang="ts">
  import { i18n } from '#i18n';
  import MousePointerClick from '@lucide/svelte/icons/mouse-pointer-click';
  import { panel } from './store.svelte';

  // legacy Oi (sidepanel.js:13300): rows whose key is unassigned are left out
  const rows = $derived(
    [
      [i18n.t('panel.shortcutToggleRuler'), panel.shortcuts._execute_action],
      [i18n.t('panel.shortcutParent'), panel.shortcuts.select_parent],
      [i18n.t('panel.shortcutChild'), panel.shortcuts.select_child],
      [i18n.t('panel.shortcutTogglePanel'), 'P'],
      [i18n.t('panel.shortcutDeselect'), 'Esc'],
    ].filter((r): r is [string, string] => !!r[1]),
  );
</script>

<div class="flex flex-col items-center gap-4 px-6 py-12 text-center" data-empty>
  <MousePointerClick class="size-8 text-fg-muted" />
  <h4 class="text-sm font-semibold text-fg-muted">{i18n.t('panel.emptyInspect')}</h4>
  <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-left">
    {#each rows as [name, keys] (name)}
      <dt class="text-fg-muted">{name}</dt>
      <dd><kbd class="rounded border border-line px-1.5 font-mono text-[11px]">{keys}</kbd></dd>
    {/each}
  </dl>
</div>
