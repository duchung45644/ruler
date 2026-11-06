/** End to end with a fake server: socket → background router → page handler → result. */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { browser } from '#imports';
import { mcpHandlers } from '../content/mcp';
import { state } from '../content/core/state.svelte';
import { ERR } from '../lib/mcp/protocol';
import { connect, resetMcp } from './mcp';
import { FakeWebSocket } from './mcp-fake-ws';

vi.mock('../lib/messaging', async (orig) => ({
  ...(await orig<typeof import('../lib/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
}));

const bg = () => ({ id: browser.runtime.id, url: browser.runtime.getURL('/background.js') });
let hang = false;

beforeEach(async () => {
  fakeBrowser.reset();
  resetMcp();
  FakeWebSocket.install();
  hang = false;
  state.active = true;
  browser.runtime.getManifest = (() => ({ version: '2.0.0' })) as never;
  browser.runtime.sendMessage = vi.fn(async () => undefined) as never;
  const tabs = [
    { id: 1, url: 'https://a.test/', title: 'A', active: true },
    { id: 2, url: 'https://b.test/', title: 'B', active: false },
  ];
  browser.tabs.query = vi.fn(async () => tabs) as never;
  browser.tabs.get = vi.fn(async (id: number) => tabs.find((t) => t.id === id)) as never;
  // tab 1 is this happy-dom page with Bo doi on; tab 2 has it off
  browser.tabs.sendMessage = vi.fn(async (tabId: number, m: { type: string; data: unknown[] }) => {
    if (tabId !== 1) throw new Error('Receiving end does not exist');
    if (m.type === 'ping') return { active: state.active };
    if (m.type === 'mcp_call') {
      if (hang) return new Promise(() => {});
      const [type, payload] = m.data as [never, unknown];
      return mcpHandlers.mcp_call!(type, payload, bg());
    }
    return undefined;
  }) as never;
  await connect();
  await vi.waitFor(() => expect(FakeWebSocket.last).toBeDefined());
});
afterEach(() => {
  resetMcp();
  state.active = false;
  vi.unstubAllGlobals();
  document.title = '';
});

const server = () => FakeWebSocket.last!;
function welcome() {
  server().open();
  server().receive({ type: 'welcome', serverVersion: '0.5.0', client: null });
}

it('handshake → get_page_info → result', async () => {
  document.title = 'Integration';
  welcome();
  server().receive({ type: 'call', id: 1, command: 'get_page_info', payload: { tabId: 1 } });
  expect(await server().result(1)).toMatchObject({
    ok: true,
    data: { title: 'Integration' },
  });
});

it('drops calls before welcome', async () => {
  server().open();
  server().receive({ type: 'call', id: 1, command: 'get_page_info', payload: { tabId: 1 } });
  await new Promise((r) => setTimeout(r, 20));
  expect(
    server()
      .sentFrames()
      .filter((f) => (f as { type: string }).type === 'result'),
  ).toEqual([]);
});

it('refuses tabs where Bo doi is off and bad payloads', async () => {
  welcome();
  server().receive({ type: 'call', id: 'a', command: 'get_page_info', payload: { tabId: 2 } });
  expect(await server().result('a')).toEqual({
    type: 'result',
    id: 'a',
    ok: false,
    error: ERR.tabInactiveHint,
  });
  server().receive({ type: 'call', id: 'b', command: 'query_selector', payload: { tabId: 1 } });
  expect(await server().result('b')).toMatchObject({ ok: false });
  server().receive({ type: 'call', id: 'c', command: 'nope', payload: {} });
  expect(await server().result('c')).toMatchObject({ ok: false, error: ERR.unknown });
});

it('a socket closed mid-call does not hang or leak the result', async () => {
  welcome();
  hang = true;
  vi.useFakeTimers();
  try {
    const ws = server();
    ws.receive({ type: 'call', id: 9, command: 'get_page_info', payload: { tabId: 1 } });
    ws.fail();
    await vi.advanceTimersByTimeAsync(13_000); // the router times out and answers into nothing
    expect(ws.sentFrames().filter((f) => (f as { type: string }).type === 'result')).toEqual([]);
    expect(FakeWebSocket.all.length).toBeGreaterThan(1); // reconnecting
    expect(FakeWebSocket.last!.sent).toEqual([]);
  } finally {
    vi.useRealTimers();
  }
});
