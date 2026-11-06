/**
 * Page side of MCP (10.10, 10.16): the one `mcp_call` entry, answered by the top frame with
 * Bo doi on. Port of the MCP branches of Wg (content.js:21404) and its Ag / Cg / Ig routing sets.
 */
import { browser, type Browser } from '#imports';
import { ERR, type CallOutcome, type McpPageType } from '../../lib/mcp/protocol';
import type { ContentApi, Handlers } from '../../lib/messaging';
import { state } from '../core/state.svelte';
import { McpFail, type Commands } from './command';
import { elementCommands } from './elements';
import { pageCommands } from './page';

const COMMANDS: Commands = { ...pageCommands, ...elementCommands };

/** Run one validated command here; every outcome is an answer, never a throw. */
export async function runMcp(type: McpPageType, payload: unknown): Promise<CallOutcome> {
  if (!state.active) return { ok: false, error: ERR.pageInactive };
  const run = COMMANDS[type] as ((p: unknown) => unknown) | undefined;
  if (!run) return { ok: false, error: ERR.unknown };
  try {
    return { ok: true, data: (await run(payload)) ?? null };
  } catch (e) {
    if (e instanceof McpFail) return { ok: false, error: e.message };
    console.error(`[bo-doi] mcp "${type}" failed`, e);
    return { ok: false, error: String((e as Error)?.message ?? e) };
  }
}

/** Only the background worker relays MCP commands (from the authenticated socket). */
export function fromBackground(sender: Browser.runtime.MessageSender): boolean {
  if (sender.tab || sender.id !== browser.runtime.id) return false;
  return !sender.url || sender.url === browser.runtime.getURL('/background.js');
}

export const mcpHandlers: Handlers<ContentApi> = {
  mcp_call(type, payload, sender) {
    if (!fromBackground(sender)) return { ok: false, error: ERR.unknown };
    // page-level commands only answer in the top frame (Ag); frames get theirs from the shell
    if (window !== window.top || state.inFrame) return { ok: false, error: ERR.pageInactive };
    return runMcp(type, payload);
  },
};
