<script lang="ts">
  import { i18n } from '#i18n';
  import MousePointerClick from '@lucide/svelte/icons/mouse-pointer-click';
  import { panel } from '../store.svelte';

  const mod = /mac/i.test(navigator.platform) ? '⌘' : 'Ctrl';
  const rows = $derived(
    [
      [i18n.t('edit.shortcutToggleRuler'), panel.shortcuts._execute_action],
      [i18n.t('edit.shortcutUndo'), `${mod}+Z`],
      [i18n.t('edit.shortcutRedo'), `${mod}+Shift+Z`],
      [i18n.t('edit.shortcutCopy'), `${mod}+C`],
      [i18n.t('edit.shortcutPaste'), `${mod}+V`],
    ].filter((r): r is [string, string] => !!r[1]),
  );
</script>

<div class="flex flex-col items-center gap-4 px-6 py-12 text-center" data-edit-empty>
  <MousePointerClick class="size-8 text-fg-muted" />
  <h4 class="text-sm font-semibold text-fg-muted">{i18n.t('edit.emptyEdit')}</h4>
  <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-left">
    {#each rows as [name, keys] (name)}
      <dt class="text-fg-muted">{name}</dt>
      <dd><kbd class="rounded border border-line px-1.5 font-mono text-[11px]">{keys}</kbd></dd>
    {/each}
  </dl>
</div>
