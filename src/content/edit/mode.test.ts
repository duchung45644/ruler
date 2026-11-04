import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { sendToBackground, sendToSidePanel } from '../../lib/messaging';
import { routeKey } from '../core/keys';
import { layer } from '../core/overlay';
import { registerItem } from '../core/registry.svelte';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { initSidePanelBridge } from '../sidepanel/bridge.svelte';
import { setXray } from '../tools/xray';
import { editor, initEdit, ruleTracker, setEditMode } from '.';
import { toggleTextEdit } from './mode.svelte';

vi.mock('../../lib/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
fakeBrowser.runtime.onConnect.addListener = () => {};
fakeBrowser.runtime.onConnect.removeListener = () => {};

const order: string[] = [];
vi.mocked(sendToBackground).mockImplementation((async (t: string) => {
  order.push(t);
}) as never);
vi.mocked(sendToSidePanel).mockImplementation((async (t: string, ...a: unknown[]) => {
  order.push(`${t}:${a.join(',')}`);
}) as never);

const ran = { three: 0, eight: 0 };
registerItem({
  id: 't3',
  icon: null!,
  label: 'dock.grid',
  key: '3',
  group: 'inspectTools',
  run: () => ran.three++,
});
registerItem({
  id: 't8',
  icon: null!,
  label: 'dock.capture',
  key: '8',
  group: 'utilities',
  run: () => ran.eight++,
});

const key = (k: string, init: KeyboardEventInit = {}) =>
  routeKey(new KeyboardEvent('keydown', { key: k, cancelable: true, ...init }));

beforeEach(async () => {
  const host = document.body.appendChild(document.createElement('bo-doi-ui'));
  host.attachShadow({ mode: 'open' }).append(layer);
  state.active = true;
  sessionSignal();
  await initSidePanelBridge();
  initEdit();
  window.addEventListener('keydown', routeKey, { signal: sessionSignal() });
  order.length = 0;
  ran.three = ran.eight = 0;
});
afterEach(() => {
  stopSession();
  document.body.replaceChildren();
  document.head.replaceChildren();
});

it('opens the side panel before switching it to edit, and turns X-Ray off', async () => {
  setXray(true);
  await setEditMode(true);
  expect(order.indexOf('open_side_panel')).toBeGreaterThanOrEqual(0);
  expect(order.indexOf('open_side_panel')).toBeLessThan(order.indexOf('set_mode:edit'));
  expect(state.xrayOn).toBe(false);
  expect(state.editOn).toBe(true);
});

it('keeps only the 8 and 0 number keys in edit mode', async () => {
  await setEditMode(true);
  key('3');
  key('8');
  expect(ran).toEqual({ three: 0, eight: 1 });
  await setEditMode(false);
  key('3');
  expect(ran.three).toBe(1);
});

it('Ctrl+Z typed in an input does not undo the page', async () => {
  const p = document.body.appendChild(document.createElement('p'));
  const input = document.body.appendChild(document.createElement('input'));
  await setEditMode(true);
  state.selected = p;
  editor()!.delete();
  expect(state.editState.canUndo).toBe(true);
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
  expect(state.editState.canUndo).toBe(true);
  key('z', { ctrlKey: true });
  expect(state.editState.canUndo).toBe(false);
});

it('text editing makes the body editable, swallows link clicks and cleans up', async () => {
  const a = document.body.appendChild(document.createElement('a'));
  a.href = '#x';
  await setEditMode(true);
  toggleTextEdit();
  expect(document.body.getAttribute('contenteditable')).toBe('true');
  expect(state.textEditOn).toBe(true);
  const click = new MouseEvent('click', { bubbles: true, cancelable: true });
  a.dispatchEvent(click);
  expect(click.defaultPrevented).toBe(true);
  toggleTextEdit();
  expect(document.body.hasAttribute('contenteditable')).toBe(false);
  const again = new MouseEvent('click', { bubbles: true, cancelable: true });
  a.dispatchEvent(again);
  expect(again.defaultPrevented).toBe(false);
});

it('leaving edit mode removes its listeners but keeps the CSS edit style', async () => {
  document.head.append(Object.assign(document.createElement('style'), { textContent: '.a{}' }));
  await setEditMode(true);
  toggleTextEdit();
  ruleTracker().addRule(document, '.b', []);
  const styleId = ruleTracker().styleId;
  await setEditMode(false);
  expect(state.textEditOn).toBe(false);
  expect(document.body.hasAttribute('contenteditable')).toBe(false);
  expect(document.getElementById(styleId)).not.toBeNull();
  expect(editor()).toBeNull();
});

it('edit keys do nothing while typing in an input inside a page shadow root (§9)', async () => {
  const p = document.body.appendChild(document.createElement('p'));
  const host = document.body.appendChild(document.createElement('div'));
  const input = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'));
  await setEditMode(true);
  state.selected = p;
  const typed = (k: string, init: KeyboardEventInit = {}) =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, ...init }),
    );
  typed('Delete');
  typed('Backspace');
  typed('d', { ctrlKey: true });
  expect(p.hasAttribute('style')).toBe(false);
  expect(document.querySelectorAll('p')).toHaveLength(1);
  expect(state.editState.canUndo).toBe(false);
});

it('text editing leaves clicks and input in the extension UI alone', async () => {
  const ui = document.querySelector('bo-doi-ui')!;
  const button = ui.shadowRoot!.appendChild(document.createElement('button'));
  await setEditMode(true);
  toggleTextEdit();
  const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
  button.dispatchEvent(click);
  expect(click.defaultPrevented).toBe(false);
  expect(ui.hasAttribute('contenteditable')).toBe(false);
  button.dispatchEvent(
    new InputEvent('beforeinput', { inputType: 'insertText', bubbles: true, composed: true }),
  );
  toggleTextEdit();
  expect(state.editState.canUndo).toBe(false);
});

it('end to end: a rule edit is listed, saved, and still applied after a session restart', async () => {
  (window as unknown as { happyDOM: { setURL(u: string): void } }).happyDOM.setURL(
    'https://site.test/page',
  );
  const style = document.head.appendChild(
    Object.assign(document.createElement('style'), { textContent: '.card { color: red; }' }),
  );
  const color = () => (style.sheet!.cssRules[0] as CSSStyleRule).style.color;
  ruleTracker().revertAll(); // page-wide: earlier tests may have left edits
  const p = document.body.appendChild(document.createElement('p'));
  p.className = 'card';
  await setEditMode(true);
  state.selected = p;
  const { editHandlers: h } = await import('./handlers');
  const payload = (await h.get_rule_edit_payload!({} as never))!;
  const rule = payload.rules.find((r) => r.address?.selector === '.card')!;
  expect((await h.rule_edit!(rule.address!, 'color: blue;', {} as never)).ok).toBe(true);
  const changes = await h.get_all_flattened_changes!({} as never);
  expect(changes.rules).toHaveLength(1);
  stopSession(); // flushes the save timer
  await vi.waitFor(async () =>
    expect(await fakeBrowser.storage.local.get('persistedRuleEdits:https://site.test')).not.toEqual(
      {},
    ),
  );
  expect(color()).toBe('blue');

  state.active = true;
  sessionSignal();
  await initSidePanelBridge();
  initEdit();
  await new Promise((r) => setTimeout(r, 0));
  expect(ruleTracker().flattened()).toHaveLength(1);
  expect(color()).toBe('blue');
  ruleTracker().revertAll();
});

it('Inspect mode after Edit turns the inspector on even if it was off before (regression)', async () => {
  const { items } = await import('../core/registry.svelte');
  const inspect = items.find((i) => i.id === 'inspect');
  const run = inspect
    ? vi.spyOn(inspect, 'run').mockImplementation(() => (state.inspectOn = true))
    : null;
  state.inspectOn = false;
  await setEditMode(true);
  items.find((i) => i.id === 'inspectMode')!.run();
  expect(state.editOn).toBe(false);
  expect(state.inspectOn).toBe(true);
  run?.mockRestore();
});
