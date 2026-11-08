<script lang="ts">
  import { i18n } from '#i18n';
  import Check from '@lucide/svelte/icons/check';
  import Copy from '@lucide/svelte/icons/copy';
  import { copyText } from '../lib/ext/clipboard';

  /** The copy prompt (with the pairing token) for the agent, and its copy button (10.07). */
  let { prompt }: { prompt: string } = $props();
  let copied = $state(false);
  let timer = 0;
  $effect(() => () => clearTimeout(timer));

  async function copy() {
    if (!(await copyText(prompt))) return;
    copied = true;
    clearTimeout(timer);
    timer = window.setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="flex flex-col gap-1.5">
  <span class="text-[12px] text-fg-muted">{i18n.t('mcp.connectHint')}</span>
  <div class="flex items-start gap-1.5">
    <code
      data-mcp-prompt
      class="max-h-24 min-w-0 flex-1 overflow-auto rounded-btn border border-line px-2 py-1 font-mono text-[11px] break-all select-all"
      >{prompt}</code
    >
    <button
      type="button"
      data-action="mcp-copy"
      class="grid size-7 shrink-0 place-items-center rounded-btn border border-line hover:bg-line"
      aria-label={i18n.t('dock.copy')}
      title={i18n.t('dock.copy')}
      onclick={() => void copy()}
    >
      {#if copied}<Check size={14} />{:else}<Copy size={14} />{/if}
    </button>
  </div>
</div>
