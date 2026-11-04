import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { RulePayload } from '../../../lib/edit/types';
import App from '../App.svelte';
import { sampleElement } from '../element/sample';
import { panel } from '../store.svelte';
import { clearEdit, edit } from './edit-store.svelte';

const ui = { app: null as ReturnType<typeof mount> | null };

beforeEach(() => {
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
  vi.spyOn(fakeBrowser.commands, 'getAll').mockResolvedValue([
    { name: '_execute_action', shortcut: 'Alt+Shift+S' },
  ] as never);
  const port = { disconnect: vi.fn(), onDisconnect: { addListener: vi.fn() } };
  fakeBrowser.tabs.connect = vi.fn(() => port) as never;
  vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never);
});
afterEach(() => {
  if (ui.app) unmount(ui.app);
  ui.app = null;
  document.body.replaceChildren();
  Object.assign(panel, { mode: 'inspect', element: null, shortcuts: {} });
  clearEdit();
  edit.editState = { canUndo: false, canRedo: false, editCount: 0, hasClipboard: false };
  vi.restoreAllMocks();
});

async function open() {
  history.replaceState(null, '', '/sidepanel.html?tabId=5');
  ui.app = mount(App, { target: document.body });
  await vi.waitFor(() => expect(panel.shortcuts._execute_action).toBeDefined());
  flushSync();
}
const toPanel = async (type: string, frameId: number, ...data: unknown[]) => {
  await fakeBrowser.runtime.onMessage.trigger(
    { target: 'sidepanel', type, data },
    { tab: { id: 5 }, frameId } as never,
    () => {},
  );
  flushSync();
};
const payload = (paySeq: number): RulePayload => ({
  rules: [],
  inline: [],
  availableStates: [],
  forcedState: null,
  paySeq,
  crossOriginMissing: 0,
});

it('switches to the edit view only on set_mode from frame 0', async () => {
  await open();
  await toPanel('set_mode', 2, 'edit');
  expect(document.querySelector('[data-edit-view]')).toBeNull();
  await toPanel('set_mode', 0, 'edit');
  expect(document.querySelector('[data-edit-view]')).not.toBeNull();
  expect(document.querySelector('[data-tab="css"]')).not.toBeNull();
  expect(document.body.textContent).toContain('edit_emptyEdit');
  await toPanel('set_mode', 0, 'inspect');
  expect(document.querySelector('[data-edit-view]')).toBeNull();
});

it('the Edit tab turns edit mode on in the page and shows the edit actions', async () => {
  await open();
  const send = vi.mocked(fakeBrowser.tabs.sendMessage);
  (document.querySelector('[data-tab="edit"]') as HTMLElement).click();
  flushSync();
  expect(document.querySelector('[data-edit-toolbar] [data-action="edit_cut"]')).not.toBeNull();
  expect(send.mock.calls.some(([, m]) => (m as { type: string }).type === 'set_edit_mode')).toBe(
    true,
  );
  (document.querySelector('[data-tab="element"]') as HTMLElement).click();
  flushSync();
  expect(document.querySelector('[data-edit-view]')).toBeNull();
});

it('keeps an edit selection that arrives before the edit view mounts', async () => {
  await open();
  const d = { ...sampleElement(), edit: { payload: payload(1), editCount: 0, classes: '' } };
  await toPanel('select_element', 0, d);
  // the details flipped the mode; hold the inspect view to stand for one not yet mounted
  panel.mode = 'inspect';
  flushSync();
  expect(document.querySelector('[data-edit-header]')).toBeNull();
  await toPanel('set_mode', 0, 'edit');
  expect(document.querySelector('[data-edit-header]')?.textContent).toContain(d.name);
});

it('drops edit_payload_extras for an older payload', async () => {
  await open();
  const d = { ...sampleElement(), edit: { payload: payload(2), editCount: 0, classes: '' } };
  await toPanel('select_element', 0, d);
  const rule = {
    selector: 'body',
    wrappers: [],
    declarations: [],
    source: 'style',
    line: null,
    editable: false,
  } as never;
  await toPanel('edit_payload_extras', 0, 1, [rule]);
  expect(edit.inherited).toEqual([]);
  await toPanel('edit_payload_extras', 0, 2, [rule]);
  expect(edit.inherited).toEqual([rule]);
});

it('shows the edit count from edit_state', async () => {
  await open();
  const d = { ...sampleElement(), edit: { payload: payload(1), editCount: 0, classes: '' } };
  await toPanel('select_element', 0, d);
  await toPanel('edit_state', 0, {
    canUndo: true,
    canRedo: false,
    editCount: 1,
    hasClipboard: false,
  });
  expect(document.querySelector('[data-edit-count]')?.textContent).toBe('edit_countOne');
  const undo = document.querySelector<HTMLButtonElement>('[data-action="edit_undo"]')!;
  expect(undo.disabled).toBe(false);
});
