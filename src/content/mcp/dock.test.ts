import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { copyText } from '../../lib/ext/clipboard';
import { IDLE_STATUS } from '../../lib/mcp/status';
import { sendToBackground } from '../../lib/ext/messaging';
import { items } from '../core/registry.svelte';
import { state } from '../core/state.svelte';
import { initMcpDock, mcp, mcpDockHandlers, setStatus } from './dock.svelte';
import McpPopover from './McpPopover.svelte';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
  sendToBackground: vi.fn(async (type: string) =>
    type === 'mcp_prompt' ? 'PROMPT PIXELLENS_MCP_TOKEN=x' : undefined,
  ),
}));
vi.mock('../../lib/ext/clipboard', () => ({ copyText: vi.fn(async () => true) }));

let app: ReturnType<typeof mount> | null = null;
beforeEach(() => {
  state.active = true;
  initMcpDock();
  setStatus(IDLE_STATUS);
});
afterEach(() => {
  if (app) unmount(app);
  app = null;
  document.body.replaceChildren();
  state.active = false;
});
const open = async () => {
  app = mount(McpPopover, { target: document.body });
  flushSync();
  await vi.waitFor(() => {
    flushSync();
    if (!mcp.status.connected) expect(document.querySelector('[data-mcp-prompt]')).not.toBeNull();
  });
};
const label = () => items.find((i) => i.id === 'mcp')!.label;

it('tooltip follows the state', () => {
  expect(label()).toBe('mcp.connectAgent');
  setStatus({ ...IDLE_STATUS, intent: true, waiting: true });
  expect(label()).toBe('mcp.waiting');
  void mcpDockHandlers.mcp_status!(
    { ...IDLE_STATUS, intent: true, connected: true, serverVersion: '1.0.0' },
    {} as never,
  );
  expect(label()).toBe('mcp.connected');
  setStatus({ ...IDLE_STATUS, intent: true, connected: true, versionMismatch: true });
  expect(label()).toBe('mcp.outdated');
});

it('idle: prompt with copy and a connect button', async () => {
  await open();
  document.querySelector<HTMLButtonElement>('[data-action="mcp-copy"]')!.click();
  expect(copyText).toHaveBeenCalledWith('PROMPT PIXELLENS_MCP_TOKEN=x');
  document.querySelector<HTMLButtonElement>('[data-action="mcp-connect"]')!.click();
  expect(sendToBackground).toHaveBeenCalledWith('mcp_connect');
});

it('waiting shows the waiting line', async () => {
  setStatus({ ...IDLE_STATUS, intent: true, waiting: true });
  await open();
  expect(document.querySelector('[data-mcp-waiting]')).not.toBeNull();
});

it('connected shows the agent, the warning and disconnect', async () => {
  setStatus({
    ...IDLE_STATUS,
    intent: true,
    connected: true,
    versionMismatch: true,
    serverVersion: '0.4.0',
    client: null,
  });
  await open();
  expect(document.querySelector('[data-mcp-agent]')!.textContent).toBe('mcp_unknownAgent');
  expect(document.querySelector('[data-mcp-outdated]')).not.toBeNull();
  expect(document.querySelector('[data-mcp-prompt]')).toBeNull();
  document.querySelector<HTMLButtonElement>('[data-action="mcp-disconnect"]')!.click();
  expect(sendToBackground).toHaveBeenCalledWith('mcp_disconnect');
});
