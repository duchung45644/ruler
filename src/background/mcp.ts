/**
 * MCP in the background (Đợt 8): the socket's lifecycle, the status every page shows, and the
 * command router. Legacy: background.js:2322 (F), :2810 (V), :2919 (`target: 'mcp'`, removed).
 */
import { browser, type Browser } from '#imports';
import { connectPrompt } from '../lib/mcp/protocol';
import { IDLE_STATUS, toStatus, type McpStatus } from '../lib/mcp/status';
import { sendToFrame, sendToOptions, type BackgroundApi, type Handlers } from '../lib/messaging';
import { ensureToken, mcpIntent, mcpToken } from '../lib/settings';
import { isInjectable } from '../lib/tabs';
import { McpSocket, type McpSocketOptions } from './mcp-socket';

let socket: McpSocket | null = null;
let intent = false;
let status: McpStatus = IDLE_STATUS;
let onCall: McpSocketOptions['onCall'] = (_c, reply) =>
  reply({ ok: false, error: 'Unknown action. Update the Bo doi extension to the latest version.' });

/** The command router plugs in here (kept apart so the socket can be tested alone). */
export function setCallHandler(h: McpSocketOptions['onCall']): void {
  onCall = h;
}

export const mcpStatus = (): McpStatus => status;

/** Is Bo doi on in this tab's top frame? Only those tabs see MCP at all (Q4 a). */
export async function isBoDoiTab(tabId: number): Promise<boolean> {
  const r = await sendToFrame(tabId, 0, 'ping').catch(() => undefined);
  return r?.active === true;
}

/** Tabs with Bo doi on, in tab order. */
export async function boDoiTabs(): Promise<Browser.tabs.Tab[]> {
  const tabs = (await browser.tabs.query({})).filter(
    (t) => t.id !== undefined && !t.discarded && isInjectable(t.url),
  );
  const on = await Promise.all(tabs.map((t) => isBoDoiTab(t.id!)));
  return tabs.filter((_, i) => on[i]);
}

/** Status → every Bo doi tab and the settings page (10.03). The token is never in it. */
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
    onCall: (c, reply, signal) => onCall(c, reply, signal),
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
 * frame of a tab where Bo doi is on (the dock popover).
 */
export async function prompt(sender: Browser.runtime.MessageSender): Promise<string | null> {
  if (sender.id !== browser.runtime.id) return null;
  const tabId = sender.tab?.id;
  if (tabId === undefined) {
    if (!sender.url?.startsWith(browser.runtime.getURL('/'))) return null;
  } else if (sender.frameId !== 0 || !(await isBoDoiTab(tabId))) return null;
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

/** Tests only. */
export function resetMcp(): void {
  socket?.stop();
  socket = null;
  intent = false;
  status = IDLE_STATUS;
}
