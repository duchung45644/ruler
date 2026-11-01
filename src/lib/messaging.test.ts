import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { handleMessages, sendToBackground } from './messaging';

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
