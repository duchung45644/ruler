import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { handleMessages, sendToBackground, sendToTab } from './messaging';

beforeEach(() => fakeBrowser.reset());

describe('messaging', () => {
  it('returns async handler value', async () => {
    handleMessages('background', { request_clipboard_permission: async () => true });
    expect(await sendToBackground('request_clipboard_permission')).toBe(true);
  });

  it('content handler ignores background packets', async () => {
    let called = false;
    handleMessages('content', {
      ping: () => {
        called = true;
        return { active: true };
      },
    });
    handleMessages('background', { close_extension: () => {} });
    await sendToBackground('close_extension');
    expect(called).toBe(false);
  });

  it('abort removes handler', async () => {
    const ac = new AbortController();
    let n = 0;
    handleMessages('background', { close_extension: () => void n++ }, ac.signal);
    await sendToBackground('close_extension');
    ac.abort();
    await sendToBackground('close_extension').catch(() => {}); // no receiver left
    expect(n).toBe(1);
  });
});

describe('messaging edge cases', () => {
  it('handler that throws resolves undefined for the sender', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    handleMessages('background', {
      request_clipboard_permission: async () => {
        throw new Error('boom');
      },
    });
    expect(await sendToBackground('request_clipboard_permission')).toBeUndefined();
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it('unregistered type gets no answer (fake resolves undefined; real Chrome rejects)', async () => {
    handleMessages('background', { close_extension: () => {} });
    expect(await sendToBackground('request_clipboard_permission')).toBeUndefined();
  });

  it('content handler receives target content packet', async () => {
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockImplementation(((_id: number, m: unknown) =>
      fakeBrowser.runtime.sendMessage(m)) as never);
    handleMessages('content', { ping: () => ({ active: true }) });
    expect(await sendToTab(1, 'ping')).toEqual({ active: true });
  });
});
