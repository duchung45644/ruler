import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { layer } from '../core/overlay';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { initEdit, setEditMode } from '../edit';
import { editHandlers } from '../edit/handlers';
import { elementId, initSidePanelBridge } from '../sidepanel/bridge.svelte';
import { runMcp } from '.';

vi.mock('../../lib/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
fakeBrowser.runtime.onConnect.addListener = () => {};
fakeBrowser.runtime.onConnect.removeListener = () => {};

const tick = () => new Promise((r) => setTimeout(r, 0));
const data = async (type: Parameters<typeof runMcp>[0], payload: object) => {
  const r = await runMcp(type, { tabId: 1, ...payload });
  if (!r.ok) throw new Error(r.error);
  return r.data as Record<string, unknown>;
};

beforeEach(async () => {
  const host = document.body.appendChild(document.createElement('bo-doi-ui'));
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

it('gives rules a ruleRef that merge_rule_styles accepts', async () => {
  document.head.innerHTML = '<style>.a { color: red; } p.a:hover { color: blue; }</style>';
  const p = document.body.appendChild(document.createElement('p'));
  p.className = 'a';
  p.setAttribute('style', 'margin: 1px');
  const id = elementId(p);
  const r = await data('get_element_matched_rules', { elementId: id });
  const rules = r.rules as { ruleRef: never; selector: string; declsText: string }[];
  expect(r).toMatchObject({ id, truncated: 0, inlineStyle: 'margin: 1px' });
  const rule = rules.find((x) => x.selector === '.a')!;
  expect(rule.declsText).toBe('color: red;');
  const res = editHandlers.merge_rule_styles!(
    rule.ruleRef,
    [{ property: 'color', value: 'green', important: false }],
    {} as never,
  );
  expect(res).toMatchObject({ ok: true });
  expect((document.styleSheets[0]!.cssRules[0] as CSSStyleRule).style.color).toBe('green');
});

it('keeps the best 60 rules and counts the rest', async () => {
  document.head.innerHTML = `<style>${Array.from({ length: 65 }, (_, i) => `.a { --v${i}: 1; }`).join('')}</style>`;
  const p = document.body.appendChild(document.createElement('p'));
  p.className = 'a';
  const r = await data('get_element_matched_rules', { elementId: elementId(p) });
  expect(r.rules).toHaveLength(60);
  expect(r.truncated).toBe(5);
});

it('reports a missing element without opening a dialog', async () => {
  expect(await runMcp('get_element_details', { tabId: 1, elementId: 'v-gone' })).toEqual({
    ok: false,
    error: 'No element found with id v-gone.',
  });
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
});

it('selects, outlines, queries and reports the selection', async () => {
  document.body.insertAdjacentHTML('beforeend', '<main><h2>A</h2><h2>B</h2></main>');
  expect(await runMcp('get_selected_element', { tabId: 1 })).toMatchObject({ ok: false });
  const q = await data('query_selector', { selector: 'h2', limit: 1 });
  expect(q).toMatchObject({ count: 2, truncated: 1 });
  const first = (q.matches as { id: string }[])[0]!.id;
  await data('select_element', { elementId: first });
  expect(state.selected?.textContent).toBe('A');
  const sel = await data('get_selected_element', {});
  expect(sel.element).toMatchObject({ id: first, tag: 'h2' });
  const out = await data('get_element_outline', {
    elementId: elementId(document.querySelector('main')!),
  });
  expect((out.outline as { children: unknown[] }).children).toHaveLength(2);
  const many = await data('get_elements_details', { elementIds: [first, 'v-gone'] });
  expect(many).toMatchObject({ notFound: ['v-gone'] });
});

it('forces a state on the element', async () => {
  document.head.innerHTML = '<style>p:hover { color: blue; }</style>';
  const p = document.body.appendChild(document.createElement('p'));
  await data('force_element_state', { elementId: elementId(p), state: ':hover' });
  expect(getComputedStyle(p).color).toBe('blue');
  await data('force_element_state', { elementId: elementId(p), state: null });
  expect(getComputedStyle(p).color).not.toBe('blue');
});
