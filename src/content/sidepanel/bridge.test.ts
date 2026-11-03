import { flushSync } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { routeKey } from '../core/keys';
import { layer } from '../core/overlay';
import { registerItem } from '../core/registry.svelte';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { sendToBackground, sendToSidePanel } from '../../lib/messaging';
import { bridge, initSidePanelBridge, sidePanelHandlers, toggleSidePanel } from './bridge.svelte';

vi.mock('../../lib/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
type Port = { name: string; onDisconnect: { addListener(fn: () => void): void } };
const connects: ((p: Port) => void)[] = [];
fakeBrowser.runtime.onConnect.addListener = ((fn: (p: Port) => void) => connects.push(fn)) as never;
fakeBrowser.runtime.onConnect.removeListener = (() => {}) as never;

const toPanel = vi.mocked(sendToSidePanel);
const toBg = vi.mocked(sendToBackground);
const sent = (type: string) => toPanel.mock.calls.filter((c) => c[0] === type);
let shadow: ShadowRoot;

beforeEach(async () => {
  const host = document.body.appendChild(document.createElement('bo-doi-ui'));
  shadow = host.attachShadow({ mode: 'open' });
  shadow.append(layer);
  state.active = true;
  sessionSignal();
  await initSidePanelBridge();
  toPanel.mockClear();
});
afterEach(() => {
  stopSession();
  connects.length = 0;
  bridge.panelOpen = false;
  document.body.replaceChildren();
  vi.clearAllMocks();
});

it('toggle opens a panel unless one answers the tab ping', async () => {
  await toggleSidePanel();
  expect(toBg).toHaveBeenLastCalledWith('open_side_panel');
  toPanel.mockResolvedValueOnce({ isOpen: true } as never);
  await toggleSidePanel();
  expect(toBg).toHaveBeenLastCalledWith('close_side_panel');
});

it('alerts when the element is gone, and the dialog swallows tool keys', async () => {
  const run = vi.fn();
  registerItem({
    id: 'bt',
    icon: {} as never,
    label: 'dock.quit',
    key: '2',
    group: 'utilities',
    run,
  });
  const done = sidePanelHandlers.go_to_selected_element!('v-missing', {} as never);
  flushSync();
  const dialog = shadow.querySelector('[role=alertdialog]') as HTMLElement;
  expect(dialog).not.toBeNull();
  routeKey(new KeyboardEvent('keydown', { key: '2' }));
  expect(run).not.toHaveBeenCalled();
  dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  expect(await done).toBe(false);
  expect(shadow.querySelector('[role=alertdialog]')).toBeNull();
});

it('panel port disconnect drops panelOpen and the highlight', async () => {
  let gone = () => {};
  connects[0]!({ name: 'sidepanel_1', onDisconnect: { addListener: (fn) => (gone = fn) } });
  expect(bridge.panelOpen).toBe(true);
  const p = document.body.appendChild(document.createElement('p'));
  p.setAttribute(`data-sr-id-${fakeBrowser.runtime.id}`, 'v-p');
  sidePanelHandlers.highlight_hovered!('v-p', {} as never);
  expect(layer.childElementCount).toBe(1);
  gone();
  expect(bridge.panelOpen).toBe(false);
  expect(layer.childElementCount).toBe(0);
});

it('sends select_element while open and clear on deselect / stop', () => {
  bridge.panelOpen = true;
  state.selected = document.body.appendChild(document.createElement('p'));
  flushSync();
  expect(sent('select_element')).toHaveLength(1);
  state.selected = null;
  flushSync();
  expect(sent('clear')).toHaveLength(1);
  stopSession();
  expect(sent('clear')).toHaveLength(2);
});
