/** Shared plumbing of the page-side MCP commands. */
import type { McpPageType, McpPayloads } from '../../lib/mcp/protocol';
import { elementById } from '../sidepanel/bridge.svelte';

/** A command failure: its message goes to the agent verbatim. */
export class McpFail extends Error {}
export const fail = (message: string): never => {
  throw new McpFail(message);
};

export type Commands = {
  [K in McpPageType]?: (p: McpPayloads[K]) => unknown;
};

/** A live element by id, or the given error. */
export function elementOf(id: string, error = `No element found with id ${id}.`): Element {
  const el = elementById(id);
  return el?.isConnected ? el : fail(error);
}
