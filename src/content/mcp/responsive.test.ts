import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { sendToBackground } from '../../lib/messaging';
import type { Viewport } from '../../lib/responsive/viewports';
import { hideUi } from '../core/session';
import { state } from '../core/state.svelte';
import { frameMcpCall, setViewportList, setZoom, shell } from '../responsive/shell.svelte';
import { runMcp } from '.';

vi.mock('../../lib/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/messaging')>()),
  sendToBackground: vi.fn(async () => undefined),
  sendToSidePanel: vi.fn(async () => undefined),
}));
vi.mock('../core/session', async (orig) => ({
  ...(await orig<typeof import('../core/session')>()),
  hideUi: vi.fn(),
}));
vi.mock('../responsive/shell.svelte', async (orig) => {
  const real = await orig<typeof import('../responsive/shell.svelte')>();
  return {
    ...real,
    setViewportList: vi.fn((list: Viewport[]) => {
      real.shell.frames = list.map((vp) => ({
        vp,
        name: '',
        loading: false,
        timedOut: false,
        blocked: null,
        overflow: false,
      }));
    }),
    setZoom: vi.fn(),
    frameMcpCall: vi.fn(async () => ({ ok: true, data: { from: 'frame' } })),
    allFramesMcpCall: vi.fn(async () => [
      {
        viewportId: 2,
        label: 'Tablet (768×1024)',
        outcome: { ok: true, data: { ruleChanges: [{ recordId: 'r1' }], htmlChanges: [] } },
      },
    ]),
  };
});
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;

const run = (type: Parameters<typeof runMcp>[0], payload: object = {}) =>
  runMcp(type, { tabId: 1, ...payload });
const vp = (id: number, width = 390, height = 844): Viewport => ({
  id,
  name: '',
  width,
  height,
  scheme: 'system',
});

beforeEach(() => {
  state.active = true;
  state.responsiveOn = true;
  state.inFrame = false;
  vi.mocked(setViewportList)([vp(1), vp(2, 768, 1024)]);
  vi.clearAllMocks();
});
afterEach(() => {
  state.responsiveOn = false;
  state.inFrame = false;
  state.active = false;
  shell.frames = [];
  shell.breakpointMode = false;
});

describe('responsive commands (10.13)', () => {
  it('need responsive mode', async () => {
    state.responsiveOn = false;
    expect(await run('set_zoom', { zoom: 1 })).toEqual({
      ok: false,
      error: 'Not in responsive mode. Call enter_responsive_mode first.',
    });
  });

  it('clamps viewport sizes to at least 200×300', async () => {
    const r = await run('set_viewport', { width: 10, height: 10, viewportId: 2 });
    expect(r).toMatchObject({ ok: true });
    expect(shell.frames[1]!.vp).toMatchObject({ width: 200, height: 300 });
    expect(await run('set_viewport', { width: 500, height: 500, viewportId: 9 })).toEqual({
      ok: false,
      error: 'No viewport with id 9.',
    });
  });

  it('sets, adds and removes viewports and describes them', async () => {
    await run('set_viewports', { viewports: [{ width: 5000, height: 400, name: 'Wide' }] });
    expect(shell.frames.map((f) => f.vp)).toEqual([
      { id: 1, name: 'Wide', width: 3840, height: 400, scheme: 'system' },
    ]);
    const added = await run('add_viewport', { width: 800, height: 600 });
    expect(added).toMatchObject({
      ok: true,
      data: { viewports: [{ id: 1 }, { id: 2, width: 800, height: 600, label: '800×600' }] },
    });
    expect(await run('remove_viewport', { viewportId: 2 })).toMatchObject({ ok: true });
    expect(await run('remove_viewport', { viewportId: 1 })).toMatchObject({ ok: false });
  });

  it('refuses viewport changes in breakpoints mode', async () => {
    shell.breakpointMode = true;
    expect(await run('add_viewport', {})).toEqual({
      ok: false,
      error:
        "Breakpoints mode shows the page's own breakpoints; turn it off to change the viewport set.",
    });
  });

  it('zooms within 0.25–2', async () => {
    expect(await run('set_zoom', { zoom: 0 })).toEqual({
      ok: false,
      error: 'set_zoom requires a scale between 0.25 and 2.',
    });
    await run('set_zoom', { zoom: 5 });
    expect(setZoom).toHaveBeenCalledWith(5); // the shell clamps
  });

  it('is refused inside a responsive frame (10.16)', async () => {
    state.inFrame = true;
    state.responsiveOn = false;
    expect(await run('get_viewport')).toEqual({
      ok: false,
      error: 'This command runs in the top page only.',
    });
  });
});

describe('routing while responsive (10.08)', () => {
  it('sends element and edit commands to the frame, page commands stay here', async () => {
    expect(await run('get_element_details', { elementId: 'v-a', viewportId: 2 })).toEqual({
      ok: true,
      data: { from: 'frame' },
    });
    expect(frameMcpCall).toHaveBeenCalledWith(
      'get_element_details',
      { tabId: 1, elementId: 'v-a', viewportId: 2 },
      2,
      expect.any(Number),
    );
    vi.mocked(frameMcpCall).mockClear();
    await run('apply_styles', { elementId: 'v-a', styles: {} });
    expect(vi.mocked(frameMcpCall).mock.calls[0]![2]).toBeUndefined(); // selected frame
    vi.mocked(frameMcpCall).mockClear();
    expect(await run('calculate_specificity', { selector: 'a' })).toMatchObject({ ok: true });
    expect(frameMcpCall).not.toHaveBeenCalled();
  });

  it('collects edits from every frame with namespaced ids, and routes reverts back', async () => {
    expect(await run('get_my_edits')).toEqual({
      ok: true,
      data: {
        ruleChanges: [{ recordId: 'v2:r1', viewportId: 2, viewport: 'Tablet (768×1024)' }],
        htmlChanges: [],
      },
    });
    await run('revert_css_change', { changeId: 'v2:r1' });
    expect(frameMcpCall).toHaveBeenCalledWith(
      'revert_css_change',
      { tabId: 1, changeId: 'r1' },
      2,
      expect.any(Number),
    );
  });
});

describe('get_screenshot (10.14)', () => {
  it('hides the UI, captures, and shows it again even when the capture fails', async () => {
    vi.mocked(sendToBackground).mockResolvedValueOnce({
      ok: true,
      dataUrl: 'data:image/png;base64,x',
      width: 2000,
      height: 1000,
    } as never);
    expect(await run('get_screenshot')).toMatchObject({ ok: true, data: { width: 2000 } });
    expect(vi.mocked(hideUi).mock.calls.map((c) => c[0])).toEqual(['all', null]);
    vi.mocked(hideUi).mockClear();
    vi.mocked(sendToBackground).mockRejectedValueOnce(new Error('boom'));
    expect(await run('get_screenshot')).toEqual({ ok: false, error: 'capture_failed' });
    expect(vi.mocked(hideUi).mock.calls.at(-1)![0]).toBeNull();
    vi.mocked(sendToBackground).mockResolvedValueOnce({
      ok: false,
      reason: 'script_inactive',
    } as never);
    expect(await run('get_screenshot')).toEqual({ ok: false, error: 'script_inactive' });
  });
});
