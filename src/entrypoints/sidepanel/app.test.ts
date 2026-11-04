import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import App from './App.svelte';
import { sampleElement } from './element/sample';
import { edit } from './edit/edit-store.svelte';
import { panel } from './store.svelte';

const ui = { app: null as ReturnType<typeof mount> | null };
let send: { mock: { calls: unknown[][] } };
let bg: ReturnType<typeof vi.fn<(type: string, ...a: unknown[]) => unknown>>;

beforeEach(() => {
  fakeBrowser.reset();
  // fakeBrowser has no i18n / commands / tabs.connect: labels render as keys
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
  vi.spyOn(fakeBrowser.commands, 'getAll').mockResolvedValue([
    { name: '_execute_action', shortcut: 'Alt+Shift+S' },
    { name: 'select_parent', shortcut: 'Alt+Shift+Up' },
    { name: 'select_child', shortcut: '' },
  ] as never);
  const port = { disconnect: vi.fn(), onDisconnect: { addListener: vi.fn() } };
  fakeBrowser.tabs.connect = vi.fn(() => port) as never;
  send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never);
  bg = vi.fn<(type: string, ...a: unknown[]) => unknown>(() => ({ success: true }));
  fakeBrowser.runtime.onMessage.addListener((m: unknown, _s, reply) => {
    const p = m as { target: string; type: string; data: unknown[] };
    if (p.target !== 'background') return;
    reply(bg(p.type, ...p.data));
    return true;
  });
  vi.spyOn(window, 'close').mockImplementation(() => {});
});
afterEach(() => {
  if (ui.app) unmount(ui.app);
  ui.app = null;
  document.body.replaceChildren();
  document.documentElement.className = '';
  Object.assign(panel, {
    selectedTab: 'element',
    element: null,
    switching: false,
    shortcuts: {},
    mode: 'inspect',
  });
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function open(search = '?tabId=5') {
  history.replaceState(null, '', `/sidepanel.html${search}`);
  ui.app = mount(App, { target: document.body });
  await vi.waitFor(() => expect(panel.shortcuts._execute_action).toBeDefined());
  flushSync();
}
const sent = (type: string) =>
  send.mock.calls.filter((c) => (c[1] as { type: string }).type === type);
const toPanel = (type: string, tabId: number, ...data: unknown[]) =>
  fakeBrowser.runtime.onMessage.trigger(
    { target: 'sidepanel', type, data },
    { tab: { id: tabId } } as never,
    () => {},
  );
const button = (label: string) =>
  [...document.querySelectorAll('button')].find(
    (b) => b.textContent?.includes(label) || b.title === label,
  )!;

it('starts empty, hides unassigned shortcuts and announces itself to frame 0', async () => {
  await open();
  expect(document.body.textContent).toContain('panel_emptyInspect');
  expect(document.body.textContent).toContain('panel_shortcutParent');
  expect(document.body.textContent).not.toContain('panel_shortcutChild');
  await vi.waitFor(() => expect(sent('side_panel_loaded')).toHaveLength(1), { timeout: 500 });
  expect(sent('side_panel_loaded')[0]!.slice(0, 1)).toEqual([5]);
  expect(sent('side_panel_loaded')[0]![2]).toEqual({ frameId: 0 });
});

it('only takes select_element from its own tab', async () => {
  await open();
  await toPanel('select_element', 7, { name: 'div.other' });
  flushSync();
  expect(document.querySelector('[data-empty]')).not.toBeNull();
  await toPanel('select_element', 5, sampleElement());
  await vi.waitFor(() => expect(panel.element).not.toBeNull());
  flushSync();
  expect(document.querySelector('[data-empty]')).toBeNull();
});

it('subscribes to page weight on the Page tab and unsubscribes when hidden', async () => {
  await open();
  button('panel_tabPage').click();
  flushSync();
  expect(sent('page_weight_subscribe')).toHaveLength(1);
  const vis = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  document.dispatchEvent(new Event('visibilitychange'));
  flushSync();
  expect(sent('page_weight_unsubscribe')).toHaveLength(1);
  vis.mockRestore();
});

it('opens on the handed-off tab and drops the handoff', async () => {
  await fakeBrowser.storage.session.set({
    'panelHandoff:5': { selectedTab: 'page', scrollTop: 120, at: Date.now() },
  });
  await open();
  expect(panel.selectedTab).toBe('page');
  await vi.waitFor(async () =>
    expect(await fakeBrowser.storage.session.get('panelHandoff:5')).toEqual({}),
  );
});

it('undock leaves a handoff and asks the background to detach', async () => {
  await open();
  button('panel_undock').click();
  await vi.waitFor(() => expect(bg).toHaveBeenCalledWith('detach_panel', 5, expect.any(Object)));
  expect((await fakeBrowser.storage.session.get('panelHandoff:5'))['panelHandoff:5']).toMatchObject(
    { selectedTab: 'element' },
  );
  await vi.waitFor(() => expect(window.close).toHaveBeenCalled());
});

it('detached window shows the dock button and is-detached class', async () => {
  await open('?tabId=5&detached=1');
  expect(button('panel_dock')).toBeDefined();
  expect(document.documentElement.classList.contains('is-detached')).toBe(true);
});

it('forwards dock letter keys to the page, not when typing', async () => {
  await open();
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
  expect(sent('keyboard_shortcut')).toHaveLength(1);
  const input = document.body.appendChild(document.createElement('input'));
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
  expect(sent('keyboard_shortcut')).toHaveLength(1);
});

it('undock from the Page tab reopens the detached window on that tab and scroll', async () => {
  await open();
  button('panel_tabPage').click();
  flushSync();
  const scroller = document.scrollingElement ?? document.documentElement;
  scroller.scrollTop = 300;
  button('panel_undock').click();
  await vi.waitFor(() => expect(window.close).toHaveBeenCalled());
  unmount(ui.app!);
  scroller.scrollTop = 0;
  Object.assign(panel, { selectedTab: 'element', switching: false, shortcuts: {} });
  await open('?tabId=5&detached=1');
  expect(panel.selectedTab).toBe('page');
  await vi.waitFor(() => expect(scroller.scrollTop).toBe(300));
});

it('ignores a handoff older than 30s', async () => {
  await fakeBrowser.storage.session.set({
    'panelHandoff:5': { selectedTab: 'page', scrollTop: 120, at: Date.now() - 31_000 },
  });
  await open('?tabId=5&detached=1');
  expect(panel.selectedTab).toBe('element');
});

it('dock asks the background and closes the detached window', async () => {
  await open('?tabId=5&detached=1');
  button('panel_dock').click();
  await vi.waitFor(() => expect(bg).toHaveBeenCalledWith('dock_panel', 5));
  await vi.waitFor(() => expect(window.close).toHaveBeenCalled());
  expect(panel.switching).toBe(true);
});

it('drops select_element while switching', async () => {
  await open();
  panel.switching = true;
  await toPanel('select_element', 5, sampleElement());
  expect(panel.element).toBeNull();
});

it('follows a theme change without reopening', async () => {
  await open();
  await fakeBrowser.storage.local.set({ theme: 'light' });
  await vi.waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'));
  await fakeBrowser.storage.local.set({ theme: 'dark' });
  await vi.waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
});

it('ignores refresh_changes and edit_state from another tab', async () => {
  await open();
  edit.changes = { rules: [], html: [] };
  edit.editState = { canUndo: false, canRedo: false, editCount: 0, hasClipboard: false };
  await toPanel('refresh_changes', 7);
  await toPanel('edit_state', 7, {
    canUndo: true,
    canRedo: false,
    editCount: 3,
    hasClipboard: false,
  });
  expect(edit.changes).not.toBeNull();
  expect(edit.editState.editCount).toBe(0);
  await toPanel('edit_state', 5, {
    canUndo: true,
    canRedo: false,
    editCount: 3,
    hasClipboard: false,
  });
  expect(edit.editState.editCount).toBe(3);
});
