/** Test double for the global WebSocket (no `ws` dependency): the test plays the server. */
import { vi } from 'vitest';

export class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static all: FakeWebSocket[] = [];
  static get last(): FakeWebSocket | undefined {
    return FakeWebSocket.all.at(-1);
  }
  static install(): void {
    FakeWebSocket.all = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
  }

  readyState = FakeWebSocket.CONNECTING;
  sent: string[] = [];
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(readonly url: string) {
    FakeWebSocket.all.push(this);
  }
  send(data: string): void {
    if (this.readyState !== FakeWebSocket.OPEN) throw new Error('not open');
    this.sent.push(data);
  }
  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }

  // --- server side
  open(): void {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }
  receive(frame: object): void {
    this.receiveText(JSON.stringify(frame));
  }
  receiveText(data: string): void {
    this.onmessage?.({ data });
  }
  sentFrames(): unknown[] {
    return this.sent.map((s) => JSON.parse(s) as unknown);
  }
  /** Connection refused / dropped. */
  fail(): void {
    this.onerror?.();
    this.close();
  }
  /** Resolves once a result for `id` was sent. */
  async result(id: unknown): Promise<Record<string, unknown>> {
    let hit: Record<string, unknown> | undefined;
    await vi.waitFor(() => {
      hit = this.sentFrames().find(
        (f) => (f as { type?: string }).type === 'result' && (f as { id?: unknown }).id === id,
      ) as Record<string, unknown> | undefined;
      if (!hit) throw new Error(`no result for ${String(id)}`);
    });
    return hit!;
  }
}
