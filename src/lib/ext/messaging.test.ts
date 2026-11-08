import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  handleMessages,
  sendToBackground,
  sendToFrame,
  sendToSidePanel,
  sendToTabPanel,
  sendToTab,
} from './messaging';

beforeEach(() => fakeBrowser.reset());
afterEach(() => vi.restoreAllMocks());

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

  it('edit commands reach the content handler with their typed reply', async () => {
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockImplementation(((_id: number, m: unknown) =>
      fakeBrowser.runtime.sendMessage(m)) as never);
    const addr = { stylesheet: 'a.css', selector: '.a', wrappers: [], occ: 0, scopeAddress: null };
    const rule_edit = vi.fn(() => ({
      ok: true,
      canUndo: false,
      canRedo: false,
      editCount: 1,
      hasClipboard: false,
    }));
    handleMessages('content', { rule_edit });
    const res = await sendToTab(1, 'rule_edit', addr, 'color: red;');
    expect(res.editCount).toBe(1);
    expect(rule_edit).toHaveBeenCalledWith(addr, 'color: red;', expect.anything());
  });
});

describe('side panel channel', () => {
  it('accept filters by sender tab: others get no answer', () => {
    const ping = vi.fn(() => ({ isOpen: true as const }));
    let listener!: (m: unknown, s: unknown, r: (v?: unknown) => void) => unknown;
    vi.spyOn(fakeBrowser.runtime.onMessage, 'addListener').mockImplementation(((l: never) => {
      listener = l;
    }) as never);
    handleMessages('sidepanel', { tab_specific_ping: ping }, undefined, {
      accept: (s) => s.tab?.id === 5,
    });
    const packet = { target: 'sidepanel', type: 'tab_specific_ping', data: [] };
    const reply = vi.fn();
    expect(listener(packet, { tab: { id: 7 } }, reply)).toBe(false);
    expect(ping).not.toHaveBeenCalled();
    expect(reply).not.toHaveBeenCalled();
    expect(listener(packet, { tab: { id: 5 } }, reply)).toBe(true);
    return vi.waitFor(() => expect(reply).toHaveBeenCalledWith({ isOpen: true }));
  });

  it('sendToSidePanel resolves undefined when no panel is open', async () => {
    vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockRejectedValue(
      new Error('Could not establish connection. Receiving end does not exist.'),
    );
    expect(await sendToSidePanel('clear')).toBeUndefined();
  });

  it('sendToFrame passes frameId', async () => {
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue('u' as never);
    expect(await sendToFrame(3, 0, 'check_script_is_active')).toBe('u');
    expect(send).toHaveBeenCalledWith(
      3,
      { target: 'content', type: 'check_script_is_active', data: [] },
      {
        frameId: 0,
      },
    );
  });

  it('sendToTabPanel carries tabId for accept', async () => {
    const accept = vi.fn<(s: unknown, t?: number) => boolean>(() => true);
    handleMessages('sidepanel', { clear: () => {} }, undefined, { accept });
    await sendToTabPanel(4, 'clear');
    expect(accept).toHaveBeenCalledWith({}, 4);
  });

  it('sync handlers run inside the listener', () => {
    const order: string[] = [];
    let listener!: (m: unknown, s: unknown, r: (v?: unknown) => void) => unknown;
    vi.spyOn(fakeBrowser.runtime.onMessage, 'addListener').mockImplementation(((l: never) => {
      listener = l;
    }) as never);
    handleMessages(
      'background',
      {
        check_panel_api: () => (order.push('sync'), true),
        has_host_permission: () => (order.push('async'), true),
      },
      undefined,
      { sync: ['check_panel_api'] },
    );
    listener({ target: 'background', type: 'check_panel_api', data: [] }, {}, () => {});
    listener({ target: 'background', type: 'has_host_permission', data: [] }, {}, () => {});
    expect(order).toEqual(['sync']);
  });
});
