import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { routeKey } from '../core/keys';
import { layer } from '../core/overlay';
import { registerItem } from '../core/registry.svelte';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import type { ElementDetails } from '../../lib/element/types';
import { sendToBackground, sendToSidePanel } from '../../lib/ext/messaging';
import { highlightCount } from './highlight';
import { bridge, initSidePanelBridge, sidePanelHandlers, toggleSidePanel } from './bridge.svelte';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
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
  const host = document.body.appendChild(document.createElement('iodob-ui'));
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

it('sends select_element while open and clear on deselect / stop', async () => {
  bridge.panelOpen = true;
  state.selected = document.body.appendChild(document.createElement('p'));
  flushSync();
  state.selected = document.body.appendChild(document.createElement('p'));
  flushSync();
  await Promise.resolve();
  expect(sent('select_element')).toHaveLength(1);
  state.selected = null;
  flushSync();
  expect(sent('clear')).toHaveLength(1);
  stopSession();
  expect(sent('clear')).toHaveLength(2);
});

describe('contrast issues and highlights', () => {
  const observers: { disconnect: ReturnType<typeof vi.fn>; observe: ReturnType<typeof vi.fn> }[] =
    [];
  let offscreen: Element | null = null;
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return this === offscreen ? new DOMRect(0, 5000, 50, 20) : new DOMRect(0, 0, 50, 20);
    });
    document.elementsFromPoint = () => [...document.querySelectorAll('span, div')];
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function () {
        const o = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
        observers.push(o);
        return o;
      }),
    );
    document.body.innerHTML =
      '<div style="background-color: #fff"><span style="color: #eee">x</span></div>';
    bridge.panelOpen = true;
  });
  afterEach(() => {
    offscreen = null;
    observers.length = 0;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  const select = async (el: Element) => {
    state.selected = el;
    flushSync();
    await Promise.resolve();
    return sent('select_element').at(-1)![1] as ElementDetails;
  };

  it('reports low contrast text and highlights by colour', async () => {
    const span = document.querySelector('span')!;
    const d = await select(document.querySelector('div')!);
    expect(d.issues).toHaveLength(1);
    expect(d.issues[0]).toMatchObject({ severity: 'warning', type: 'contrast-failure' });
    expect(d.issues[0]!.elementIds).toEqual([
      span.getAttribute(`data-sr-id-${fakeBrowser.runtime.id}`),
    ]);
    sidePanelHandlers.highlight_elements_for_color!('#eeeeee', {} as never);
    expect(highlightCount()).toBe(1);
    sidePanelHandlers.highlight_elements_for_issue!(d.issues[0]!.id, {} as never);
    expect(highlightCount()).toBe(1);
    sidePanelHandlers.clear_element_highlights!({} as never);
    expect(highlightCount()).toBe(0);
  });

  it('alerts for a missing issue element', async () => {
    void sidePanelHandlers.highlight_issue_element!('v-x', {} as never);
    flushSync();
    expect(shadow.querySelector('[role=alertdialog]')).not.toBeNull();
  });

  it('watches off-screen findings until the selection changes', async () => {
    offscreen = document.querySelector('span');
    await select(document.querySelector('div')!);
    expect(observers).toHaveLength(1);
    expect(observers[0]!.observe).toHaveBeenCalledWith(offscreen);
    await select(document.querySelector('span')!);
    expect(observers[0]!.disconnect).toHaveBeenCalled();
  });
});

it('a burst of five selections sends select_element once, for the last', async () => {
  bridge.panelOpen = true;
  const tags = ['p', 'span', 'em', 'b', 'section'];
  for (const t of tags) {
    state.selected = document.body.appendChild(document.createElement(t));
    flushSync();
  }
  await Promise.resolve();
  expect(sent('select_element')).toHaveLength(1);
  expect((sent('select_element')[0]![1] as ElementDetails).name).toMatch(/^section/);
});

it('keyboard_shortcut Escape deselects and clears the panel', () => {
  bridge.panelOpen = true;
  state.selected = document.body.appendChild(document.createElement('p'));
  flushSync();
  sidePanelHandlers.keyboard_shortcut!('Escape', {} as never);
  flushSync();
  expect(state.selected).toBeNull();
  expect(sent('clear')).toHaveLength(1);
});

it('highlight_box_part lights a Box Model part and ignores junk', () => {
  sidePanelHandlers.highlight_box_part!('padding', {} as never);
  expect(state.boxPart).toBe('padding');
  sidePanelHandlers.highlight_box_part!('evil' as never, {} as never);
  expect(state.boxPart).toBeNull();
});

it('a panel opened during responsive mode is told so, or it would drop the frames (regression)', () => {
  state.active = true;
  state.responsiveOn = true;
  sidePanelHandlers.side_panel_loaded!({} as never);
  expect(toPanel).toHaveBeenCalledWith('responsive_state', { on: true });
  state.responsiveOn = false;
});

it('a responsive frame sends its selection without waiting for the panel port (regression)', async () => {
  stopSession();
  state.inFrame = true;
  try {
    sessionSignal();
    await initSidePanelBridge();
    expect(bridge.panelOpen).toBe(true);
  } finally {
    state.inFrame = false;
  }
});

it('a responsive frame the panel follows answers with its own page data and SEO audit (gap 3)', () => {
  state.active = true;
  state.inFrame = true;
  try {
    toPanel.mockClear();
    sidePanelHandlers.refresh_page_data!({} as never);
    expect(toPanel).toHaveBeenCalledWith(
      'page_data',
      expect.objectContaining({ seoIssues: expect.any(Array) }),
    );
  } finally {
    state.inFrame = false;
  }
});
