import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { browser } from '#imports';
import type { Envelope } from '../../lib/responsive/channel';
import { CALL_TIMEOUT_MS, connectToFrame } from './bridge';

let peer: { postMessage: ReturnType<typeof vi.fn> };
let iframe: HTMLIFrameElement;
let ac: AbortController;

beforeEach(() => {
  peer = { postMessage: vi.fn() };
  iframe = document.createElement('iframe');
  Object.defineProperty(iframe, 'contentWindow', { get: () => peer });
  ac = new AbortController();
});
afterEach(() => {
  ac.abort();
  vi.useRealTimers();
});

function deliver(data: unknown, source: unknown = peer, origin = location.origin) {
  window.dispatchEvent(new MessageEvent('message', { data, source: source as Window, origin }));
}
const env = (e: Partial<Envelope>): Envelope => ({
  __bd: browser.runtime.id,
  dir: 'ruler-iframe',
  type: 'x',
  data: [],
  ...e,
});
const flush = () => new Promise((r) => setTimeout(r, 0));

it('call posts to the frame with the page origin and resolves with the reply', async () => {
  const ch = connectToFrame(iframe, {}, ac.signal);
  const p = ch.call('get_current_url');
  const [msg, target] = peer.postMessage.mock.calls[0]!;
  expect(target).toBe(location.origin);
  expect(msg).toMatchObject({
    __bd: browser.runtime.id,
    dir: 'ruler-parent',
    type: 'get_current_url',
  });
  deliver(env({ type: 'get_current_url', data: ['https://a.test/'], id: msg.id, reply: true }));
  await expect(p).resolves.toBe('https://a.test/');
});

it('call resolves undefined after 500ms without a reply', async () => {
  vi.useFakeTimers();
  const ch = connectToFrame(iframe, {}, ac.signal);
  const p = ch.call('find', 'q');
  vi.advanceTimersByTime(CALL_TIMEOUT_MS);
  await expect(p).resolves.toBeUndefined();
});

it('answers a valid request from the frame', async () => {
  const request_ui_scale = vi.fn(() => 1.5);
  connectToFrame(iframe, { request_ui_scale }, ac.signal);
  deliver(env({ type: 'request_ui_scale', id: 7 }));
  await flush();
  expect(peer.postMessage).toHaveBeenCalledWith(
    expect.objectContaining({ id: 7, reply: true, data: [1.5], dir: 'ruler-parent' }),
    location.origin,
  );
});

it('ignores forged messages: no __bd, wrong source, wrong origin, wrong dir', async () => {
  const shortcut = vi.fn();
  connectToFrame(iframe, { shortcut }, ac.signal);
  const noBd: Partial<Envelope> = env({ type: 'shortcut', data: ['v'], id: 1 });
  delete noBd.__bd;
  deliver(noBd);
  deliver(env({ type: 'shortcut', data: ['v'], id: 2, __bd: 'other-ext' }));
  deliver(env({ type: 'shortcut', data: ['v'], id: 3 }), window);
  deliver(env({ type: 'shortcut', data: ['v'], id: 4 }), peer, 'https://evil.test');
  deliver(env({ type: 'shortcut', data: ['v'], id: 5, dir: 'ruler-parent' }));
  await flush();
  expect(shortcut).not.toHaveBeenCalled();
  expect(peer.postMessage).not.toHaveBeenCalled();
});

it('abort removes the listener', async () => {
  const shortcut = vi.fn();
  const remove = vi.spyOn(window, 'removeEventListener');
  connectToFrame(iframe, { shortcut }, ac.signal);
  ac.abort();
  expect(remove).toHaveBeenCalledWith('message', expect.any(Function));
  deliver(env({ type: 'shortcut', data: ['v'], id: 1 }));
  await flush();
  expect(shortcut).not.toHaveBeenCalled();
  remove.mockRestore();
});
