import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import background, { toggleTab } from './entrypoints/background';

beforeEach(() => {
  fakeBrowser.reset();
  // fakeBrowser has no permissions.onAdded
  fakeBrowser.permissions.onAdded.addListener = vi.fn() as never;
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const stubs = () => {
  vi.spyOn(fakeBrowser.windows.onBoundsChanged, 'addListener').mockImplementation(() => {});
  return {
    exec: vi.spyOn(fakeBrowser.scripting, 'executeScript').mockResolvedValue([] as never),
    icon: vi.spyOn(fakeBrowser.action, 'setIcon').mockResolvedValue(undefined),
    setOptions: vi.spyOn(fakeBrowser.sidePanel, 'setOptions').mockResolvedValue(undefined),
    open: vi.spyOn(fakeBrowser.sidePanel, 'open').mockResolvedValue(undefined),
  };
};

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

describe('side panel', () => {
  const start = () => {
    const s = stubs();
    for (const ev of [fakeBrowser.contextMenus.onClicked, fakeBrowser.commands.onCommand])
      vi.spyOn(ev, 'addListener').mockImplementation(() => {});
    background.main();
    return s;
  };
  const call = (type: string, data: unknown[], tab: object = { id: 5, index: 2, windowId: 1 }) =>
    new Promise<unknown>((res) => {
      void fakeBrowser.runtime.onMessage.trigger(
        { target: 'background', type, data },
        { tab } as never,
        res,
      );
    });
  const tick = () => new Promise((r) => setTimeout(r, 0));

  it('open_side_panel calls sidePanel.open synchronously (user gesture)', async () => {
    const { open, setOptions } = start();
    await tick(); // detached map loaded
    const order: string[] = [];
    setOptions.mockImplementation(async () => void order.push('setOptions'));
    open.mockImplementation(async () => void order.push('open'));
    const p = call('open_side_panel', []);
    expect(order).toEqual(['setOptions', 'open']); // before the listener returned
    expect(open).toHaveBeenCalledWith({ tabId: 5 });
    expect(await p).toEqual({ success: true });
  });

  it('open_side_panel focuses an existing detached window instead', async () => {
    await fakeBrowser.storage.session.set({ detachedPanels: { 5: 77 } });
    const { open } = start();
    await tick();
    const update = vi.spyOn(fakeBrowser.windows, 'update').mockResolvedValue({} as never);
    expect(await call('open_side_panel', [])).toEqual({ success: true });
    expect(update).toHaveBeenCalledWith(77, { focused: true });
    expect(open).not.toHaveBeenCalled();
  });

  it('detach_panel opens a popup window and disables the docked panel', async () => {
    const { setOptions } = start();
    const create = vi
      .spyOn(fakeBrowser.windows, 'create')
      .mockResolvedValue({ id: 42, width: 300, height: 700 } as never);
    expect(await call('detach_panel', [5, { width: 300, height: 700 }])).toEqual({
      success: true,
    });
    const arg = create.mock.calls[0]![0]!;
    expect(arg).toMatchObject({ type: 'popup', focused: true, width: 300, height: 700 });
    expect(arg.url).toContain('tabId=5&detached=1');
    expect((await fakeBrowser.storage.session.get('detachedPanels')).detachedPanels).toEqual({
      5: 42,
    });
    expect(setOptions).toHaveBeenCalledWith({ tabId: 5, enabled: false });
  });

  it('dock_panel opens the docked panel in the gesture and closes the window', async () => {
    await fakeBrowser.storage.session.set({ detachedPanels: { 5: 42, 6: 43 } });
    const { open } = start();
    await tick();
    const remove = vi.spyOn(fakeBrowser.windows, 'remove').mockResolvedValue(undefined);
    const p = call('dock_panel', [5]);
    expect(open).toHaveBeenCalledWith({ tabId: 5 });
    expect(await p).toEqual({ success: true });
    expect(remove).toHaveBeenCalledWith(42);
    expect((await fakeBrowser.storage.session.get('detachedPanels')).detachedPanels).toEqual({
      6: 43,
    });
  });

  it('closing the detached window re-enables the panel for an active tab', async () => {
    await fakeBrowser.storage.session.set({ detachedPanels: { 5: 42 } });
    const { setOptions } = start();
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue({ scriptIsActive: true } as never);
    await fakeBrowser.windows.onRemoved.trigger(42);
    await vi.waitFor(() =>
      expect(setOptions).toHaveBeenCalledWith({
        tabId: 5,
        path: 'sidepanel.html?tabId=5',
        enabled: true,
      }),
    );
    expect((await fakeBrowser.storage.session.get('detachedPanels')).detachedPanels).toEqual({});
  });

  it('activating a tab without the script disables its panel and clears it', async () => {
    const { setOptions } = start();
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockRejectedValue(new Error('no receiver'));
    const toPanel = vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockResolvedValue(undefined);
    await fakeBrowser.tabs.onActivated.trigger({ tabId: 9, windowId: 1 });
    await vi.waitFor(() =>
      expect(toPanel).toHaveBeenCalledWith({
        target: 'sidepanel',
        type: 'clear',
        data: [],
        tabId: 9,
      }),
    );
    expect(setOptions).toHaveBeenCalledWith({ tabId: 9, enabled: false });
  });

  it('close_extension disables the panel and closes the detached window', async () => {
    await fakeBrowser.storage.session.set({ detachedPanels: { 5: 42 } });
    const { setOptions } = start();
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue({ active: false } as never);
    const remove = vi.spyOn(fakeBrowser.windows, 'remove').mockResolvedValue(undefined);
    await call('close_extension', []);
    expect(setOptions).toHaveBeenCalledWith({ tabId: 5, enabled: false });
    expect(remove).toHaveBeenCalledWith(42);
  });

  it('open_external_tab only opens http(s)', async () => {
    start();
    const create = vi.spyOn(fakeBrowser.tabs, 'create').mockResolvedValue({} as never);
    expect(await call('open_external_tab', ['javascript:alert(1)'])).toBe(false);
    expect(create).not.toHaveBeenCalled();
    expect(await call('open_external_tab', ['https://a.com/'])).toBe(true);
    expect(create).toHaveBeenCalledWith({
      url: 'https://a.com/',
      active: true,
      openerTabId: 5,
      index: 3,
    });
  });

  it('run_tech_detection runs the detector in the MAIN world and returns its result', async () => {
    start();
    const exec = vi
      .spyOn(fakeBrowser.scripting, 'executeScript')
      .mockResolvedValue([{ frameId: 0, documentId: 'd', result: [{ id: 'react' }] }] as never);
    expect(await call('run_tech_detection', [])).toEqual({
      success: true,
      technologies: [{ id: 'react' }],
    });
    expect(exec).toHaveBeenCalledWith({
      target: { tabId: 5, frameIds: [0] },
      files: ['/detect-technologies.js'],
      world: 'MAIN',
    });
    exec.mockRejectedValue(new Error('Cannot access'));
    expect(await call('run_tech_detection', [])).toEqual({
      success: false,
      error: 'Cannot access',
    });
  });

  it('fetch_stylesheet needs <all_urls>', async () => {
    start();
    vi.spyOn(fakeBrowser.permissions, 'contains').mockResolvedValue(false as never);
    expect(await call('fetch_stylesheet', ['https://a.com/x.css'])).toEqual({
      ok: false,
      error: 'no permission',
    });
  });
});
