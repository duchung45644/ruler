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
  withTimeout,
  type BackgroundApi,
  type Handlers,
} from '../lib/ext/messaging';
import { ensureToken, mcpAutoEnable, mcpIntent, mcpToken } from '../lib/ext/settings';
import { fetchStylesheet, isAllowedStylesheetUrl } from '../lib/ext/stylesheet-fetch';
import { isInjectable } from '../lib/ext/tabs';
import { McpSocket, type McpSocketOptions } from './mcp-socket';
import { activateTab } from './panels';

let socket: McpSocket | null = null;
let intent = false;
let status: McpStatus = IDLE_STATUS;
const onCall: McpSocketOptions['onCall'] = (c, reply) =>
  void handleCall(c.command, c.payload).then(reply, (e: unknown) =>
    reply({ ok: false, error: String((e as Error)?.message ?? e) }),
  );

/** Is PixelLens on in this tab's top frame? Only those tabs see MCP at all (Q4 a). */
export async function isPixelLensTab(tabId: number): Promise<boolean> {
  const r = await sendToFrame(tabId, 0, 'ping').catch(() => undefined);
  return r?.active === true;
}

/** Web-page tabs (PixelLens can run there) with whether it is on, in tab order. */
async function injectableTabs(): Promise<{ tab: Browser.tabs.Tab; on: boolean }[]> {
  const tabs = (await browser.tabs.query({})).filter(
    (t) => t.id !== undefined && !t.discarded && isInjectable(t.url),
  );
  const on = await Promise.all(tabs.map((t) => isPixelLensTab(t.id!)));
  return tabs.map((tab, i) => ({ tab, on: on[i]! }));
}

/** Tabs with PixelLens on, in tab order. */
export async function pixelLensTabs(): Promise<Browser.tabs.Tab[]> {
  return (await injectableTabs()).filter((t) => t.on).map((t) => t.tab);
}

// ---------------------------------------------------------------- agent turns PixelLens on

/** Turns PixelLens on in a tab the way the toolbar icon does (set by the background entry). */
let enableTab: ((tabId: number) => Promise<void>) | null = null;
export function setTabEnabler(fn: (tabId: number) => Promise<void>): void {
  enableTab = fn;
}

/** The user's switch is on and `<all_urls>` is still granted (both are needed to inject anywhere). */
export async function agentMayEnable(): Promise<boolean> {
  if (!(await mcpAutoEnable.getValue().catch(() => false))) return false;
  return browser.permissions.contains({ origins: ['<all_urls>'] }).catch(() => false);
}

const ENABLE_WAIT_MS = 5000;

/** Turn PixelLens on in the tab (no-op when on); resolves once the page answers. */
async function turnOn(tabId: number): Promise<CallOutcome> {
  const tab = await browser.tabs.get(tabId).catch(() => undefined);
  if (!tab) return fail(`No tab with id ${tabId}.`);
  if (!isInjectable(tab.url)) return fail(ERR.notInjectable);
  if (await isPixelLensTab(tabId)) return { ok: true, data: { success: true, alreadyOn: true } };
  if (!(await agentMayEnable())) return fail(ERR.autoEnableOff);
  if (!enableTab) return fail('PixelLens is starting up; try again.');
  try {
    await enableTab(tabId);
  } catch (e) {
    return fail(`Could not turn PixelLens on: ${String((e as Error)?.message ?? e)}`);
  }
  const end = Date.now() + ENABLE_WAIT_MS;
  while (Date.now() < end) {
    if (await isPixelLensTab(tabId)) return { ok: true, data: { success: true, alreadyOn: false } };
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return fail('PixelLens did not start on this tab in time; try again.');
}

/** Status → every PixelLens tab and the settings page (10.03). The token is never in it. */
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
 * frame of a tab where PixelLens is on (the dock popover).
 */
export async function prompt(sender: Browser.runtime.MessageSender): Promise<string | null> {
  if (sender.id !== browser.runtime.id) return null;
  const tabId = sender.tab?.id;
  if (tabId === undefined) {
    if (!sender.url?.startsWith(browser.runtime.getURL('/'))) return null;
  } else if (sender.frameId !== 0 || !(await isPixelLensTab(tabId))) return null;
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

/** Wait for PixelLens to come back in a tab that is reloading after exit_responsive_mode. */
async function waitForReload(tabId: number): Promise<boolean> {
  const at = reloading.get(tabId);
  if (at === undefined || Date.now() - at > RELOAD_WINDOW_MS) {
    reloading.delete(tabId);
    return false;
  }
  const end = Date.now() + RELOAD_WAIT_MS;
  while (Date.now() < end) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    if (await isPixelLensTab(tabId)) return true;
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
  if (!(await isPixelLensTab(tabId)) && !(await waitForReload(tabId))) {
    // the user allowed it: turn PixelLens on instead of failing (e.g. after a click navigated)
    if (!(await agentMayEnable())) return fail(ERR.tabInactiveHint);
    const on = await turnOn(tabId);
    if (!on.ok) return on;
  }
  if (type === 'exit_responsive_mode') reloading.set(tabId, Date.now());
  const ms = SLOW_TYPES.includes(type) ? SLOW_TIMEOUT_MS : CALL_TIMEOUT_MS;
  return withTimeout(
    sendToFrame(tabId, 0, 'mcp_call', type, payload).then(
      (v) => v ?? fail('Empty response from content script.'),
      () => fail(ERR.tabInactiveHint), // tab closed or navigated mid-call
    ),
    ms,
    () => fail(timeoutError(type)),
  );
}

async function listTabs(): Promise<CallOutcome> {
  const all = await agentMayEnable();
  const tabs = (await injectableTabs()).filter((t) => all || t.on);
  return {
    ok: true,
    data: {
      tabs: tabs.map(({ tab: t, on }) => ({
        tabId: t.id!,
        title: t.title ?? null,
        url: t.url ?? null,
        active: !!t.active,
        enabled: on,
      })),
      // tells the agent whether it may turn PixelLens on by itself
      canEnable: all,
    },
  };
}

async function focusTab({ tabId }: McpPayloads['focus_tab']): Promise<CallOutcome> {
  if (!(await isPixelLensTab(tabId))) return fail(ERR.tabInactive);
  try {
    await activateTab(tabId);
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
    case 'enable_tab':
      return turnOn((p as McpPayloads['enable_tab']).tabId);
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
