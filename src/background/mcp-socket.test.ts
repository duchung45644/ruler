import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { ensureToken, mcpToken } from '../lib/settings';
import { TOKEN_RE } from '../lib/mcp/protocol';
import { BACKOFF_MAX_MS, McpSocket, type SocketSnapshot } from './mcp-socket';
import { FakeWebSocket } from './mcp-fake-ws';

const TOKEN = 'a'.repeat(43);
let changes: SocketSnapshot[];
let calls: { id: unknown; command: string; reply: (r: never) => void; signal: AbortSignal }[];

function make() {
  return new McpSocket({
    token: () => Promise.resolve(TOKEN),
    extVersion: '2.0.0',
    onCall: (c, reply, signal) => calls.push({ id: c.id, command: c.command, reply, signal }),
    onChange: (s) => changes.push(s),
  });
}
const flush = () => vi.advanceTimersByTimeAsync(0);
const last = () => FakeWebSocket.last!;

beforeEach(() => {
  vi.useFakeTimers();
  FakeWebSocket.install();
  changes = [];
  calls = [];
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('handshake', () => {
  it('dials 127.0.0.1, says hello and accepts calls after welcome', async () => {
    const s = make();
    s.start();
    await flush();
    expect(last().url).toBe('ws://127.0.0.1:47347/iodob');
    last().open();
    expect(last().sentFrames()).toEqual([
      { type: 'hello', protocol: 1, token: TOKEN, extVersion: '2.0.0' },
    ]);
    expect(s.snapshot.state).toBe('handshake');
    last().receive({
      type: 'welcome',
      serverVersion: '0.5.1',
      client: { name: 'cursor', version: '1' },
    });
    expect(s.snapshot).toEqual({
      state: 'open',
      serverVersion: '0.5.1',
      client: { name: 'cursor', version: '1' },
    });
    last().receive({ type: 'call', id: 1, command: 'list_tabs', payload: {} });
    expect(calls).toHaveLength(1);
    calls[0]!.reply({ ok: true, data: { tabs: [] } } as never);
    calls[0]!.reply({ ok: true, data: 'twice' } as never); // one result per call
    expect(last().sentFrames().slice(1)).toEqual([
      { type: 'result', id: 1, ok: true, data: { tabs: [] } },
    ]);
    last().receive({ type: 'client', client: { name: 'claude', version: '2' } });
    expect(s.snapshot.client).toEqual({ name: 'claude', version: '2' });
  });

  it('drops calls before welcome without replying', async () => {
    make().start();
    await flush();
    last().open();
    last().receive({ type: 'call', id: 1, command: 'list_tabs', payload: {} });
    expect(calls).toEqual([]);
    expect(last().sentFrames()).toHaveLength(1); // hello only
  });

  it('answers ping with pong', async () => {
    make().start();
    await flush();
    last().open();
    last().receive({ type: 'ping' });
    expect(last().sentFrames().at(-1)).toEqual({ type: 'pong' });
  });

  it('stops retrying after a reject (bad token) until started again', async () => {
    const s = make();
    s.start();
    await flush();
    last().open();
    last().receive({ type: 'reject', reason: 'bad token' });
    expect(s.snapshot.state).toBe('rejected');
    expect(last().closed).toBe(true);
    const count = FakeWebSocket.all.length;
    await vi.advanceTimersByTimeAsync(BACKOFF_MAX_MS * 2);
    expect(FakeWebSocket.all).toHaveLength(count);
    s.start();
    await flush();
    expect(FakeWebSocket.all).toHaveLength(count + 1);
  });

  it('gives up on a silent server after 5s and retries', async () => {
    const s = make();
    s.start();
    await flush();
    last().open();
    await vi.advanceTimersByTimeAsync(5000);
    expect(FakeWebSocket.all[0]!.closed).toBe(true);
    expect(s.snapshot.state).toBe('connecting');
    await vi.advanceTimersByTimeAsync(1000);
    expect(FakeWebSocket.all).toHaveLength(2);
  });

  it('ignores oversized and malformed frames', async () => {
    const s = make();
    s.start();
    await flush();
    last().open();
    last().receiveText('{"type":"welcome"');
    last().receiveText(JSON.stringify({ type: 'welcome', serverVersion: 'x'.repeat(2_000_000) }));
    expect(s.snapshot.state).toBe('handshake');
  });
});

describe('lifecycle', () => {
  it('backs off 1s, 2s, 4s … up to 30s while the server is down', async () => {
    make().start();
    await flush();
    const gaps: number[] = [];
    for (let i = 0; i < 7; i++) {
      const n = FakeWebSocket.all.length;
      last().fail();
      let waited = 0;
      while (FakeWebSocket.all.length === n) {
        await vi.advanceTimersByTimeAsync(500);
        waited += 500;
      }
      gaps.push(waited);
    }
    expect(gaps).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000]);
  });

  it('resets the backoff after a welcome', async () => {
    make().start();
    await flush();
    last().fail();
    await vi.advanceTimersByTimeAsync(1000);
    last().fail();
    await vi.advanceTimersByTimeAsync(2000);
    last().open();
    last().receive({ type: 'welcome', serverVersion: '1.0.0', client: null });
    const n = FakeWebSocket.all.length;
    last().fail();
    await vi.advanceTimersByTimeAsync(1000);
    expect(FakeWebSocket.all).toHaveLength(n + 1);
  });

  it('stop closes the socket, cancels pending calls and leaves no timer', async () => {
    const s = make();
    s.start();
    await flush();
    last().open();
    last().receive({ type: 'welcome', serverVersion: '1.0.0', client: null });
    last().receive({ type: 'call', id: 'a', command: 'get_page_info', payload: { tabId: 1 } });
    s.stop();
    expect(calls[0]!.signal.aborted).toBe(true);
    expect(last().closed).toBe(true);
    expect(s.snapshot.state).toBe('idle');
    expect(vi.getTimerCount()).toBe(0);
    calls[0]!.reply({ ok: true, data: 1 } as never);
    expect(last().sentFrames()).toHaveLength(1); // the late result goes nowhere
  });

  it('a result from an old socket never reaches the new one', async () => {
    make().start();
    await flush();
    last().open();
    last().receive({ type: 'welcome', serverVersion: '1.0.0', client: null });
    last().receive({ type: 'call', id: 1, command: 'get_page_info', payload: { tabId: 1 } });
    last().fail();
    expect(calls[0]!.signal.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    last().open();
    calls[0]!.reply({ ok: true, data: 1 } as never);
    expect(last().sentFrames()).toHaveLength(1);
  });
});

describe('token', () => {
  beforeEach(() => fakeBrowser.reset());
  it('is made once, 32 random bytes in base64url', async () => {
    const t = await ensureToken();
    expect(t).toMatch(TOKEN_RE);
    expect(await ensureToken()).toBe(t);
    expect(await mcpToken.getValue()).toBe(t);
    await mcpToken.setValue(null);
    expect(await ensureToken()).not.toBe(t);
  });
});
