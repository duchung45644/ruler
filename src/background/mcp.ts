/**
 * MCP in the background (Đợt 8): the socket's lifecycle, the status every page shows, and the
 * command router. Legacy: background.js:2322 (F), :2810 (V), :2919 (`target: 'mcp'`, removed).
 */
import { browser, type Browser } from '#imports';
import {
  CALL_TIMEOUT_MS,
  connectPrompt,
  ERR,
  SLOW_TIMEOUT_MS,
  SLOW_TYPES,
  timeoutError,
  validateCall,
  type CallOutcome,
  type McpPageType,
  type McpPayloads,
} from '../lib/mcp/protocol';
import { tailwindClasses } from '../lib/css/tailwind';
import { IDLE_STATUS, toStatus, type McpStatus } from '../lib/mcp/status';
import {
  sendToFrame,
  sendToOptions,
  type BackgroundApi,
  type Handlers,
} from '../lib/ext/messaging';
import { ensureToken, mcpIntent, mcpToken } from '../lib/ext/settings';
import { fetchStylesheet, isAllowedStylesheetUrl } from '../lib/ext/stylesheet-fetch';
import { isInjectable } from '../lib/ext/tabs';
import { McpSocket, type McpSocketOptions } from './mcp-socket';

let socket: McpSocket | null = null;
let intent = false;
let status: McpStatus = IDLE_STATUS;
const onCall: McpSocketOptions['onCall'] = (c, reply) =>
  void handleCall(c.command, c.payload).then(reply, (e: unknown) =>
    reply({ ok: false, error: String((e as Error)?.message ?? e) }),
  );

export const mcpStatus = (): McpStatus => status;

/** Is iodob on in this tab's top frame? Only those tabs see MCP at all (Q4 a). */
export async function isIodobTab(tabId: number): Promise<boolean> {
  const r = await sendToFrame(tabId, 0, 'ping').catch(() => undefined);
  return r?.active === true;
}

/** Tabs with iodob on, in tab order. */
export async function iodobTabs(): Promise<Browser.tabs.Tab[]> {
  const tabs = (await browser.tabs.query({})).filter(
    (t) => t.id !== undefined && !t.discarded && isInjectable(t.url),
  );
  const on = await Promise.all(tabs.map((t) => isIodobTab(t.id!)));
  return tabs.filter((_, i) => on[i]);
}

/** Status → every iodob tab and the settings page (10.03). The token is never in it. */
async function broadcast(s: McpStatus): Promise<void> {
  void sendToOptions('mcp_status', s).catch(() => {});
  const tabs = await browser.tabs.query({}).catch(() => []);
  for (const t of tabs)
    if (t.id !== undefined && isInjectable(t.url))
      void sendToFrame(t.id, 0, 'mcp_status', s).catch(() => {});
}

function update(): void {
  const next = toStatus(
    intent,
    socket?.snapshot ?? { state: 'idle', serverVersion: null, client: null },
  );
  if (JSON.stringify(next) === JSON.stringify(status)) return;
  status = next;
  void broadcast(next);
}

function ensureSocket(): McpSocket {
  socket ??= new McpSocket({
    token: ensureToken,
    extVersion: browser.runtime.getManifest().version,
    onCall,
    onChange: update,
  });
  return socket;
}

/** Follow the stored intent: on → dial (unless already), off → close now. */
function applyIntent(on: boolean, retryNow = false): void {
  const was = intent;
  intent = on;
  if (on) {
    if (!was || retryNow || socket?.snapshot.state === 'idle') ensureSocket().start();
  } else socket?.stop();
  update();
}

export async function connect(): Promise<McpStatus> {
  await ensureToken();
  await mcpIntent.setValue(true);
  applyIntent(true, true); // a pressed Connect retries at once (Q5), even after a reject
  return status;
}

export async function disconnect(): Promise<McpStatus> {
  await mcpIntent.setValue(false);
  applyIntent(false);
  return status;
}

/**
 * Prompt with the token (Q3 a), only for our own pages: the settings page (no tab) or the top
 * frame of a tab where iodob is on (the dock popover).
 */
export async function prompt(sender: Browser.runtime.MessageSender): Promise<string | null> {
  if (sender.id !== browser.runtime.id) return null;
  const tabId = sender.tab?.id;
  if (tabId === undefined) {
    if (!sender.url?.startsWith(browser.runtime.getURL('/'))) return null;
  } else if (sender.frameId !== 0 || !(await isIodobTab(tabId))) return null;
  const token = (await mcpToken.getValue()) ?? (await ensureToken());
  return connectPrompt(token, browser.runtime.id);
}

/** Worker start: reconnect when the user left MCP on (10.04); follow changes from elsewhere. */
export function initMcp(): void {
  let changed = false; // a change seen first beats the (older) startup read
  mcpIntent.watch((on) => {
    changed = true;
    applyIntent(on === true);
  });
  void mcpIntent.getValue().then(
    (on) => changed || applyIntent(on),
    () => {},
  );
}

export const mcpHandlers: Pick<
  Handlers<BackgroundApi>,
  'mcp_status' | 'mcp_connect' | 'mcp_disconnect' | 'mcp_prompt'
> = {
  mcp_status: () => status,
  mcp_connect: () => connect(),
  mcp_disconnect: () => disconnect(),
  mcp_prompt: (sender) => prompt(sender),
};

// ---------------------------------------------------------------- router

/** Legacy N / j: a tab that left responsive mode reloads; calls wait for it (10.02). */
const RELOAD_WINDOW_MS = 15_000;
const RELOAD_WAIT_MS = 10_000;
const POLL_MS = 250;
const reloading = new Map<number, number>();

const fail = (error: string): CallOutcome => ({ ok: false, error });

/** Wait for iodob to come back in a tab that is reloading after exit_responsive_mode. */
async function waitForReload(tabId: number): Promise<boolean> {
  const at = reloading.get(tabId);
  if (at === undefined || Date.now() - at > RELOAD_WINDOW_MS) {
    reloading.delete(tabId);
    return false;
  }
  const end = Date.now() + RELOAD_WAIT_MS;
  while (Date.now() < end) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    if (await isIodobTab(tabId)) return true;
  }
  return false;
}

/** Port of q / V (background.js:2810): one command into the tab's top frame, with a timeout. */
export async function forwardToTab(
  type: McpPageType,
  payload: { tabId: number },
): Promise<CallOutcome> {
  const { tabId } = payload;
  const tab = await browser.tabs.get(tabId).catch(() => undefined);
  if (!tab) return fail(`No tab with id ${tabId}.`);
  if (!(await isIodobTab(tabId)) && !(await waitForReload(tabId))) return fail(ERR.tabInactiveHint);
  if (type === 'exit_responsive_mode') reloading.set(tabId, Date.now());
  const ms = SLOW_TYPES.includes(type) ? SLOW_TIMEOUT_MS : CALL_TIMEOUT_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<CallOutcome>(
    (res) => (timer = setTimeout(() => res(fail(timeoutError(type))), ms)),
  );
  try {
    const r = await Promise.race([
      sendToFrame(tabId, 0, 'mcp_call', type, payload).then(
        (v) => v ?? fail('Empty response from content script.'),
        () => fail(ERR.tabInactiveHint), // tab closed or navigated mid-call
      ),
      timeout,
    ]);
    return r;
  } finally {
    clearTimeout(timer);
  }
}

async function listTabs(): Promise<CallOutcome> {
  const tabs = await iodobTabs();
  return {
    ok: true,
    data: {
      tabs: tabs.map((t) => ({
        tabId: t.id!,
        title: t.title ?? null,
        url: t.url ?? null,
        active: !!t.active,
      })),
    },
  };
}

async function focusTab({ tabId }: McpPayloads['focus_tab']): Promise<CallOutcome> {
  if (!(await isIodobTab(tabId))) return fail(ERR.tabInactive);
  try {
    const tab = await browser.tabs.update(tabId, { active: true });
    if (tab?.windowId !== undefined) await browser.windows.update(tab.windowId, { focused: true });
    return { ok: true, data: { success: true } };
  } catch (e) {
    return fail(String((e as Error)?.message ?? e));
  }
}

async function stylesheet({ url }: McpPayloads['fetch_stylesheet']): Promise<CallOutcome> {
  if (!isAllowedStylesheetUrl(url)) return fail(ERR.stylesheetBlocked);
  const r = await fetchStylesheet(url);
  return r.ok ? { ok: true, data: { text: r.text, finalUrl: r.finalUrl } } : fail(r.error);
}

/**
 * Port of F (background.js:2322) for an authenticated call: validate, then answer here or in the
 * tab. There is no other way in (the legacy `runtime.onMessage` `target: 'mcp'` path is gone).
 */
export async function handleCall(type: string, payload: unknown): Promise<CallOutcome> {
  const v = validateCall(type, payload);
  if (!v.ok) return fail(v.error);
  const p = v.payload;
  switch (type) {
    case 'list_tabs':
      return listTabs();
    case 'focus_tab':
      return focusTab(p as McpPayloads['focus_tab']);
    case 'fetch_stylesheet':
      return stylesheet(p as McpPayloads['fetch_stylesheet']);
    case 'get_tailwind': {
      // the content script returns only `css`; the converter lives here, not in content.js
      const r = await forwardToTab('get_tailwind', p as { tabId: number });
      if (!r.ok) return r;
      const { css } = r.data as { css: Record<string, string> };
      return { ok: true, data: { tailwind: tailwindClasses(css), css } };
    }
    default:
      return forwardToTab(type as McpPageType, p as { tabId: number });
  }
}

/** Tests only. */
export function resetMcp(): void {
  reloading.clear();
  socket?.stop();
  socket = null;
  intent = false;
  status = IDLE_STATUS;
}
