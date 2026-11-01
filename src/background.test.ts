import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import background, { toggleTab } from './entrypoints/background';

beforeEach(() => fakeBrowser.reset());
afterEach(() => vi.restoreAllMocks());

const stubs = () => ({
  exec: vi.spyOn(fakeBrowser.scripting, 'executeScript').mockResolvedValue([] as never),
  icon: vi.spyOn(fakeBrowser.action, 'setIcon').mockResolvedValue(undefined),
});

describe('toggleTab', () => {
  it('injects once when no content script answers', async () => {
    const { exec, icon } = stubs();
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockRejectedValue(new Error('no receiver'));
    await toggleTab(7);
    expect(exec).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledWith({
      target: { tabId: 7 },
      files: ['/content-scripts/content.js'],
    });
    expect(icon).toHaveBeenCalledWith({ tabId: 7, path: 'images/icon32_active.png' });
  });

  it('does not inject when content answers inactive', async () => {
    const { exec, icon } = stubs();
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue({ active: false } as never);
    await toggleTab(7);
    expect(exec).not.toHaveBeenCalled();
    expect(icon).toHaveBeenCalledWith({ tabId: 7, path: 'images/icon32.png' });
  });
});

describe('tabs.onUpdated', () => {
  it('resets icon on loading', async () => {
    const { icon } = stubs();
    // not implemented in fake
    vi.spyOn(fakeBrowser.contextMenus.onClicked, 'addListener').mockImplementation(() => {});
    vi.spyOn(fakeBrowser.commands.onCommand, 'addListener').mockImplementation(() => {});
    background.main();
    await fakeBrowser.tabs.onUpdated.trigger(3, { status: 'loading' }, {} as never);
    expect(icon).toHaveBeenCalledWith({ tabId: 3, path: 'images/icon32.png' });
  });
});

describe('close_extension', () => {
  it('toggles only the sender tab, not the active one', async () => {
    const { icon } = stubs();
    for (const ev of [fakeBrowser.contextMenus.onClicked, fakeBrowser.commands.onCommand])
      vi.spyOn(ev, 'addListener').mockImplementation(() => {});
    const send = vi
      .spyOn(fakeBrowser.tabs, 'sendMessage')
      .mockResolvedValue({ active: false } as never);
    background.main();
    const msg = { target: 'background', type: 'close_extension', data: [] };
    await fakeBrowser.runtime.onMessage.trigger(msg, { tab: { id: 5 } as never }, () => {});
    await vi.waitFor(() =>
      expect(icon).toHaveBeenCalledWith({ tabId: 5, path: 'images/icon32.png' }),
    );
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]![0]).toBe(5);
    send.mockClear();
    await fakeBrowser.runtime.onMessage.trigger(msg, {}, () => {});
    expect(send).not.toHaveBeenCalled();
  });
});
