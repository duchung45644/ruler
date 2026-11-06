<script lang="ts">
  import { i18n } from '#i18n';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import { sendToBackground } from '../../lib/messaging';
  import McpPrompt from '../../ui/McpPrompt.svelte';
  import { mcp, setStatus } from './dock.svelte';

  // port of renderMcpPopover (content.js:31171), without agent logos (Q7 b)
  const s = $derived(mcp.status);
  let prompt = $state<string | null>(null);
  let busy = $state(false);

  $effect(() => {
    if (s.connected || prompt) return;
    void sendToBackground('mcp_prompt').then(
      (p) => (prompt = p ?? null),
      () => {},
    );
  });

  async function run(type: 'mcp_connect' | 'mcp_disconnect') {
    busy = true;
    try {
      setStatus(await sendToBackground(type).catch(() => null));
    } finally {
      busy = false;
    }
  }
  const btn = 'rounded-btn border border-line px-3 py-1 text-[12px] font-medium hover:bg-line';
</script>

<div class="flex w-[300px] flex-col gap-2 text-[12px]" data-mcp-popover>
  <div class="text-[13px] font-semibold">{i18n.t('mcp.dockTitle')}</div>
  {#if s.connected}
    <div class="flex items-baseline justify-between gap-2">
      <span class="truncate font-medium" data-mcp-agent
        >{s.client?.name || i18n.t('mcp.unknownAgent')}</span
      >
      {#if s.client?.version}<span class="font-mono text-fg-muted">{s.client.version}</span>{/if}
    </div>
    {#if s.serverVersion}
      <div class="font-mono text-fg-muted">MCP {s.serverVersion}</div>
    {/if}
    {#if s.versionMismatch}
      <div class="flex items-center gap-1.5 text-amber-500" data-mcp-outdated>
        <TriangleAlert size={14} />{i18n.t('mcp.outdated')}
      </div>
    {/if}
    <button
      type="button"
      class={btn}
      data-action="mcp-disconnect"
      disabled={busy}
      onclick={() => void run('mcp_disconnect')}>{i18n.t('options.mcpDisconnect')}</button
    >
  {:else}
    {#if prompt}<McpPrompt {prompt} />{/if}
    {#if s.waiting}
      <div class="text-fg-muted" data-mcp-waiting>{i18n.t('mcp.waitingForAgent')}</div>
    {/if}
    <button
      type="button"
      class={btn}
      data-action={s.intent ? 'mcp-disconnect' : 'mcp-connect'}
      disabled={busy}
      onclick={() => void run(s.intent ? 'mcp_disconnect' : 'mcp_connect')}
      >{s.intent ? i18n.t('options.mcpDisconnect') : i18n.t('options.mcpConnect')}</button
    >
  {/if}
</div>
