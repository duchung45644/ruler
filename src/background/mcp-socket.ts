/**
 * WebSocket client to the local MCP server: connect, hello / welcome handshake, backoff, ping.
 * The wire format and the security rules are in lib/mcp/protocol.ts.
 */
import {
  HANDSHAKE_TIMEOUT_MS,
  mcpUrl,
  parseFrame,
  PROTOCOL,
  type AgentInfo,
  type CallFrame,
  type ExtensionFrame,
  type ResultFrame,
} from '../lib/mcp/protocol';

export const BACKOFF_MIN_MS = 1000;
export const BACKOFF_MAX_MS = 30_000;

/**
 * - idle: stopped (no socket, no timer)
 * - connecting: dialling, or waiting to retry after a failure (the server is not running yet)
 * - handshake: socket open, hello sent, no welcome yet
 * - open: welcome received; calls are accepted
 * - rejected: the server refused the token; no retry until start() again
 */
export type SocketState = 'idle' | 'connecting' | 'handshake' | 'open' | 'rejected';

export interface SocketSnapshot {
  state: SocketState;
  serverVersion: string | null;
  client: AgentInfo | null;
}

/** Sends the one result of a call; a no-op once that socket is gone. */
export type Reply = (
  r:
    | Omit<Extract<ResultFrame, { ok: true }>, 'type' | 'id'>
    | {
        ok: false;
        error: string;
      },
) => void;

export interface McpSocketOptions {
  token(): Promise<string>;
  extVersion: string;
  /** A call from the server (only after welcome). `signal` aborts when this socket closes. */
  onCall(call: CallFrame, reply: Reply, signal: AbortSignal): void;
  /** State, server version or client changed. */
  onChange(s: SocketSnapshot): void;
  url?: string;
}

export class McpSocket {
  #ws: WebSocket | null = null;
  #closing: AbortController | null = null;
  #retry: ReturnType<typeof setTimeout> | undefined;
  #handshake: ReturnType<typeof setTimeout> | undefined;
  #delay = BACKOFF_MIN_MS;
  #running = false;
  #snap: SocketSnapshot = { state: 'idle', serverVersion: null, client: null };

  constructor(private readonly opts: McpSocketOptions) {}

  get snapshot(): SocketSnapshot {
    return { ...this.#snap };
  }

  /** Connect now (a pressed Connect retries at once, even after a reject). */
  start(): void {
    this.#running = true;
    this.#delay = BACKOFF_MIN_MS;
    clearTimeout(this.#retry);
    this.#retry = undefined;
    if (this.#ws) return; // already dialling / open
    void this.#connect();
  }

  /** Close and forget: no socket, no timer. */
  stop(): void {
    this.#running = false;
    clearTimeout(this.#retry);
    this.#retry = undefined;
    this.#drop();
    this.#set({ state: 'idle', serverVersion: null, client: null });
  }

  #set(patch: Partial<SocketSnapshot>): void {
    const next = { ...this.#snap, ...patch };
    if (JSON.stringify(next) === JSON.stringify(this.#snap)) return;
    this.#snap = next;
    this.opts.onChange(this.snapshot);
  }

  /** Close the current socket and cancel its pending calls. */
  #drop(): void {
    clearTimeout(this.#handshake);
    this.#handshake = undefined;
    this.#closing?.abort();
    this.#closing = null;
    const ws = this.#ws;
    this.#ws = null;
    if (!ws) return;
    ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
    try {
      ws.close();
    } catch {
      // already closed
    }
  }

  async #connect(): Promise<void> {
    this.#set({ state: 'connecting', serverVersion: null, client: null });
    let token: string;
    try {
      token = await this.opts.token();
    } catch {
      this.#lost();
      return;
    }
    if (!this.#running || this.#ws) return;
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.opts.url ?? mcpUrl());
    } catch {
      this.#lost();
      return;
    }
    this.#ws = ws;
    const closing = (this.#closing = new AbortController());
    let welcomed = false;
    const send = (f: ExtensionFrame) => {
      if (this.#ws === ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(f));
    };
    ws.onopen = () => {
      this.#set({ state: 'handshake' });
      send({ type: 'hello', protocol: PROTOCOL, token, extVersion: this.opts.extVersion });
      this.#handshake = setTimeout(() => this.#lost(), HANDSHAKE_TIMEOUT_MS);
    };
    ws.onmessage = (e: MessageEvent) => {
      const f = parseFrame(e.data);
      if (!f) return;
      if (f.type === 'ping') return send({ type: 'pong' });
      if (!welcomed) {
        if (f.type === 'welcome') {
          welcomed = true;
          clearTimeout(this.#handshake);
          this.#handshake = undefined;
          this.#delay = BACKOFF_MIN_MS;
          this.#set({ state: 'open', serverVersion: f.serverVersion, client: f.client });
        } else if (f.type === 'reject') {
          this.#drop();
          this.#set({ state: 'rejected', serverVersion: null, client: null });
        }
        return; // nothing else counts before welcome (a call gets no reply)
      }
      if (f.type === 'client') this.#set({ client: f.client });
      else if (f.type === 'call') {
        let done = false;
        const reply: Reply = (r) => {
          if (done) return;
          done = true;
          send({ type: 'result', id: f.id, ...r } as ResultFrame);
        };
        this.opts.onCall(f, reply, closing.signal);
      }
    };
    ws.onclose = () => this.#lost();
    ws.onerror = () => {}; // close follows
  }

  /** Socket failed or closed: retry with backoff while the user still wants it. */
  #lost(): void {
    this.#drop();
    if (!this.#running) return;
    this.#set({ state: 'connecting', serverVersion: null, client: null });
    clearTimeout(this.#retry);
    const wait = this.#delay;
    this.#delay = Math.min(BACKOFF_MAX_MS, this.#delay * 2);
    this.#retry = setTimeout(() => {
      this.#retry = undefined;
      if (this.#running && !this.#ws) void this.#connect();
    }, wait);
  }
}
