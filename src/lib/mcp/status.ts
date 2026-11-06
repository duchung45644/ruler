/** Connection state shown by the dock button, its popover and the settings row (10.03, 10.06). */
import { isOutdated, type AgentInfo } from './protocol';

export interface McpStatus {
  /** The user pressed Connect (stored `mcpIntent`). */
  intent: boolean;
  /** Welcome received: the agent can call commands. */
  connected: boolean;
  /** Intent on, no server yet (dialling or backing off). */
  waiting: boolean;
  /** The server refused our token: show the prompt again (it may hold an old token). */
  rejected: boolean;
  /** Connected to a server older than MIN_MCP_SERVER_VERSION, or with no usable version. */
  versionMismatch: boolean;
  serverVersion: string | null;
  client: AgentInfo | null;
}

export const IDLE_STATUS: McpStatus = {
  intent: false,
  connected: false,
  waiting: false,
  rejected: false,
  versionMismatch: false,
  serverVersion: null,
  client: null,
};

export function toStatus(
  intent: boolean,
  s: { state: string; serverVersion: string | null; client: AgentInfo | null },
): McpStatus {
  const connected = s.state === 'open';
  return {
    intent,
    connected,
    waiting: intent && (s.state === 'connecting' || s.state === 'handshake'),
    rejected: s.state === 'rejected',
    versionMismatch: connected && isOutdated(s.serverVersion),
    serverVersion: connected ? s.serverVersion : null,
    client: connected ? s.client : null,
  };
}

/** Dock dot / tooltip state. */
export type McpDockState = 'idle' | 'waiting' | 'connected' | 'outdated';
export const dockState = (s: McpStatus): McpDockState =>
  s.connected ? (s.versionMismatch ? 'outdated' : 'connected') : s.intent ? 'waiting' : 'idle';
