import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { EditableRule, RulePayload } from '../../../lib/edit/types';
import { sampleElement } from '../element/sample';
import { panel } from '../store.svelte';
import ClassInput from './ClassInput.svelte';
import CssEditor from './CssEditor.svelte';
import StateSelect from './StateSelect.svelte';
import { clearEdit, edit } from './edit-store.svelte';

const ok = { ok: true, canUndo: true, canRedo: false, editCount: 1, hasClipboard: false };
let ui: ReturnType<typeof mount> | null = null;
let reply: (type: string, data: unknown[]) => unknown;
let send: { mock: { calls: unknown[][] } };

beforeEach(() => {
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
  reply = (type) => (type === 'get_page_classes' ? ['card', 'lead'] : ok);
  send = vi
    .spyOn(fakeBrowser.tabs, 'sendMessage')
    .mockImplementation((async (_t: number, p: { type: string; data: unknown[] }) =>
      reply(p.type, p.data)) as never);
  panel.tabId = 5;
  vi.stubGlobal('CSS', { supports: (p: string) => p !== 'foo' });
});
afterEach(() => {
  if (ui) unmount(ui);
  ui = null;
  document.body.replaceChildren();
  clearEdit();
  panel.tabId = null;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const sent = (type: string) =>
  send.mock.calls
    .map((c) => c[1] as { type: string; data: unknown[] })
    .filter((p) => p.type === type)
    .map((p) => p.data);
const rule = (patch: Partial<EditableRule> = {}): EditableRule => ({
  selector: '.card',
  wrappers: [],
  mediaActive: true,
  specificity: [0, 1, 0],
  sourceIndex: 0,
  score: 10,
  source: 'https://x.test/site.css',
  declarations: [{ property: 'padding', value: '10px', important: false }],
  address: { stylesheet: 'site.css', selector: '.card', wrappers: [], occ: 0, scopeAddress: null },
  editable: true,
  line: 3,
  ...patch,
});
const payload = (rules = [rule()]): RulePayload => ({
  rules,
  inline: [],
  availableStates: [':hover', ':focus'],
  forcedState: null,
  paySeq: 1,
  crossOriginMissing: 0,
});
function editor(p = payload()) {
  ui = mount(CssEditor, { target: document.body, props: { el: sampleElement(), payload: p } });
  flushSync();
}
function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  flushSync();
}
const key = (input: Element, k: string, init: KeyboardEventInit = {}) => {
  input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...init }));
  flushSync();
};
const field = (row: number, f: 'property' | 'value') =>
  document.querySelectorAll<HTMLInputElement>(`[data-rule] [data-field="${f}"]`)[row]!;

it('suggests property names: Tab takes the first, Esc closes the list', () => {
  editor();
  const blank = field(1, 'property');
  type(blank, 'colo');
  const items = [...document.querySelectorAll('[data-suggest] li')].map((li) => li.textContent);
  expect(items[0]?.trim()).toBe('color');
  key(blank, 'Tab');
  expect(blank.value).toBe('color');
  expect(document.querySelector('[data-suggest]')).toBeNull();
  type(blank, 'back');
  expect(document.querySelector('[data-suggest]')).not.toBeNull();
  key(blank, 'Escape');
  expect(document.querySelector('[data-suggest]')).toBeNull();
});

it('steps a number with ArrowUp and commits it as a rule edit', async () => {
  vi.useFakeTimers();
  editor();
  const value = field(0, 'value');
  value.setSelectionRange(1, 1);
  key(value, 'ArrowUp');
  expect(value.value).toBe('11px');
  await vi.advanceTimersByTimeAsync(150);
  expect(sent('rule_edit')).toEqual([[rule().address, 'padding: 11px;']]);
});

it('flags an unknown property', () => {
  editor();
  const blank = field(1, 'property');
  type(blank, 'foo: bar');
  const row = blank.closest('[data-row]')!;
  expect(row.getAttribute('data-mark')).toBe('invalid-property');
  expect(row.getAttribute('title')).toBe('edit_invalidProperty');
});

it('puts the old selector back when the page rejects the new one', async () => {
  reply = (t) =>
    t === 'rule_selector_edit' ? { ...ok, ok: false, error: 'Invalid selector' } : ok;
  editor();
  const input = document.querySelector<HTMLInputElement>('[data-selector-input]')!;
  type(input, '.card[');
  input.dispatchEvent(new FocusEvent('blur'));
  await vi.waitFor(() => expect(sent('rule_selector_edit')).toHaveLength(1));
  await vi.waitFor(() => expect(input.value).toBe('.card'));
  flushSync();
  expect(input.className).toContain('border-red-500');
});

it('sends edit_undo for Ctrl+Z in the class field, not a class edit', async () => {
  vi.useFakeTimers();
  ui = mount(ClassInput, { target: document.body, props: { id: 'v-1' } });
  flushSync();
  const input = document.querySelector<HTMLInputElement>('[data-class-input]')!;
  type(input, 'card x');
  key(input, 'z', { ctrlKey: true });
  await vi.advanceTimersByTimeAsync(400);
  expect(sent('edit_undo')).toHaveLength(1);
  expect(sent('set_element_classes')).toHaveLength(0);
});

it('shows the classes the page resends after undo, unless typing is pending', async () => {
  vi.useFakeTimers();
  edit.classes = 'card lead';
  ui = mount(ClassInput, { target: document.body, props: { id: 'v-1' } });
  flushSync();
  const input = document.querySelector<HTMLInputElement>('[data-class-input]')!;
  expect(input.value).toBe('card lead');
  edit.classes = 'card';
  flushSync();
  expect(input.value).toBe('card');
  type(input, 'card x');
  edit.classes = 'other';
  flushSync();
  expect(input.value).toBe('card x');
});

it('forces the picked state', async () => {
  ui = mount(StateSelect, { target: document.body, props: { payload: payload() } });
  flushSync();
  const select = document.querySelector<HTMLSelectElement>('[data-state-select]')!;
  select.value = ':hover';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  await vi.waitFor(() => expect(sent('force_element_state')).toEqual([[':hover']]));
});
