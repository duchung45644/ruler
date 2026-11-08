import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { sendToSidePanel } from '../../lib/ext/messaging';
import { layer } from '../core/overlay';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { initEdit, setEditMode } from '../edit';
import { editState } from '../edit/mode.svelte';
import { persistNow } from '../edit/persist';
import { elementId, initSidePanelBridge } from '../sidepanel/bridge.svelte';
import { runMcp } from '.';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));

const KEY = 'persistedRuleEdits:https://site.test';
const tick = () => new Promise((r) => setTimeout(r, 0));
const run = (type: Parameters<typeof runMcp>[0], payload: object) =>
  runMcp(type, { tabId: 1, ...payload });
const saved = async () =>
  (await fakeBrowser.storage.local.get(KEY))[KEY] as
    { edits?: unknown[]; inline?: unknown[] } | undefined;

beforeEach(async () => {
  (window as unknown as { happyDOM: { setURL(u: string): void } }).happyDOM.setURL(
    'https://site.test/page',
  );
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
  const host = document.body.appendChild(document.createElement('iodob-ui'));
  host.attachShadow({ mode: 'open' }).append(layer);
  state.active = true;
  sessionSignal();
  await initSidePanelBridge();
  initEdit();
  await setEditMode(true);
  await tick();
});
afterEach(() => {
  stopSession();
  state.active = false;
  document.body.replaceChildren();
  document.head.replaceChildren();
});

it('styles inline through the engine: undoable, listed, saved, panel refreshed', async () => {
  const p = document.body.appendChild(document.createElement('p'));
  p.setAttribute('style', 'margin: 1px');
  const id = elementId(p);
  vi.mocked(sendToSidePanel).mockClear();
  expect(await run('apply_styles', { elementId: id, styles: { color: 'red' } })).toMatchObject({
    ok: true,
  });
  expect(p.getAttribute('style')).toBe('margin: 1px; color: red;');
  const edits = await run('get_my_edits', {});
  expect((edits as { data: { ruleChanges: unknown[] } }).data.ruleChanges).toHaveLength(1);
  await persistNow();
  expect((await saved())?.inline).toHaveLength(1);
  await tick();
  expect(vi.mocked(sendToSidePanel).mock.calls.some(([t]) => t === 'refresh_changes')).toBe(true);
});

it('refuses state / media / pseudo with the legacy message', async () => {
  const id = elementId(document.body.appendChild(document.createElement('p')));
  expect(
    await run('apply_styles', { elementId: id, styles: { color: 'red' }, state: ':hover' }),
  ).toEqual({
    ok: false,
    error:
      'state/media/pseudo are no longer supported by apply_styles. Update the iodob MCP server.',
  });
});

it('sanitizes html and joins the undo history', async () => {
  const div = document.body.appendChild(document.createElement('div'));
  const id = elementId(div);
  expect(
    await run('set_inner_html', {
      elementId: id,
      html: '<b onclick="x()">hi</b><script>1</script>',
    }),
  ).toMatchObject({ ok: true });
  expect(div.innerHTML).toBe('<b>hi</b>');
  expect(editState().canUndo).toBe(true);
  await run('insert_html', { elementId: id, html: '<i>z</i>', position: 'append' });
  expect(div.lastElementChild?.localName).toBe('i');
});

it('protects html / head / body', async () => {
  const id = elementId(document.body);
  expect(await run('set_text_content', { elementId: id, text: 'x' })).toEqual({
    ok: false,
    error: 'Cannot edit <body>. Target a child element instead.',
  });
  expect(await run('insert_html', { elementId: id, html: 'x', position: 'before' })).toMatchObject({
    ok: false,
  });
});

it('adds a rule with styles and reverts all, clearing the saved copy', async () => {
  document.body.appendChild(document.createElement('p')).className = 'x';
  const r = await run('add_rule', { selector: '.x', wrappers: [], styles: { color: 'blue' } });
  expect(r).toMatchObject({ ok: true, data: { success: true } });
  await persistNow();
  expect((await saved())?.edits).toHaveLength(1);
  expect(await run('revert_all_edits', {})).toMatchObject({ ok: true });
  expect(await saved()).toBeUndefined();
  const left = await run('get_my_edits', {});
  expect(left).toMatchObject({ data: { ruleChanges: [], htmlChanges: [] } });
});

it('points to get_my_edits for an unknown change id', async () => {
  expect(await run('revert_css_change', { changeId: 'nope' })).toEqual({
    ok: false,
    error: 'No CSS change with id nope. Call get_my_edits for the current ids.',
  });
});

it('deletes and duplicates the named element', async () => {
  const p = document.body.appendChild(document.createElement('p'));
  p.textContent = 'a';
  expect(await run('duplicate_element', { elementId: elementId(p) })).toMatchObject({ ok: true });
  expect(document.querySelectorAll('p')).toHaveLength(2);
  expect(await run('delete_element', { elementId: elementId(p) })).toMatchObject({ ok: true });
  expect(p.style.display).toBe('none');
  expect(await run('set_element_classes', { elementId: elementId(p), classes: 'k' })).toMatchObject(
    { ok: true },
  );
  expect(p.className).toBe('k');
});
