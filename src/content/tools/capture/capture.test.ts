import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '#i18n';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import * as messaging from '../../../lib/messaging';
import { routeKey } from '../../core/keys';
import { startSession, stopSession } from '../../core/session';
import { state } from '../../core/state.svelte';
import * as editor from './editor';
import { captureElement } from './element';
import { openBar } from '.';
import { capAction, openCaptureBar } from './session';

// fakeBrowser has no i18n.getMessage; the UI renders labels
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;

let grab: ReturnType<typeof vi.spyOn>;
beforeEach(async () => {
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
  grab = vi
    .spyOn(messaging, 'sendToBackground')
    .mockResolvedValue({ success: true, dataUrl: 'data:image/png;base64,x' } as never);
  await startSession(new ContentScriptContext('content'));
});
afterEach(() => {
  stopSession();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const capHost = () => document.querySelector('bo-doi-capture');
const mainHost = () => document.querySelector('bo-doi-ui') as HTMLElement;
const bar = (kind: string) => capHost()?.shadowRoot?.querySelector(`[data-bar="${kind}"]`);
const esc = () => routeKey(new KeyboardEvent('keydown', { key: 'Escape' }));

it('a failed grab leaves nothing open', async () => {
  grab.mockResolvedValue({ success: false, error: 'CAPTURE_FAILED' } as never);
  await openCaptureBar();
  expect(capHost()).toBeNull();
  expect(state.capturing).toBe(false);
  expect(mainHost().dataset.capture).toBeUndefined();
});

it('opens the mode bar over a hidden main UI; element button only when given', async () => {
  await openCaptureBar();
  expect(capHost()).not.toBeNull();
  expect(state.capturing).toBe(true);
  expect(mainHost().dataset.capture).toBe('all');
  expect(bar('mode')!.querySelectorAll('button')).toHaveLength(4);
  esc();
  await openCaptureBar({ element: () => {} });
  expect(bar('mode')!.querySelectorAll('button')).toHaveLength(5);
});

it('a second open while capturing does nothing (Review Focus 5)', async () => {
  await Promise.all([openCaptureBar(), openCaptureBar()]);
  expect(grab).toHaveBeenCalledOnce();
});

it('Esc and stopSession close it cleanly (Review Focus 4)', async () => {
  await openCaptureBar();
  esc();
  expect(capHost()).toBeNull();
  expect(state.capturing).toBe(false);
  expect(mainHost().dataset.capture).toBeUndefined();
  await openCaptureBar();
  stopSession();
  expect(capHost()).toBeNull();
  expect(state.capturing).toBe(false);
});

it('capAction shows Failed, then restores', async () => {
  vi.useFakeTimers();
  const set = vi.fn();
  await capAction(set, () => Promise.reject(new Error('x')), 'capture.copied', true);
  expect(set).toHaveBeenLastCalledWith(i18n.t('capture.failed'), true);
  vi.advanceTimersByTime(1500);
  expect(set).toHaveBeenLastCalledWith(null, false);
});

const ptr = (t: Element, type: string, x: number, y: number) =>
  t.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true }));

it('drawing an area swaps the mode bar for the area bar; a tiny one is dropped', async () => {
  await openCaptureBar();
  const root = capHost()!.shadowRoot!;
  const shade = root.querySelector('[data-shade]')!;
  ptr(shade, 'pointerdown', 50, 50);
  ptr(shade, 'pointermove', 52, 52);
  ptr(shade, 'pointerup', 52, 52);
  await Promise.resolve();
  expect((root.querySelector('[data-sel]') as HTMLElement).style.display).toBe('none');
  expect(bar('sel')).toBeFalsy();
  ptr(shade, 'pointerdown', 50, 50);
  ptr(shade, 'pointermove', 150, 120);
  ptr(shade, 'pointerup', 150, 120);
  await vi.waitFor(() => expect(bar('sel')).toBeTruthy());
  expect(bar('mode')).toBeFalsy();
});

describe('captureElement', () => {
  const target = () => {
    const p = document.body.appendChild(document.createElement('p'));
    p.getBoundingClientRect = () => ({ left: 100, top: 100, right: 200, bottom: 150 }) as DOMRect;
    return p;
  };
  const seen: (string | undefined)[] = [];
  const spyGrab = (ok: boolean) =>
    grab.mockImplementation((async () => {
      seen.push(mainHost().dataset.capture);
      return ok
        ? { success: true, dataUrl: 'data:x' }
        : { success: false, error: 'CAPTURE_FAILED' };
    }) as never);
  beforeEach(() => {
    seen.length = 0;
    vi.stubGlobal('devicePixelRatio', 2);
    vi.spyOn(editor, 'openCaptureEditor').mockResolvedValue();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('crops to the element box only, with all our UI hidden', async () => {
    spyGrab(true);
    await captureElement(target());
    expect(grab).toHaveBeenCalledWith('capture_tab', {
      left: 200,
      top: 200,
      right: 400,
      bottom: 300,
    });
    expect(seen).toEqual(['all']);
  });

  it('a failed capture restores the UI', async () => {
    spyGrab(false);
    await captureElement(target());
    expect(state.capturing).toBe(false);
    expect(mainHost().dataset.capture).toBeUndefined();
  });
});

it('save_screenshot path (openBar) opens the mode bar', async () => {
  openBar();
  await vi.waitFor(() => expect(bar('mode')).toBeTruthy());
});
