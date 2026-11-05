import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { browser } from '#imports';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { Envelope } from '../../lib/responsive/channel';
import { stepZoom } from '../../lib/responsive/zoom';
import { getSettings, updateSettings } from '../../lib/settings';
import { mountLayer } from '../core/overlay';
import { state } from '../core/state.svelte';
import { currentBreakpoints } from '../tools/breakpoints';
import { enterResponsive, SAVE_DELAY_MS, setZoom, shell, teardownShell } from './shell.svelte';

vi.mock('../../lib/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/messaging')>()),
  sendToBackground: vi.fn(async () => undefined),
  sendToSidePanel: vi.fn(async () => undefined),
}));
vi.mock('../tools/breakpoints', async (orig) => ({
  ...(await orig<typeof import('../tools/breakpoints')>()),
  currentBreakpoints: vi.fn(() => []),
}));
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;

const flush = () => new Promise((r) => setTimeout(r, 0));
const fakeWin = { postMessage: vi.fn() };
let shadow: ShadowRoot;
let detach: () => void;

beforeEach(async () => {
  await fakeBrowser.storage.local.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  fakeWin.postMessage.mockClear();
  vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockReturnValue(
    fakeWin as unknown as Window,
  );
  shadow = document.body.appendChild(document.createElement('div')).attachShadow({ mode: 'open' });
  detach = mountLayer(shadow);
  state.active = true;
});
afterEach(() => {
  teardownShell();
  detach();
  state.active = false;
  state.breakpointsOn = false;
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const bar = (a: string) =>
  shadow.querySelector<HTMLButtonElement>(`[data-responsive-toolbar] [data-action="${a}"]`)!;
const dialog = () => shadow.querySelector<HTMLElement>('[role=alertdialog]');
const dialogButtons = () => [...dialog()!.querySelectorAll<HTMLButtonElement>('button')];
async function enter() {
  await enterResponsive();
  flushSync();
}

it('zoom steps ±5%, clamped to 25–200%', () => {
  expect(stepZoom(0.65, 1)).toBe(0.7);
  expect(stepZoom(0.65, -1)).toBe(0.6);
  expect(stepZoom(0.25, -1)).toBe(0.25);
  expect(stepZoom(2, 1)).toBe(2);
});

it('toolbar zoom buttons and select change the frames scale', async () => {
  await enter();
  expect(shell.zoom).toBe(0.65); // default when nothing is saved
  bar('zoom-in').click();
  flushSync();
  expect(shell.zoom).toBe(0.7);
  const frames = shadow.querySelector<HTMLElement>('[data-frames]')!;
  expect(frames.style.transform).toBe('scale(0.7)');
  const select = shadow.querySelector<HTMLSelectElement>('[data-zoom]')!;
  select.value = '200';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  flushSync();
  expect(shell.zoom).toBe(2);
  expect(bar('zoom-in').disabled).toBe(true);
});

it('zoom 50% sends update_ui_scale(2) to every frame', async () => {
  await enter();
  fakeWin.postMessage.mockClear();
  setZoom(0.5);
  const sent = fakeWin.postMessage.mock.calls
    .map(([m]) => m as Envelope)
    .filter((m) => m.type === 'update_ui_scale');
  expect(sent).toHaveLength(3);
  expect(sent.every((m) => m.data[0] === 2)).toBe(true);
});

it('custom viewport dialog rejects 100×100 and accepts 500×700', async () => {
  await enter();
  bar('add').click();
  flushSync();
  shadow.querySelector<HTMLButtonElement>('[data-preset="custom"]')!.click();
  await flush();
  flushSync();
  const [w, h] = [...dialog()!.querySelectorAll<HTMLInputElement>('input[type=number]')];
  const type = (el: HTMLInputElement, v: string) => {
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  type(w!, '100');
  type(h!, '100');
  flushSync();
  dialogButtons().at(-1)!.click();
  flushSync();
  expect(dialog()).not.toBeNull();
  expect(w!.getAttribute('aria-invalid')).toBe('true');
  type(w!, '500');
  type(h!, '700');
  flushSync();
  dialogButtons().at(-1)!.click();
  await flush();
  flushSync();
  expect(dialog()).toBeNull();
  expect(shell.frames).toHaveLength(4);
  expect(shell.frames[3]!.vp).toMatchObject({ width: 500, height: 700, name: '' });
  expect(shadow.querySelectorAll('iframe')).toHaveLength(4);
});

it('a device preset adds a named frame', async () => {
  await enter();
  bar('add').click();
  flushSync();
  shadow.querySelector<HTMLButtonElement>('[data-preset="pixel-9"]')!.click();
  flushSync();
  expect(shell.frames.at(-1)!.vp).toMatchObject({
    id: 4,
    name: 'Pixel 9',
    device: 'pixel-9',
    width: 412,
    height: 915,
  });
});

it('reset asks, then keeps only the first frame', async () => {
  await enter();
  bar('reset').click();
  await flush();
  flushSync();
  dialogButtons().at(-1)!.click();
  await flush();
  flushSync();
  expect(shell.frames.map((f) => f.vp.id)).toEqual([1]);
});

it('three changes within 400ms make one storage write', async () => {
  await enter();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const set = vi.spyOn(browser.storage.local, 'set');
  bar('zoom-in').click();
  bar('frame-layout').click();
  bar('sync-scroll').click();
  vi.advanceTimersByTime(SAVE_DELAY_MS - 1);
  expect(set).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  vi.useRealTimers();
  await vi.waitFor(() => expect(set).toHaveBeenCalledTimes(1));
  const saved = (await getSettings()).responsiveMode;
  expect(saved).toMatchObject({ zoom: 0.7, framesWrap: true, syncScrollEnabled: false });
  expect(saved.viewports).toHaveLength(3);
});

it('saved settings are restored on enter', async () => {
  await updateSettings({
    responsiveMode: {
      viewports: [{ id: 9, name: 'A', width: 500, height: 600, scheme: 'dark' }],
      zoom: 1.5,
      framesWrap: true,
      syncScrollEnabled: false,
    },
  });
  await enter();
  expect(shell.frames.map((f) => f.vp)).toEqual([
    { id: 1, name: 'A', width: 500, height: 600, scheme: 'dark' },
  ]);
  expect(shell).toMatchObject({ zoom: 1.5, framesWrap: true, syncScrollEnabled: false });
  expect(bar('frame-layout').getAttribute('aria-pressed')).toBe('true');
});

describe('breakpoint mode', () => {
  beforeEach(() => {
    state.breakpointsOn = true;
    vi.mocked(currentBreakpoints).mockReturnValue([{ width: 640 }, { width: 1024 }] as ReturnType<
      typeof currentBreakpoints
    >);
  });

  it('disables add and reset', async () => {
    await enter();
    expect(shell.breakpointMode).toBe(true);
    expect(bar('add').disabled).toBe(true);
    expect(bar('reset').disabled).toBe(true);
  });

  it('never overwrites saved viewports', async () => {
    await updateSettings({
      responsiveMode: {
        viewports: [{ id: 1, name: 'Mine', width: 700, height: 900, scheme: 'system' }],
        zoom: 1,
        framesWrap: false,
        syncScrollEnabled: true,
      },
    });
    await enter();
    expect(shell.frames.map((f) => f.vp.width)).toEqual([640, 1024]);
    shadow
      .querySelector<HTMLButtonElement>('[data-frame-header="1"] [data-action="rotate"]')!
      .click();
    setZoom(0.5);
    teardownShell(); // flushes the pending save
    await vi.waitFor(async () => expect((await getSettings()).responsiveMode.zoom).toBe(0.5));
    expect((await getSettings()).responsiveMode.viewports).toEqual([
      { id: 1, name: 'Mine', width: 700, height: 900, scheme: 'system' },
    ]);
  });
});
