/**
 * Page side of MCP (10.10, 10.16): the one `mcp_call` entry, answered by the top frame with
 * PixelLens on. Port of the MCP branches of Wg (content.js:21404) and its Ag / Cg / Ig routing sets:
 * page commands run in the top page; element and edit commands run in the responsive frame
 * holding the selection (or `viewportId`) while responsive mode is on; responsive commands and
 * the screenshot never run inside a frame.
 */
import { browser, type Browser } from '#imports';
import { ERR, type CallOutcome, type McpPageType } from '../../lib/mcp/protocol';
import type { ContentApi, Handlers } from '../../lib/ext/messaging';
import { state } from '../core/state.svelte';
import { allFramesMcpCall, frameMcpCall } from '../responsive/shell.svelte';
import { McpFail, type Commands } from './command';
import { editCommands } from './edits';
import { elementCommands } from './elements';
import { pageCommands } from './page';
import { responsiveCommands } from './responsive';

const COMMANDS: Commands = {
  ...pageCommands,
  ...elementCommands,
  ...editCommands,
  ...responsiveCommands,
};

/** Top page only (Ig + the screenshot). */
const TOP_ONLY = new Set<string>([...Object.keys(responsiveCommands)]);
/** Page-level commands (Ag): always the top page, even when responsive. */
const PAGE_LEVEL = new Set<string>([
  'get_page_info',
  'get_breakpoints',
  'get_seo_issues',
  'get_meta_tags',
  'get_page_weight',
  'get_css_custom_properties',
  'calculate_specificity',
  'detect_technologies',
  'get_a11y_issues',
]);
/** Shell → frame call budget; the background gives up at 12s. */
const FRAME_MS = 10_000;

async function runHere(type: McpPageType, payload: unknown): Promise<CallOutcome> {
  const run = COMMANDS[type] as ((p: unknown) => unknown) | undefined;
  if (!run) return { ok: false, error: ERR.unknown };
  try {
    return { ok: true, data: (await run(payload)) ?? null };
  } catch (e) {
    if (e instanceof McpFail) return { ok: false, error: e.message };
    console.error(`[pixellens] mcp "${type}" failed`, e);
    return { ok: false, error: String((e as Error)?.message ?? e) };
  }
}

const NAMESPACED = /^v(\d+):(.+)$/;

/** Responsive mode, top page: send element / edit commands to the frames (10.08). */
async function inFrames(type: McpPageType, payload: Record<string, unknown>): Promise<CallOutcome> {
  if (type === 'get_my_edits') {
    const all = await allFramesMcpCall(type, payload, FRAME_MS);
    const ruleChanges: unknown[] = [];
    const htmlChanges: unknown[] = [];
    for (const { viewportId, label, outcome } of all) {
      if (!outcome.ok) continue;
      const d = outcome.data as { ruleChanges?: object[]; htmlChanges?: object[] };
      const tag = <T extends object>(c: T) => ({
        ...c,
        ...('recordId' in c && { recordId: `v${viewportId}:${String(c.recordId)}` }),
        viewportId,
        viewport: label,
      });
      ruleChanges.push(...(d.ruleChanges ?? []).map(tag));
      htmlChanges.push(...(d.htmlChanges ?? []).map(tag));
    }
    return { ok: true, data: { ruleChanges, htmlChanges } };
  }
  if (type === 'revert_all_edits') {
    const all = await allFramesMcpCall(type, payload, FRAME_MS);
    const failed = all.filter((r) => !r.outcome.ok);
    return failed.length
      ? { ok: false, error: `revert_all_edits failed in viewport ${failed[0]!.viewportId}.` }
      : { ok: true, data: { success: true } };
  }
  if (type === 'revert_css_change') {
    const m = NAMESPACED.exec(String(payload.changeId));
    if (m) return frameMcpCall(type, { ...payload, changeId: m[2] }, Number(m[1]), FRAME_MS);
  }
  const vp = typeof payload.viewportId === 'number' ? payload.viewportId : undefined;
  return frameMcpCall(type, payload, vp, FRAME_MS);
}

/** Run one validated command; every outcome is an answer, never a throw. */
export async function runMcp(type: McpPageType, payload: unknown): Promise<CallOutcome> {
  if (!state.active) return { ok: false, error: ERR.pageInactive };
  if (state.inFrame) {
    // a responsive frame: only what the shell forwards, never responsive commands (10.16)
    if (TOP_ONLY.has(type) || PAGE_LEVEL.has(type))
      return { ok: false, error: 'This command runs in the top page only.' };
    return runHere(type, payload);
  }
  if (state.responsiveOn && !TOP_ONLY.has(type) && !PAGE_LEVEL.has(type))
    return inFrames(type, (payload ?? {}) as Record<string, unknown>);
  return runHere(type, payload);
}

/** Only the background worker relays MCP commands (from the authenticated socket). */
export function fromBackground(sender: Browser.runtime.MessageSender): boolean {
  if (sender.tab || sender.id !== browser.runtime.id) return false;
  return !sender.url || sender.url === browser.runtime.getURL('/background.js');
}

export const mcpHandlers: Handlers<ContentApi> = {
  mcp_call(type, payload, sender) {
    if (!fromBackground(sender)) return { ok: false, error: ERR.unknown };
    // the top frame answers; responsive frames get theirs from the shell (frameMcpCall)
    if (window !== window.top || state.inFrame) return { ok: false, error: ERR.pageInactive };
    return runMcp(type, payload);
  },
};
