import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { browser } from '#imports';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import type { Envelope } from '../../lib/responsive/channel';
import { frameName } from '../../lib/responsive/frame-name';
import { routeKey } from '../core/keys';
import { items, registerItem } from '../core/registry.svelte';
import { startSession, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { eligible } from '../edit/persist';
import { isResponsiveFrame, startFrameMode, stopFrameMode } from './frame-mode';

let parent: { postMessage: ReturnType<typeof vi.fn> };
const xray = vi.fn();
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  parent = { postMessage: vi.fn() };
  vi.spyOn(window, 'parent', 'get').mockReturnValue(parent as unknown as Window);
  vi.spyOn(window, 'top', 'get').mockReturnValue(parent as unknown as Window);
  window.name = frameName(browser.runtime.id, 2);
  registerItem({ id: 'xray-t', label: 'x', key: 'x', run: xray } as never);
});
afterEach(() => {
  stopSession();
  stopFrameMode();
  vi.restoreAllMocks();
  xray.mockReset();
  window.name = '';
  items.splice(
    items.findIndex((i) => i.id === 'xray-t'),
    1,
  );
});

const sent = () => parent.postMessage.mock.calls.map(([m]) => m as Envelope);
const fromParent = (type: string, data: unknown[]) =>
  window.dispatchEvent(
    new MessageEvent('message', {
      data: { __bd: browser.runtime.id, dir: 'ruler-parent', type, data },
      source: parent as unknown as Window,
      origin: location.origin,
    }),
  );
const press = (el: Element, key: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));

it('a named frame starts in frame mode: no dock, persist off, ready sent', async () => {
  expect(isResponsiveFrame()).toBe(true);
  startFrameMode();
  expect(state.inFrame).toBe(true);
  await startSession(new ContentScriptContext('content'));
  const host = document.querySelector('pixellens-ui')!;
  expect(host.shadowRoot!.querySelector('[data-dock], .dock, button')).toBeNull();
  expect(eligible()).toBe(false);
  expect(sent()[0]).toMatchObject({ dir: 'ruler-iframe', type: 'ready_for_state_sync' });
});

it('is not a frame at the top or with a foreign name', () => {
  window.name = 'other';
  expect(isResponsiveFrame()).toBe(false);
  window.name = frameName(browser.runtime.id, 1);
  vi.spyOn(window, 'top', 'get').mockReturnValue(window);
  expect(isResponsiveFrame()).toBe(false);
});

it('an item key goes to the parent and does not run here', () => {
  startFrameMode();
  window.addEventListener('keydown', routeKey);
  press(document.body, 'x');
  window.removeEventListener('keydown', routeKey);
  expect(xray).not.toHaveBeenCalled();
  expect(sent().at(-1)).toMatchObject({ type: 'shortcut', data: ['x'] });
});

it('typing in an input sends nothing', () => {
  startFrameMode();
  const input = document.body.appendChild(document.createElement('input'));
  window.addEventListener('keydown', routeKey);
  press(input, 'x');
  window.removeEventListener('keydown', routeKey);
  input.remove();
  expect(sent().some((m) => m.type === 'shortcut')).toBe(false);
  expect(xray).not.toHaveBeenCalled();
});

it('run_item and set_paused from the parent apply here', async () => {
  startFrameMode();
  fromParent('run_item', ['xray-t']);
  await flush();
  expect(xray).toHaveBeenCalledOnce();
  fromParent('set_paused', [true]);
  await flush();
  expect(state.paused).toBe(true);
});

it('reports horizontal overflow to the shell, only on change', () => {
  const el = document.documentElement;
  const sw = vi.spyOn(el, 'scrollWidth', 'get').mockReturnValue(500);
  vi.spyOn(el, 'clientWidth', 'get').mockReturnValue(390);
  startFrameMode();
  const overflow = () => sent().filter((m) => m.type === 'overflow_status');
  expect(overflow().map((m) => m.data)).toEqual([[{ overflowing: true, width: 500 }]]);
  window.dispatchEvent(new Event('resize'));
  expect(overflow()).toHaveLength(1);
  sw.mockReturnValue(390);
  window.dispatchEvent(new Event('resize'));
  expect(overflow().at(-1)!.data).toEqual([{ overflowing: false, width: 390 }]);
});

it('update_ui_scale sets --ui-scale on the overlay host (1.28)', async () => {
  startFrameMode();
  await startSession(new ContentScriptContext('content'));
  expect(sent().some((m) => m.type === 'request_ui_scale')).toBe(true);
  fromParent('update_ui_scale', [2]);
  await flush();
  const host = document.querySelector<HTMLElement>('pixellens-ui')!;
  expect(host.style.getPropertyValue('--ui-scale')).toBe('2');
});
