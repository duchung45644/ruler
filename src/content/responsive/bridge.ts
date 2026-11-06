import { browser } from '#imports';
import type {
  ChannelDir,
  ChannelHandlers,
  Envelope,
  FrameApi,
  ShellApi,
} from '../../lib/responsive/channel';

export const CALL_TIMEOUT_MS = 500;

export interface Channel<Out extends object> {
  /** Resolves undefined on timeout or when the peer has no handler. */
  call<K extends keyof Out & string>(
    type: K,
    ...data: Out[K] extends (...a: infer P) => unknown ? P : never
  ): Promise<(Out[K] extends (...a: never[]) => infer R ? Awaited<R> : never) | undefined>;
  /** Like call, with its own timeout (MCP commands forwarded to a frame can take seconds). */
  callFor<K extends keyof Out & string>(
    ms: number,
    type: K,
    ...data: Out[K] extends (...a: infer P) => unknown ? P : never
  ): Promise<(Out[K] extends (...a: never[]) => infer R ? Awaited<R> : never) | undefined>;
  send<K extends keyof Out & string>(
    type: K,
    ...data: Out[K] extends (...a: infer P) => unknown ? P : never
  ): void;
}

function connect<In extends object, Out extends object>(
  peer: () => Window | null,
  dir: ChannelDir,
  handlers: ChannelHandlers<In>,
  signal: AbortSignal,
): Channel<Out> {
  const table = handlers as unknown as Record<string, (...a: unknown[]) => unknown>;
  const incoming: ChannelDir = dir === 'ruler-parent' ? 'ruler-iframe' : 'ruler-parent';
  const pending = new Map<number, (v: unknown) => void>();
  let seq = 0;

  const post = (env: Omit<Envelope, '__bd' | 'dir'>) => {
    if (signal.aborted) return;
    const target = peer();
    target?.postMessage({ __bd: browser.runtime.id, dir, ...env }, location.origin);
  };

  const listener = (e: MessageEvent) => {
    const m = e.data as Envelope | null;
    if (!m || typeof m !== 'object' || m.__bd !== browser.runtime.id || m.dir !== incoming) return;
    const target = peer();
    if (!target || e.source !== target || e.origin !== location.origin) return;
    if (m.reply) {
      if (typeof m.id !== 'number') return;
      const done = pending.get(m.id);
      pending.delete(m.id);
      done?.(m.data?.[0]);
      return;
    }
    if (typeof m.type !== 'string' || !Object.hasOwn(table, m.type)) return;
    const data = Array.isArray(m.data) ? m.data : [];
    const id = m.id;
    Promise.resolve()
      .then(() => table[m.type]!(...data))
      .then(
        (r) => {
          if (typeof id === 'number') post({ type: m.type, data: [r], id, reply: true });
        },
        (err) => {
          console.error(`[bo-doi] frame handler "${m.type}" failed`, err);
          if (typeof id === 'number') post({ type: m.type, data: [undefined], id, reply: true });
        },
      );
  };

  window.addEventListener('message', listener);
  signal.addEventListener(
    'abort',
    () => {
      window.removeEventListener('message', listener);
      for (const done of pending.values()) done(undefined);
      pending.clear();
    },
    { once: true },
  );

  const callFor = (ms: number, type: string, data: unknown[]) => {
    if (signal.aborted) return Promise.resolve(undefined);
    const id = ++seq;
    return new Promise<never>((resolve) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        resolve(undefined as never);
      }, ms);
      pending.set(id, (v) => {
        clearTimeout(timer);
        resolve(v as never);
      });
      post({ type, data, id });
    });
  };

  return {
    call: (type, ...data) => callFor(CALL_TIMEOUT_MS, type, data),
    callFor: (ms, type, ...data) => callFor(ms, type, data),
    send(type, ...data) {
      post({ type, data });
    },
  };
}

/** Parent side: talk to one responsive frame. */
export function connectToFrame(
  iframe: HTMLIFrameElement,
  handlers: ChannelHandlers<ShellApi>,
  signal: AbortSignal,
): Channel<FrameApi> {
  return connect<ShellApi, FrameApi>(() => iframe.contentWindow, 'ruler-parent', handlers, signal);
}

/** Frame side: talk to the shell in window.parent. */
export function connectToParent(
  handlers: ChannelHandlers<FrameApi>,
  signal: AbortSignal,
): Channel<ShellApi> {
  return connect<FrameApi, ShellApi>(
    () => (window.parent === window ? null : window.parent),
    'ruler-iframe',
    handlers,
    signal,
  );
}
