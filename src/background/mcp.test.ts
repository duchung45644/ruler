import { fakeBrowser } from 'wxt/testing/fake-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browser } from '#imports';
import { mcpIntent, mcpToken } from '../lib/settings';
import { connect, disconnect, initMcp, mcpStatus, prompt, resetMcp } from './mcp';
import { FakeWebSocket } from './mcp-fake-ws';

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
  // tab 1 has Bo doi on, tab 2 has no content script
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

  it('broadcasts status to Bo doi tabs and the settings page, never the token', async () => {
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
  it('goes to the settings page and to Bo doi tabs only', async () => {
    const page = { id, url: browser.runtime.getURL('/options.html') };
    expect(await prompt(page)).toContain('BODOI_MCP_TOKEN=');
    expect(await prompt({ id, tab: { id: 1 } as never, frameId: 0 })).toContain('--extension-id');
    expect(await prompt({ id, tab: { id: 2 } as never, frameId: 0 })).toBeNull();
    expect(await prompt({ id, tab: { id: 1 } as never, frameId: 3 })).toBeNull();
    expect(await prompt({ id: 'other', url: page.url })).toBeNull();
    expect(await prompt({ id, url: 'https://evil.test/' })).toBeNull();
  });
});
