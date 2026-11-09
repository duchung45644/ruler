/** MCP dock button and popover state (1.46, 1.50, 10.06, 10.07, 9.30). */
import { dockState, IDLE_STATUS, type McpStatus } from '../../lib/mcp/status';
import { sendToBackground, type ContentApi, type Handlers } from '../../lib/ext/messaging';
import { mcpIntent } from '../../lib/ext/settings';
import { items, registerItem, togglePopover, type MessageKey } from '../core/registry.svelte';
import { onStop } from '../core/session';
import { state } from '../core/state.svelte';
import McpIcon from './McpIcon.svelte';
import McpPopover from './McpPopover.svelte';

export const mcp = $state({ status: IDLE_STATUS as McpStatus });

/** Tooltip per dock state; the agent's name shows in the popover (Q7 b: no logos). */
const LABELS: Record<ReturnType<typeof dockState>, MessageKey> = {
  idle: 'mcp.connectAgent',
  waiting: 'mcp.waiting',
  connected: 'mcp.connected',
  outdated: 'mcp.outdated',
};

export function setStatus(s: McpStatus | undefined | null): void {
  if (!s || typeof s !== 'object') return;
  mcp.status = s;
  const item = items.find((i) => i.id === 'mcp');
  if (item) item.label = LABELS[dockState(s)]; // items are $state: the button follows
}

export const refreshStatus = (): Promise<void> =>
  sendToBackground('mcp_status').then(setStatus, () => {});

export const mcpDockHandlers: Handlers<ContentApi> = {
  mcp_status(s) {
    if (state.active && !state.inFrame) setStatus(s);
  },
};

/** Top page only: the dock button, then follow the background and the stored intent. */
export function initMcpDock(): void {
  if (state.inFrame) return;
  registerItem({
    id: 'mcp',
    icon: McpIcon,
    label: LABELS[dockState(mcp.status)],
    popover: McpPopover,
    run: () => togglePopover('mcp'), // one popover at a time (1.50)
  });
  setStatus(mcp.status);
  void refreshStatus();
  onStop(mcpIntent.watch(() => void refreshStatus()));
}
