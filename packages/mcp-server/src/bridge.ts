/**
 * WebSocket side: accepts the PixelLens extension on ws://127.0.0.1:<port>/pixellens and relays calls.
 * Wire format and security rules: protocol.gen.ts (copied from src/lib/mcp/protocol.ts) and
 * docs/mcp-protocol.md.
 */
import { timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type Server as HttpServer } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  CALL_TIMEOUT_MS,
  ERR,
  HANDSHAKE_TIMEOUT_MS,
  MAX_FRAME_BYTES,
  MCP_HOST,
  MCP_PATH,
  MCP_PORT,
  PING_INTERVAL_MS,
  PROTOCOL,
  SLOW_TIMEOUT_MS,
  SLOW_TYPES,
  isCallId,
  type AgentInfo,
  type CallId,
  type CallOutcome,
  type McpType,
  type ServerFrame,
} from './protocol.gen.ts';

export interface BridgeOptions {
  token: string;
  extensionId: string;
  serverVersion: string;
  port?: number;
  host?: string;
  /** Extra time on top of the extension's own timeout before the server gives up. */
  graceMs?: number;
  /** Override the per-command wait (tests). */
  timeoutMs?: (command: McpType) => number;
  pingMs?: number;
  handshakeMs?: number;
  log?: (msg: string) => void;
}

export interface ExtensionInfo {
  extVersion: string;
}

interface Pending {
  resolve(o: CallOutcome): void;
  timer: ReturnType<typeof setTimeout>;
}

export const NOT_CONNECTED =
  'The PixelLens extension is not connected. Ask the user to open PixelLens and press Connect (MCP).';

/** Constant-time token comparison (equal-length buffers, no early exit). */
export function tokenMatches(expected: string, got: unknown): boolean {
  if (typeof got !== 'string') return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(got, 'utf8');
  // compare against itself on length mismatch so the timing does not depend on the guess
  return timingSafeEqual(a, b.length === a.length ? b : a) && b.length === a.length;
}

/** Parse one extension frame; null for anything to drop. */
function parseExtensionFrame(raw: string): Record<string, unknown> | null {
  if (Buffer.byteLength(raw) > MAX_FRAME_BYTES) return null;
  try {
    const v: unknown = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export class Bridge {
  readonly #o: Required<Omit<BridgeOptions, 'log'>> & Pick<BridgeOptions, 'log'>;
  #http: HttpServer | null = null;
  #wss: WebSocketServer | null = null;
  #ext: WebSocket | null = null;
  #extInfo: ExtensionInfo | null = null;
  #client: AgentInfo | null = null;
  #pending = new Map<CallId, Pending>();
  #nextId = 1;
  #ping: ReturnType<typeof setInterval> | undefined;

  constructor(opts: BridgeOptions) {
    this.#o = {
      port: MCP_PORT,
      host: MCP_HOST,
      graceMs: 5000,
      timeoutMs: (c: McpType) =>
        (SLOW_TYPES.includes(c) ? SLOW_TIMEOUT_MS : CALL_TIMEOUT_MS) + this.#o.graceMs,
      pingMs: PING_INTERVAL_MS,
      handshakeMs: HANDSHAKE_TIMEOUT_MS,
      ...opts,
    };
  }

  get connected(): ExtensionInfo | null {
    return this.#extInfo;
  }

  get port(): number {
    const a = this.#http?.address();
    return a && typeof a === 'object' ? a.port : this.#o.port;
  }

  /** Listen; rejects with a readable error when the port is taken. */
  listen(): Promise<void> {
    const http = createServer((_req, res) => {
      res.writeHead(426).end();
    });
    const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_FRAME_BYTES });
    http.on('upgrade', (req, socket, head) => this.#upgrade(wss, req, socket, head));
    this.#http = http;
    this.#wss = wss;
    return new Promise((resolve, reject) => {
      http.once('error', (e: NodeJS.ErrnoException) =>
        reject(
          e.code === 'EADDRINUSE'
            ? new Error(
                `Port ${this.#o.port} on ${this.#o.host} is already in use (another PixelLens MCP server?). Stop it and try again.`,
              )
            : e,
        ),
      );
      http.listen(this.#o.port, this.#o.host, () => resolve());
    });
  }

  async close(): Promise<void> {
    clearInterval(this.#ping);
    this.#failAll(ERR.disconnected);
    for (const ws of this.#wss?.clients ?? []) ws.terminate();
    this.#wss?.close();
    await new Promise<void>((r) => (this.#http ? this.#http.close(() => r()) : r()));
    this.#http = null;
  }

  /** Tell the extension which agent is connected (sent now if open, else in welcome). */
  setClient(client: AgentInfo | null): void {
    this.#client = client;
    if (this.#extInfo) this.#send(this.#ext, { type: 'client', client });
  }

  /** Run one command in the extension. Payload must already be validated. */
  call(command: McpType, payload: unknown): Promise<CallOutcome> {
    const ws = this.#ext;
    if (!ws || !this.#extInfo) return Promise.resolve({ ok: false, error: NOT_CONNECTED });
    const id = this.#nextId++;
    const ms = this.#o.timeoutMs(command);
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        resolve({ ok: false, error: `${command} got no answer from the extension in time.` });
      }, ms);
      this.#pending.set(id, { resolve, timer });
      this.#send(ws, { type: 'call', id, command, payload });
    });
  }

  #upgrade(wss: WebSocketServer, req: IncomingMessage, socket: Duplex, head: Buffer): void {
    const path = (req.url ?? '').split('?')[0];
    const origin = req.headers.origin;
    if (path !== MCP_PATH || origin !== `chrome-extension://${this.#o.extensionId}`) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
      this.#o.log?.(`refused a WebSocket from origin ${String(origin).slice(0, 100)}`);
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => this.#accept(ws));
  }

  #accept(ws: WebSocket): void {
    let ready = false;
    const handshake = setTimeout(() => ws.close(), this.#o.handshakeMs);
    ws.on('message', (data, isBinary) => {
      if (isBinary) return;
      const f = parseExtensionFrame(data.toString());
      if (!f) return;
      if (!ready) {
        if (f.type !== 'hello') return;
        clearTimeout(handshake);
        const reason =
          f.protocol !== PROTOCOL
            ? `unsupported protocol (server speaks ${PROTOCOL})`
            : !tokenMatches(this.#o.token, f.token)
              ? 'bad token'
              : null;
        if (reason) {
          this.#send(ws, { type: 'reject', reason });
          ws.close();
          this.#o.log?.(`rejected the extension: ${reason}`);
          return;
        }
        ready = true;
        this.#adopt(ws, {
          extVersion: typeof f.extVersion === 'string' ? f.extVersion.slice(0, 50) : '',
        });
        return;
      }
      if (f.type === 'result' && isCallId(f.id) && ws === this.#ext) {
        const p = this.#pending.get(f.id);
        if (!p) return;
        this.#pending.delete(f.id);
        clearTimeout(p.timer);
        p.resolve(
          f.ok === true
            ? { ok: true, data: f.data }
            : { ok: false, error: typeof f.error === 'string' ? f.error : 'Unknown error.' },
        );
      }
      // pong: nothing to do
    });
    ws.on('close', () => {
      clearTimeout(handshake);
      if (ws !== this.#ext) return;
      this.#ext = null;
      this.#extInfo = null;
      clearInterval(this.#ping);
      this.#failAll(ERR.disconnected);
      this.#o.log?.('extension disconnected');
    });
    ws.on('error', () => ws.terminate());
  }

  /** The newest authenticated extension wins; the previous one is closed. */
  #adopt(ws: WebSocket, info: ExtensionInfo): void {
    const old = this.#ext;
    this.#ext = ws;
    this.#extInfo = info;
    if (old) {
      this.#failAll(ERR.disconnected);
      old.close();
    }
    this.#send(ws, { type: 'welcome', serverVersion: this.#o.serverVersion, client: this.#client });
    clearInterval(this.#ping);
    this.#ping = setInterval(() => this.#send(this.#ext, { type: 'ping' }), this.#o.pingMs);
    this.#o.log?.(`extension connected (PixelLens ${info.extVersion})`);
  }

  #failAll(error: string): void {
    for (const [id, p] of this.#pending) {
      clearTimeout(p.timer);
      p.resolve({ ok: false, error });
      this.#pending.delete(id);
    }
  }

  #send(ws: WebSocket | null, f: ServerFrame): void {
    if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(f));
  }
}
