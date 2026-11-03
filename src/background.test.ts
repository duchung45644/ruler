import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import background, { toggleTab } from './entrypoints/background';

beforeEach(() => fakeBrowser.reset());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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

describe('capture', () => {
  const start = () => {
    stubs();
    for (const ev of [fakeBrowser.contextMenus.onClicked, fakeBrowser.commands.onCommand])
      vi.spyOn(ev, 'addListener').mockImplementation(() => {});
    background.main();
  };
  const call = (type: string, data: unknown[], tab: object) =>
    new Promise<unknown>((res) => {
      void fakeBrowser.runtime.onMessage.trigger(
        { target: 'background', type, data },
        { tab } as never,
        res,
      );
    });
  const page = { id: 4, windowId: 1, url: 'https://example.com/' };

  it('capture_tab refuses non-injectable pages', async () => {
    start();
    const r = await call('capture_tab', [null], { ...page, url: 'chrome://settings' });
    expect(r).toEqual({ success: false, error: 'INVALID_URL' });
  });

  it('capture_tab reports CAPTURE_FAILED when the capture throws', async () => {
    start();
    vi.spyOn(fakeBrowser.tabs, 'captureVisibleTab').mockRejectedValue(new Error('x'));
    expect(await call('capture_tab', [null], page)).toEqual({
      success: false,
      error: 'CAPTURE_FAILED',
    });
  });

  it('spaces captureVisibleTab calls 550ms apart', async () => {
    start();
    vi.useFakeTimers();
    const cap = vi
      .spyOn(fakeBrowser.tabs, 'captureVisibleTab')
      .mockResolvedValue('data:x' as never);
    await vi.advanceTimersByTimeAsync(1000); // clear the gap left by earlier tests
    const a = call('capture_tab', [null], page);
    const b = call('capture_tab', [null], page);
    await vi.advanceTimersByTimeAsync(0);
    expect(cap).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(549);
    expect(cap).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(cap).toHaveBeenCalledTimes(2);
    await Promise.all([a, b]);
  });

  const fullOpts = {
    width: 800,
    height: 1000,
    dpr: 1,
    chunk: 8000,
    shift: 0,
    before: 'B',
    after: 'A',
    restore: 'R',
  };
  const debuggerStub = (fail?: string) => {
    const cmds: string[] = [];
    vi.spyOn(fakeBrowser.debugger, 'attach').mockResolvedValue(undefined as never);
    const detach = vi.spyOn(fakeBrowser.debugger, 'detach').mockResolvedValue(undefined as never);
    vi.spyOn(fakeBrowser.debugger, 'sendCommand').mockImplementation((async (
      _t: unknown,
      method: string,
      params?: { expression?: string },
    ) => {
      cmds.push(params?.expression ? `${method}(${params.expression})` : method);
      if (method === fail) throw new Error('boom');
      return { data: 'png' };
    }) as never);
    return { cmds, detach };
  };

  it('full_capture runs the commands in order', async () => {
    start();
    const { cmds, detach } = debuggerStub();
    const p = call('full_capture', [fullOpts], page);
    expect(await p).toEqual({ ok: true, parts: ['data:image/png;base64,png'] });
    expect(cmds).toEqual([
      'Emulation.setDeviceMetricsOverride',
      'Runtime.evaluate(B)',
      'Page.captureScreenshot',
      'Runtime.evaluate(A)',
      'Emulation.clearDeviceMetricsOverride',
      'Runtime.evaluate(R)',
    ]);
    expect(detach).toHaveBeenCalled();
  });

  it('full_capture always cleans up when a screenshot throws (Review Focus 2)', async () => {
    start();
    const { cmds, detach } = debuggerStub('Page.captureScreenshot');
    expect(await call('full_capture', [fullOpts], page)).toEqual({ ok: false, error: 'boom' });
    expect(cmds).toContain('Emulation.clearDeviceMetricsOverride');
    expect(cmds).toContain('Runtime.evaluate(R)');
    expect(detach).toHaveBeenCalled();
  });
});
