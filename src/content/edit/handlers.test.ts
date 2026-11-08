import { flushSync } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ElementDetails } from '../../lib/element/types';
import type { RuleAddress } from '../../lib/edit/rule-address';
import type { EditResult } from '../../lib/edit/types';
import { sendToSidePanel } from '../../lib/ext/messaging';
import { layer } from '../core/overlay';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { bridge, initSidePanelBridge } from '../sidepanel/bridge.svelte';
import { initEdit, setEditMode } from '.';
import { editState, setSharedHistoryState, setUndoRoute } from './mode.svelte';
import { editHandlers as h, notifyChanged } from './handlers';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));

const toPanel = vi.mocked(sendToSidePanel);
const sent = (type: string) => toPanel.mock.calls.filter((c) => c[0] === type);
const sender = {} as never;
const tick = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  const host = document.body.appendChild(document.createElement('iodob-ui'));
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

const hasId = (el: Element) => el.getAttributeNames().some((n) => n.startsWith('data-sr-id'));

it('panel open: the id the bridge attached in edit mode goes with undo and revert (2.24)', async () => {
  const p = document.body.appendChild(document.createElement('p'));
  bridge.panelOpen = true;
  state.selected = p;
  flushSync();
  await tick();
  expect(hasId(p)).toBe(true);
  const id = (sent('select_element').at(-1)![1] as ElementDetails).id;
  h.set_element_classes!(id, 'b', sender);
  // checked before the resend re-tags the still-selected element for the panel
  h.edit_undo!(sender);
  expect(hasId(p)).toBe(false);
  await tick();

  state.selected = null;
  flushSync();
  state.selected = p;
  flushSync();
  await tick();
  const id2 = (sent('select_element').at(-1)![1] as ElementDetails).id;
  h.set_element_classes!(id2, 'c', sender);
  h.revert_all_edits!(sender);
  expect(hasId(p)).toBe(false);
});

it('undo / redo and class edits resend the selection with its current classes', async () => {
  const p = document.body.appendChild(document.createElement('p'));
  p.className = 'a';
  bridge.panelOpen = true;
  state.selected = p;
  flushSync();
  await tick();
  const id = (sent('select_element').at(-1)![1] as ElementDetails).id;
  toPanel.mockClear();
  await h.set_element_classes!(id, 'a b', sender);
  await tick();
  expect((sent('select_element').at(-1)![1] as ElementDetails).edit!.classes).toBe('a b');
  toPanel.mockClear();
  await h.edit_undo!(sender);
  await tick();
  expect((sent('select_element').at(-1)![1] as ElementDetails).edit!.classes).toBe('a');
  toPanel.mockClear();
  await h.edit_redo!(sender);
  await tick();
  expect((sent('select_element').at(-1)![1] as ElementDetails).edit!.classes).toBe('a b');
});

it('select_rule_target selects the first match, or reports none', async () => {
  document.body.insertAdjacentHTML('beforeend', '<i class="k"></i><b class="k"></b>');
  expect(await h.select_rule_target!('.k', null, sender)).toBe(true);
  expect(state.selected).toBe(document.querySelector('i.k'));
  expect(await h.select_rule_target!('.none', null, sender)).toBe(false);
  expect(await h.select_rule_target!('..', null, sender)).toBe(false);
});

it('responsive: panel undo / redo step the shared history, and its flags win (8.20)', async () => {
  const p = document.body.appendChild(document.createElement('p'));
  bridge.panelOpen = true;
  state.selected = p;
  flushSync();
  await tick();
  const id = (sent('select_element').at(-1)![1] as ElementDetails).id;
  await h.set_element_classes!(id, 'x', sender);
  const route = vi.fn(() => true);
  setUndoRoute(route);
  setSharedHistoryState({ canUndo: false, canRedo: true });
  try {
    const r = (await h.edit_undo!(sender)) as EditResult;
    expect(route).toHaveBeenLastCalledWith(false);
    // the local engine was not stepped: the class edit is still there
    expect(p.className).toBe('x');
    expect(r).toMatchObject({ ok: true, canUndo: false, canRedo: true });
    await h.edit_redo!(sender);
    expect(route).toHaveBeenLastCalledWith(true);
    expect(editState()).toMatchObject({ canUndo: false, canRedo: true });
  } finally {
    setUndoRoute(null);
    setSharedHistoryState(null);
  }
  expect(editState().canUndo).toBe(true);
});
