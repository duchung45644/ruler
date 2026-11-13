import { fakeBrowser } from 'wxt/testing/fake-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browser } from '#imports';
import { mcpAutoEnable, mcpIntent, mcpToken } from '../lib/ext/settings';
import { ERR, timeoutError } from '../lib/mcp/protocol';
import {
  connect,
  disconnect,
  handleCall,
  initMcp,
  mcpHandlers,
  prompt,
  resetMcp,
  setTabEnabler,
} from './mcp';
import { FakeWebSocket } from './mcp-fake-ws';
import type { McpStatus } from '../lib/mcp/status';

const sendMessage = vi.fn<(...a: unknown[]) => Promise<unknown>>();
const runtimeSend = vi.fn<(...a: unknown[]) => Promise<unknown>>(async () => undefined);
const tabs = [
  { id: 1, url: 'https://a.test/', title: 'A', active: true },
  { id: 2, url: 'https://b.test/', title: 'B', active: false },
];

beforeEach(() => {
  fakeBrowser.reset();
  resetMcp();
  FakeWebSocket.install();
  sendMessage.mockReset();
  // tab 1 has PixelLens on, tab 2 has no content script
  sendMessage.mockImplementation(async (tabId, msg) => {
    if (tabId !== 1) throw new Error('Receiving end does not exist');
    return (msg as { type: string }).type === 'ping' ? { active: true } : undefined;
  });
  browser.tabs.sendMessage = sendMessage as never;
  browser.tabs.query = vi.fn(async () => tabs) as never;
  browser.runtime.sendMessage = runtimeSend as never;
  browser.runtime.getManifest = (() => ({ version: '2.0.0' })) as never;
});
afterEach(() => {
  resetMcp();
  vi.unstubAllGlobals();
});

/** What the settings page / dock get when they ask (mcp_status). */
const mcpStatus = () => mcpHandlers.mcp_status!({} as never) as McpStatus;

const statusSentTo = (tabId: number) =>
  sendMessage.mock.calls
    .filter(([id, m]) => id === tabId && (m as { type: string }).type === 'mcp_status')
    .map(([, m]) => (m as { data: unknown[] }).data[0]);

describe('connect / disconnect', () => {
  it('opens nothing until the user opts in', async () => {
    initMcp();
    await vi.waitFor(() => expect(mcpStatus().intent).toBe(false));
    await new Promise((r) => setTimeout(r, 10));
    expect(FakeWebSocket.all).toHaveLength(0);
  });

  it('connect stores the intent and a token, then dials', async () => {
    const s = await connect();
    expect(await mcpIntent.getValue()).toBe(true);
    expect(await mcpToken.getValue()).toMatch(/^[\w-]{43}$/);
    await vi.waitFor(() => expect(FakeWebSocket.all).toHaveLength(1));
    expect(s).toMatchObject({ intent: true, waiting: true, connected: false });
  });

  it('broadcasts status to PixelLens tabs and the settings page, never the token', async () => {
    await connect();
    await vi.waitFor(() => expect(FakeWebSocket.last).toBeDefined());
    FakeWebSocket.last!.open();
    FakeWebSocket.last!.receive({
      type: 'welcome',
      serverVersion: '0.4.0',
      client: { name: 'cursor', version: '1' },
    });
    expect(mcpStatus()).toMatchObject({
      connected: true,
      versionMismatch: true,
      client: { name: 'cursor', version: '1' },
    });
    await vi.waitFor(() =>
      expect(statusSentTo(1).at(-1)).toMatchObject({ connected: true, versionMismatch: true }),
    );
    expect(runtimeSend).toHaveBeenCalledWith(
      expect.objectContaining({ target: 'options', type: 'mcp_status' }),
    );
    const token = (await mcpToken.getValue())!;
    expect(JSON.stringify(sendMessage.mock.calls)).not.toContain(token);
    expect(JSON.stringify(runtimeSend.mock.calls)).not.toContain(token);
  });

  it('disconnect clears the intent and closes at once', async () => {
    await connect();
    await vi.waitFor(() => expect(FakeWebSocket.last).toBeDefined());
    FakeWebSocket.last!.open();
    const s = await disconnect();
    expect(await mcpIntent.getValue()).toBe(false);
    expect(FakeWebSocket.last!.closed).toBe(true);
    expect(s).toMatchObject({ intent: false, waiting: false, connected: false });
  });

  it('reconnects at worker start when the intent was left on (10.04)', async () => {
    await mcpIntent.setValue(true);
    initMcp();
    await vi.waitFor(() => expect(FakeWebSocket.all).toHaveLength(1));
  });

  it('follows the intent changed elsewhere', async () => {
    initMcp();
    await mcpIntent.setValue(true);
    await vi.waitFor(() => expect(FakeWebSocket.all).toHaveLength(1));
    await mcpIntent.setValue(false);
    await vi.waitFor(() => expect(FakeWebSocket.last!.closed).toBe(true));
  });
});

describe('prompt', () => {
  const id = browser.runtime.id;
  it('goes to the settings page and to PixelLens tabs only', async () => {
    const page = { id, url: browser.runtime.getURL('/options.html') };
    expect(await prompt(page)).toContain('PIXELLENS_MCP_TOKEN=');
    expect(await prompt({ id, tab: { id: 1 } as never, frameId: 0 })).toContain('--extension-id');
    expect(await prompt({ id, tab: { id: 2 } as never, frameId: 0 })).toBeNull();
    expect(await prompt({ id, tab: { id: 1 } as never, frameId: 3 })).toBeNull();
    expect(await prompt({ id: 'other', url: page.url })).toBeNull();
    expect(await prompt({ id, url: 'https://evil.test/' })).toBeNull();
  });
});

describe('router', () => {
  const mcpCalls = () =>
    sendMessage.mock.calls.filter(([, m]) => (m as { type: string }).type === 'mcp_call');
  beforeEach(() => {
    browser.tabs.get = vi.fn(async (id: number) => {
      const t = tabs.find((x) => x.id === id);
      if (!t) throw new Error('No tab');
      return t;
    }) as never;
  });

  it('rejects unknown commands and bad payloads before touching a tab', async () => {
    expect(await handleCall('eval', {})).toEqual({ ok: false, error: ERR.unknown });
    expect(await handleCall('get_page_info', {})).toEqual({
      ok: false,
      error: 'get_page_info requires a numeric tabId.',
    });
    expect(await handleCall('query_selector', { tabId: 1, selector: 5 })).toMatchObject({
      ok: false,
    });
    expect(mcpCalls()).toHaveLength(0);
  });

  it('lists PixelLens tabs only', async () => {
    expect(await handleCall('list_tabs', {})).toEqual({
      ok: true,
      data: {
        tabs: [{ tabId: 1, title: 'A', url: 'https://a.test/', active: true, enabled: true }],
        canEnable: false,
      },
    });
  });

  it('refuses tabs where PixelLens is off, focus_tab included', async () => {
    expect(await handleCall('get_page_info', { tabId: 2 })).toEqual({
      ok: false,
      error: ERR.tabInactiveHint,
    });
    expect(await handleCall('focus_tab', { tabId: 2 })).toEqual({
      ok: false,
      error: ERR.tabInactive,
    });
    expect(await handleCall('get_page_info', { tabId: 99 })).toEqual({
      ok: false,
      error: 'No tab with id 99.',
    });
    expect(mcpCalls()).toHaveLength(0);
  });

  it('forwards to the top frame and returns its answer', async () => {
    sendMessage.mockImplementation(async (_id, m) =>
      (m as { type: string }).type === 'ping' ? { active: true } : { ok: true, data: { x: 1 } },
    );
    expect(await handleCall('select_element', { tabId: 1, elementId: 'v-a1' })).toEqual({
      ok: true,
      data: { x: 1 },
    });
    expect(mcpCalls()[0]).toEqual([
      1,
      {
        target: 'content',
        type: 'mcp_call',
        data: ['select_element', { tabId: 1, elementId: 'v-a1' }],
      },
      { frameId: 0 },
    ]);
  });

  it('adds the Tailwind classes to get_tailwind from the css the tab returns', async () => {
    const css = { color: 'rgb(255, 0, 0)' };
    sendMessage.mockImplementation(async (_id, m) =>
      (m as { type: string }).type === 'ping' ? { active: true } : { ok: true, data: { css } },
    );
    const r = await handleCall('get_tailwind', { tabId: 1, elementId: 'v-a1' });
    expect(r).toEqual({ ok: true, data: { tailwind: expect.any(String), css } });
    expect((r as { data: { tailwind: string } }).data.tailwind).toContain('text-[rgb(255,0,0)]');
  });

  it('times out after 12s (40s for slow commands) and always answers', async () => {
    vi.useFakeTimers();
    try {
      sendMessage.mockImplementation(async (_id, m) =>
        (m as { type: string }).type === 'ping' ? { active: true } : new Promise(() => {}),
      );
      const fast = handleCall('get_page_info', { tabId: 1 });
      const slow = handleCall('get_screenshot', { tabId: 1 });
      let slowDone = false;
      void slow.then(() => (slowDone = true));
      await vi.advanceTimersByTimeAsync(12_000);
      expect(await fast).toEqual({ ok: false, error: timeoutError('get_page_info') });
      expect(slowDone).toBe(false);
      await vi.advanceTimersByTimeAsync(28_000);
      expect(await slow).toEqual({ ok: false, error: timeoutError('get_screenshot') });
    } finally {
      vi.useRealTimers();
    }
  });

  it('blocks private stylesheet hosts with the legacy message', async () => {
    expect(await handleCall('fetch_stylesheet', { url: 'http://127.0.0.1/a.css' })).toEqual({
      ok: false,
      error: ERR.stylesheetBlocked,
    });
  });

  it('has no runtime.onMessage way in', async () => {
    const listeners: ((m: unknown, s: unknown, r: () => void) => unknown)[] = [];
    browser.runtime.onMessage.addListener = ((l: never) => listeners.push(l)) as never;
    const { handleMessages } = await import('../lib/ext/messaging');
    handleMessages('background', mcpHandlers);
    const reply = vi.fn();
    for (const msg of [
      { target: 'mcp', type: 'get_page_info', payload: { tabId: 1 } },
      { target: 'background', type: 'mcp_call', data: ['get_page_info', { tabId: 1 }] },
    ])
      expect(listeners[0]!(msg, {}, reply)).toBe(false);
    expect(mcpCalls()).toHaveLength(0);
  });
});

describe('agent turns PixelLens on', () => {
  let on: Set<number>;
  let granted: boolean;
  const enabler = vi.fn(async (tabId: number) => void on.add(tabId));
  beforeEach(() => {
    on = new Set([1]);
    granted = true;
    enabler.mockClear();
    setTabEnabler(enabler);
    sendMessage.mockImplementation(async (tabId, msg) => {
      if (!on.has(tabId as number)) throw new Error('Receiving end does not exist');
      const type = (msg as { type: string }).type;
      if (type === 'ping') return { active: true };
      if (type === 'mcp_call') return { ok: true, data: { here: tabId } };
      return undefined;
    });
    browser.tabs.get = vi.fn(async (id: number) => {
      const t = [...tabs, { id: 3, url: 'chrome://settings/', title: 'S', active: false }].find(
        (x) => x.id === id,
      );
      if (!t) throw new Error('No tab');
      return t;
    }) as never;
    browser.permissions.contains = vi.fn(async () => granted) as never;
  });

  it('stays off until the user allows it', async () => {
    expect(await handleCall('enable_tab', { tabId: 2 })).toEqual({
      ok: false,
      error: ERR.autoEnableOff,
    });
    expect(await handleCall('get_page_info', { tabId: 2 })).toEqual({
      ok: false,
      error: ERR.tabInactiveHint,
    });
    expect(enabler).not.toHaveBeenCalled();
  });

  it('needs <all_urls> too, even with the switch on', async () => {
    await mcpAutoEnable.setValue(true);
    granted = false;
    expect(await handleCall('enable_tab', { tabId: 2 })).toEqual({
      ok: false,
      error: ERR.autoEnableOff,
    });
    expect((await handleCall('list_tabs', {})) as { data: { canEnable: boolean } }).toMatchObject({
      data: { canEnable: false },
    });
  });

  it('lists every web tab with enabled, and enable_tab turns one on', async () => {
    await mcpAutoEnable.setValue(true);
    expect(await handleCall('list_tabs', {})).toMatchObject({
      data: {
        canEnable: true,
        tabs: [
          { tabId: 1, enabled: true },
          { tabId: 2, enabled: false },
        ],
      },
    });
    expect(await handleCall('enable_tab', { tabId: 2 })).toEqual({
      ok: true,
      data: { success: true, alreadyOn: false },
    });
    expect(enabler).toHaveBeenCalledWith(2);
    expect(await handleCall('enable_tab', { tabId: 1 })).toEqual({
      ok: true,
      data: { success: true, alreadyOn: true },
    });
    expect(enabler).toHaveBeenCalledTimes(1);
  });

  it('turns PixelLens on before a command sent to a tab where it is off', async () => {
    await mcpAutoEnable.setValue(true);
    expect(await handleCall('get_page_info', { tabId: 2 })).toEqual({
      ok: true,
      data: { here: 2 },
    });
    expect(enabler).toHaveBeenCalledWith(2);
  });

  it('never touches pages PixelLens cannot run on', async () => {
    await mcpAutoEnable.setValue(true);
    expect(await handleCall('enable_tab', { tabId: 3 })).toEqual({
      ok: false,
      error: ERR.notInjectable,
    });
    expect(enabler).not.toHaveBeenCalled();
  });
});
