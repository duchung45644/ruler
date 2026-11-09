import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { Bridge, NOT_CONNECTED, tokenMatches } from '../src/bridge.ts';
import { parseConfig, VERSION } from '../src/config.ts';
import { createMcpServer } from '../src/mcp.ts';
import {
  connectPrompt,
  ERR,
  isOutdated,
  MCP_PORT,
  MIN_MCP_SERVER_VERSION,
  PROTOCOL,
} from '../src/protocol.gen.ts';

const TOKEN = 'A'.repeat(43);
const EXT_ID = 'abcdefghijklmnopabcdefghijklmnop';
const ORIGIN = `chrome-extension://${EXT_ID}`;

let bridge: Bridge | null = null;
const sockets: WebSocket[] = [];
afterEach(async () => {
  for (const s of sockets.splice(0)) {
    s.on('error', () => {});
    if (s.readyState !== s.CLOSED) s.terminate();
  }
  await bridge?.close();
  bridge = null;
});

async function start(opts: Partial<ConstructorParameters<typeof Bridge>[0]> = {}) {
  bridge = new Bridge({
    token: TOKEN,
    extensionId: EXT_ID,
    serverVersion: VERSION,
    port: 0,
    ...opts,
  });
  await bridge.listen();
  return bridge;
}

/** A fake extension: a ws client that records frames. */
function fakeExt(origin = ORIGIN, path = '/pixellens') {
  const ws = new WebSocket(`ws://127.0.0.1:${bridge!.port}${path}`, { origin });
  sockets.push(ws);
  const frames: Record<string, unknown>[] = [];
  const waiters: (() => void)[] = [];
  ws.on('message', (d) => {
    frames.push(JSON.parse(d.toString()) as Record<string, unknown>);
    waiters.splice(0).forEach((w) => w());
  });
  const next = async (type: string) => {
    for (;;) {
      const i = frames.findIndex((f) => f.type === type);
      if (i >= 0) return frames.splice(i, 1)[0]!;
      await new Promise<void>((r) => waiters.push(r));
    }
  };
  const opened = new Promise<void>((res, rej) => {
    ws.once('open', () => res());
    ws.once('error', rej);
  });
  const closed = new Promise<void>((r) => ws.once('close', () => r()));
  const send = (f: unknown) => ws.send(JSON.stringify(f));
  const hello = async (token = TOKEN, protocol = PROTOCOL) => {
    await opened;
    send({ type: 'hello', protocol, token, extVersion: '2.0.0' });
  };
  return { ws, next, send, hello, opened, closed, frames };
}

async function connected() {
  const ext = fakeExt();
  await ext.hello();
  const welcome = await ext.next('welcome');
  return { ext, welcome };
}

async function mcpClient(b: Bridge) {
  const [a, z] = InMemoryTransport.createLinkedPair();
  const server = createMcpServer(b, VERSION);
  await server.connect(a);
  const client = new Client({ name: 'test-agent', version: '9.9.9' });
  await client.connect(z);
  return client;
}

describe('upgrade', () => {
  it('refuses a wrong Origin with 403 and no upgrade', async () => {
    await start();
    for (const origin of [
      'https://evil.example',
      'chrome-extension://otherextensionidxxxxxxxxxxxxxxx',
    ]) {
      const ws = new WebSocket(`ws://127.0.0.1:${bridge!.port}/pixellens`, { origin });
      sockets.push(ws);
      const status = await new Promise<number>((r) => {
        ws.on('unexpected-response', (_req, res) => r(res.statusCode ?? 0));
        ws.on('open', () => r(101));
      });
      expect(status).toBe(403);
    }
    expect(bridge!.connected).toBeNull();
  });

  it('refuses another path', async () => {
    await start();
    const ext = fakeExt(ORIGIN, '/other');
    await expect(ext.opened).rejects.toThrow(/403/);
  });

  it('binds 127.0.0.1 and reports a taken port clearly', async () => {
    const a = await start();
    const b = new Bridge({
      token: TOKEN,
      extensionId: EXT_ID,
      serverVersion: VERSION,
      port: a.port,
    });
    await expect(b.listen()).rejects.toThrow(/already in use/);
  });
});

describe('handshake', () => {
  it('rejects a wrong token and closes', async () => {
    await start();
    const ext = fakeExt();
    await ext.hello('B'.repeat(43));
    expect(await ext.next('reject')).toEqual({ type: 'reject', reason: 'bad token' });
    await ext.closed;
    expect(bridge!.connected).toBeNull();
  });

  it('rejects a wrong protocol', async () => {
    await start();
    const ext = fakeExt();
    await ext.hello(TOKEN, PROTOCOL + 1);
    expect(await ext.next('reject')).toMatchObject({ type: 'reject' });
    await ext.closed;
  });

  it('welcomes the right token with the server version and pings', async () => {
    await start({ pingMs: 30 });
    const { ext, welcome } = await connected();
    expect(welcome).toEqual({ type: 'welcome', serverVersion: VERSION, client: null });
    expect(bridge!.connected).toEqual({ extVersion: '2.0.0' });
    expect(await ext.next('ping')).toEqual({ type: 'ping' });
  });

  it('closes a socket that never says hello', async () => {
    await start({ handshakeMs: 50 });
    const ext = fakeExt();
    await ext.opened;
    await ext.closed;
  });

  it('compares tokens of any length safely', () => {
    expect(tokenMatches(TOKEN, TOKEN)).toBe(true);
    expect(tokenMatches(TOKEN, TOKEN + 'x')).toBe(false);
    expect(tokenMatches(TOKEN, '')).toBe(false);
    expect(tokenMatches(TOKEN, 42)).toBe(false);
  });
});

describe('versions', () => {
  it('ships a version the extension accepts', () => {
    expect(isOutdated(VERSION)).toBe(false);
  });

  it('a server older than the minimum is flagged by the extension rule', async () => {
    await start({ serverVersion: '0.4.9' });
    const { welcome } = await connected();
    expect(welcome.serverVersion).toBe('0.4.9');
    expect(isOutdated(welcome.serverVersion)).toBe(true);
    expect(isOutdated(MIN_MCP_SERVER_VERSION)).toBe(false);
  });
});

describe('calls', () => {
  it('round-trips an MCP tool call through the extension and tells it the agent', async () => {
    await start();
    const { ext } = await connected();
    const client = await mcpClient(bridge!);
    expect(await ext.next('client')).toEqual({
      type: 'client',
      client: { name: 'test-agent', version: '9.9.9' },
    });
    const pending = client.callTool({ name: 'get_page_info', arguments: { tabId: 5, junk: 1 } });
    const call = await ext.next('call');
    expect(call).toMatchObject({ command: 'get_page_info', payload: { tabId: 5 } });
    expect(call.payload).not.toHaveProperty('junk');
    ext.send({ type: 'result', id: call.id, ok: true, data: { title: 'Hi' } });
    expect(await pending).toEqual({ content: [{ type: 'text', text: '{"title":"Hi"}' }] });

    const failing = client.callTool({ name: 'get_page_info', arguments: { tabId: 5 } });
    const c2 = await ext.next('call');
    ext.send({ type: 'result', id: c2.id, ok: false, error: ERR.tabInactive });
    expect(await failing).toMatchObject({ isError: true, content: [{ text: ERR.tabInactive }] });
  });

  it('turns a screenshot into an image block', async () => {
    await start();
    const { ext } = await connected();
    const client = await mcpClient(bridge!);
    const pending = client.callTool({ name: 'get_screenshot', arguments: { tabId: 1 } });
    const call = await ext.next('call');
    ext.send({
      type: 'result',
      id: call.id,
      ok: true,
      data: { dataUrl: 'data:image/png;base64,iVBORw0KGgo=', width: 10, height: 5 },
    });
    expect(await pending).toEqual({
      content: [
        { type: 'image', mimeType: 'image/png', data: 'iVBORw0KGgo=' },
        { type: 'text', text: '{"width":10,"height":5}' },
      ],
    });
  });

  it('validates before sending', async () => {
    await start();
    const { ext } = await connected();
    const client = await mcpClient(bridge!);
    const r = await client.callTool({ name: 'query_selector', arguments: { tabId: 1 } });
    expect(r).toMatchObject({ isError: true });
    expect(await client.callTool({ name: 'get_page_info', arguments: {} })).toMatchObject({
      isError: true,
      content: [{ text: 'get_page_info requires a numeric tabId.' }],
    });
    expect(ext.frames.filter((f) => f.type === 'call')).toEqual([]);
  });

  it('times out when the extension never answers', async () => {
    await start({ timeoutMs: () => 50 });
    const { ext } = await connected();
    const client = await mcpClient(bridge!);
    const r = await client.callTool({ name: 'get_page_info', arguments: { tabId: 1 } });
    expect(r).toMatchObject({
      isError: true,
      content: [{ text: expect.stringMatching(/in time/) }],
    });
    const call = await ext.next('call');
    ext.send({ type: 'result', id: call.id, ok: true, data: {} }); // late: ignored
  });

  it('fails pending calls when the extension disconnects', async () => {
    await start();
    const { ext } = await connected();
    const client = await mcpClient(bridge!);
    const pending = client.callTool({ name: 'get_page_info', arguments: { tabId: 1 } });
    await ext.next('call');
    ext.ws.close();
    expect(await pending).toMatchObject({ isError: true, content: [{ text: ERR.disconnected }] });
  });

  it('answers ping and commands while no extension is connected', async () => {
    await start();
    const client = await mcpClient(bridge!);
    expect(await client.callTool({ name: 'ping', arguments: {} })).toMatchObject({
      isError: true,
      content: [{ text: NOT_CONNECTED }],
    });
    expect(await client.callTool({ name: 'list_tabs', arguments: {} })).toMatchObject({
      isError: true,
      content: [{ text: NOT_CONNECTED }],
    });
    await connected();
    expect(await client.callTool({ name: 'ping', arguments: {} })).toMatchObject({
      content: [{ text: 'pong: PixelLens 2.0.0 is connected.' }],
    });
  });

  it('drops calls before welcome: results from an unauthenticated socket are ignored', async () => {
    await start();
    const ext = fakeExt();
    await ext.opened;
    ext.send({ type: 'result', id: 1, ok: true, data: {} });
    expect(bridge!.connected).toBeNull();
  });
});

describe('config', () => {
  it('accepts exactly what the extension copy prompt tells the agent', () => {
    for (const port of [MCP_PORT, 5000]) {
      const prompt = connectPrompt(TOKEN, EXT_ID, port);
      const cmd =
        /Command: npx -y (\S+) (.*?) with environment variable PIXELLENS_MCP_TOKEN=(\S+) /.exec(prompt);
      expect(cmd?.[1]).toBe('@pixellens/mcp-server');
      expect(parseConfig(cmd![2]!.split(' '), { PIXELLENS_MCP_TOKEN: cmd![3] })).toEqual({
        token: TOKEN,
        extensionId: EXT_ID,
        port,
      });
    }
  });

  it('reads the token from PIXELLENS_MCP_TOKEN and the id from --extension-id', () => {
    expect(parseConfig(['--extension-id', EXT_ID], { PIXELLENS_MCP_TOKEN: TOKEN })).toEqual({
      token: TOKEN,
      extensionId: EXT_ID,
      port: MCP_PORT,
    });
    expect(
      parseConfig([`--extension-id=${EXT_ID}`, '--port', '5000'], { PIXELLENS_MCP_TOKEN: TOKEN }).port,
    ).toBe(5000);
    expect(() => parseConfig(['--extension-id', EXT_ID], {})).toThrow(/PIXELLENS_MCP_TOKEN/);
    expect(() => parseConfig([], { PIXELLENS_MCP_TOKEN: TOKEN })).toThrow(/extension-id/);
  });
});
