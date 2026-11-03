import { browser, type Browser } from '#imports';
import type { DeviceRect } from './capture-bg';

export type CaptureResult =
  { success: true; dataUrl: string } | { success: false; error: 'INVALID_URL' | 'CAPTURE_FAILED' };
export interface FullCaptureOpts {
  width: number;
  height: number;
  dpr: number;
  chunk: number;
  /** The page is pushed down this much (`before`) so the cover sits above the captured area. */
  shift: number;
  before?: string;
  after?: string;
  restore?: string;
}
export type FullCaptureResult = { ok: true; parts: string[] } | { ok: false; error: string };

export interface BackgroundApi {
  close_extension(): void;
  request_clipboard_permission(): boolean;
  capture_tab(rect: DeviceRect | null): CaptureResult;
  full_capture(opts: FullCaptureOpts): FullCaptureResult;
}
export interface ContentApi {
  ping(): { active: boolean };
  toggle_script(): { active: boolean };
  select_parent(): void;
  select_child(): void;
}

type Handlers<A extends object> = {
  [K in keyof A]?: A[K] extends (...a: infer P) => infer R
    ? (...a: [...P, sender: Browser.runtime.MessageSender]) => R | Promise<R>
    : never;
};

type Target = 'background' | 'content';
interface Packet {
  target: Target;
  type: string;
  data: unknown[];
}

export function sendToBackground<K extends keyof BackgroundApi>(
  type: K,
  ...data: Parameters<BackgroundApi[K]>
): Promise<ReturnType<BackgroundApi[K]>> {
  const packet: Packet = { target: 'background', type, data };
  return browser.runtime.sendMessage(packet);
}

export function sendToTab<K extends keyof ContentApi>(
  tabId: number,
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]>> {
  const packet: Packet = { target: 'content', type, data };
  return browser.tabs.sendMessage(tabId, packet);
}

export function handleMessages<T extends Target>(
  target: T,
  handlers: Handlers<T extends 'background' ? BackgroundApi : ContentApi>,
  signal?: AbortSignal,
): void {
  const table = handlers as unknown as Record<string, (...a: unknown[]) => unknown>;
  const listener = (msg: unknown, sender: unknown, sendResponse: (r?: unknown) => void) => {
    const p = msg as Packet | null;
    if (!p || p.target !== target || !Object.hasOwn(table, p.type)) return false; // unknown: no reply
    Promise.resolve()
      .then(() => table[p.type]!(...(p.data ?? []), sender))
      .then(sendResponse, (e) => {
        console.error(`[bo-doi] handler "${p.type}" failed`, e);
        sendResponse(undefined); // ponytail: sender gets undefined, not a hung promise
      });
    return true;
  };
  browser.runtime.onMessage.addListener(listener);
  signal?.addEventListener('abort', () => browser.runtime.onMessage.removeListener(listener), {
    once: true,
  });
}
