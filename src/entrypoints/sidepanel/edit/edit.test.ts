import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { RulePayload } from '../../../lib/edit/types';
import App from '../App.svelte';
import { sampleElement } from '../test-fixtures';
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
  Object.assign(panel, { selectedTab: 'element', element: null, shortcuts: {} });
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
  forcedStates: [],
  paySeq,
  crossOriginMissing: 0,
});

it('the Element tab carries the edit toolbar and the CSS rules of the selection', async () => {
  await open();
  const d = { ...sampleElement(), edit: { payload: payload(1), editCount: 0, classes: '' } };
  await toPanel('select_element', 0, d);
  expect(document.querySelector('[data-edit-toolbar] [data-action="edit_cut"]')).not.toBeNull();
  expect(document.querySelector('[data-section="cssRules"]')).not.toBeNull();
  (document.querySelector('[data-tab="changes"]') as HTMLElement).click();
  flushSync();
  expect(document.querySelector('[data-changes-view]')).not.toBeNull();
  expect(document.querySelector('[data-edit-toolbar]')).toBeNull();
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

it('shows the edit count from edit_state on the Changes tab', async () => {
  await open();
  const d = { ...sampleElement(), edit: { payload: payload(1), editCount: 0, classes: '' } };
  await toPanel('select_element', 0, d);
  await toPanel('edit_state', 0, {
    canUndo: true,
    canRedo: false,
    editCount: 1,
    hasClipboard: false,
  });
  expect(document.querySelector('[data-edit-count]')?.textContent).toBe('1');
  const undo = document.querySelector<HTMLButtonElement>('[data-action="edit_undo"]')!;
  expect(undo.disabled).toBe(false);
});
