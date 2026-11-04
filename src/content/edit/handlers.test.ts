import { flushSync } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { ElementDetails } from '../../lib/element/types';
import type { RuleAddress } from '../../lib/edit/rule-address';
import type { EditResult } from '../../lib/edit/types';
import { sendToSidePanel } from '../../lib/messaging';
import { layer } from '../core/overlay';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { bridge, initSidePanelBridge } from '../sidepanel/bridge.svelte';
import { initEdit, setEditMode } from '.';
import { editHandlers as h, notifyChanged } from './handlers';

vi.mock('../../lib/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
fakeBrowser.runtime.onConnect.addListener = () => {};
fakeBrowser.runtime.onConnect.removeListener = () => {};

const toPanel = vi.mocked(sendToSidePanel);
const sent = (type: string) => toPanel.mock.calls.filter((c) => c[0] === type);
const sender = {} as never;
const tick = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  const host = document.body.appendChild(document.createElement('bo-doi-ui'));
  host.attachShadow({ mode: 'open' }).append(layer);
  state.active = true;
  sessionSignal();
  await initSidePanelBridge();
  initEdit();
  await setEditMode(true);
  await tick();
  toPanel.mockClear();
});
afterEach(() => {
  stopSession();
  bridge.panelOpen = false;
  document.body.replaceChildren();
  document.head.replaceChildren();
});

it('replies with the edit state and batches refresh_changes per microtask', async () => {
  state.selected = document.body.appendChild(document.createElement('p'));
  // the engine's own change notice and two more, all in one tick
  const r = h.edit_delete!(sender) as EditResult;
  notifyChanged();
  notifyChanged();
  expect(r).toMatchObject({ ok: true, canUndo: true });
  await tick();
  expect(sent('refresh_changes')).toHaveLength(1);
  expect(sent('edit_state')[0]![1]).toMatchObject({ canUndo: true });
});

it('rejects a bad selector', async () => {
  const addr: RuleAddress = {
    stylesheet: 'x',
    selector: '.a',
    wrappers: [],
    occ: 0,
    scopeAddress: null,
  };
  expect(await h.rule_selector_edit!(addr, '..', sender)).toMatchObject({
    ok: false,
    error: 'Invalid selector',
  });
});

it('revert_all_edits restores the page and drops the ids it attached', async () => {
  const p = document.body.appendChild(document.createElement('p'));
  p.className = 'a';
  state.selected = p;
  await h.edit_delete!(sender);
  expect(p.getAttributeNames().some((n) => n.startsWith('data-sr-id'))).toBe(true);
  await h.revert_all_edits!(sender);
  expect(p.getAttributeNames().some((n) => n.startsWith('data-sr-id'))).toBe(false);
  expect(p.getAttribute('style')).toBeNull();
});

it('select_element carries the rule payload in edit mode; deselect sends clear', async () => {
  document.head.append(
    Object.assign(document.createElement('style'), { textContent: '.a { color: red; }' }),
  );
  const p = document.body.appendChild(document.createElement('p'));
  p.className = 'a';
  bridge.panelOpen = true;
  state.selected = p;
  flushSync();
  await tick();
  const d = sent('select_element').at(-1)![1] as ElementDetails;
  expect(d.edit!.payload.rules.length).toBeGreaterThan(0);
  toPanel.mockClear();
  state.selected = null;
  flushSync();
  expect(sent('clear')).toHaveLength(1);
});

it('get_page_classes lists sorted unique classes', async () => {
  document.body.insertAdjacentHTML('beforeend', '<i class="b a"></i><i class="a c"></i>');
  expect(await h.get_page_classes!(sender)).toEqual(['a', 'b', 'c']);
});
