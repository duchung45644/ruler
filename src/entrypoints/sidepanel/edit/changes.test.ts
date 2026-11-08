import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { RuleChange } from '../../../lib/edit/types';
import { panel } from '../store.svelte';
import ChangesTab from './ChangesTab.svelte';
import type { Changes } from './edit-store.svelte';

const ok = { ok: true, canUndo: false, canRedo: false, editCount: 0, hasClipboard: false };
let ui: ReturnType<typeof mount> | null = null;
let reply: (type: string) => unknown;
let send: { mock: { calls: unknown[][] } };

beforeEach(() => {
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
  reply = (t) => (t === 'get_all_flattened_changes' ? { rules: [], html: [] } : ok);
  send = vi
    .spyOn(fakeBrowser.tabs, 'sendMessage')
    .mockImplementation((async (_t: number, p: { type: string }) => reply(p.type)) as never);
  panel.tabId = 5;
});
afterEach(() => {
  if (ui) unmount(ui);
  ui = null;
  document.body.replaceChildren();
  panel.tabId = null;
  vi.restoreAllMocks();
});

const types = () => send.mock.calls.map((c) => (c[1] as { type: string }).type);
const change = (recordId: string, patch: Partial<RuleChange> = {}): RuleChange => ({
  recordId,
  address: null,
  source: 'https://x.test/site.css',
  line: 4,
  before: '.a {\n  color: red;\n}',
  after: '.a {\n  color: blue;\n}',
  elementIds: ['v-1'],
  ...patch,
});
function open(changes: Changes) {
  ui = mount(ChangesTab, { target: document.body, props: { changes } });
  flushSync();
}
const click = async (sel: string) => {
  document.querySelector<HTMLElement>(sel)!.click();
  await Promise.resolve();
  flushSync();
};

it('groups two rule changes on one element', () => {
  open({ rules: [change('r1'), change('r2')], html: [] });
  expect(document.querySelectorAll('[data-group]')).toHaveLength(1);
  expect(document.querySelector('[data-group]')!.textContent).toContain('changes_rulesOther');
  expect(document.querySelectorAll('[data-rule-change]')).toHaveLength(2);
  expect(document.querySelector('[data-kind="+"]')!.textContent).toContain('color: blue;');
});

it('labels a whitespace-only diff', () => {
  open({
    rules: [change('r1', { before: '.a{color:red}', after: '.a { color: red }' })],
    html: [],
  });
  expect(document.querySelector('[data-whitespace]')!.textContent).toContain(
    'changes_whitespaceOnly',
  );
});

it('says when there is nothing to show', () => {
  open({ rules: [], html: [] });
  expect(document.querySelector('[data-no-changes]')!.textContent).toContain('changes_none');
});

it('clears everything only after confirming, in order', async () => {
  open({ rules: [change('r1')], html: [] });
  await click('[data-clear-all]');
  await click('[role=alertdialog] button:first-of-type');
  expect(types()).toEqual([]);
  await click('[data-clear-all]');
  await click('[role=alertdialog] button:last-of-type');
  await vi.waitFor(() =>
    expect(types()).toEqual([
      'revert_all_rule_changes',
      'clear_changes',
      'get_all_flattened_changes',
    ]),
  );
});

it('says when the element is gone or the tab cannot be reached', async () => {
  reply = (t) => (t === 'select_edited_element' ? false : ok);
  open({ rules: [change('r1')], html: [] });
  await click('[data-select]');
  await vi.waitFor(() =>
    expect(document.querySelector('[role=alertdialog]')!.textContent).toContain(
      'dialog_noSelectedElement',
    ),
  );
  await click('[role=alertdialog] button:last-of-type');
  expect(document.querySelector('[role=alertdialog]')).toBeNull();
  reply = () => {
    throw new Error('Could not establish connection');
  };
  await click('[data-select]');
  await vi.waitFor(() =>
    expect(document.querySelector('[role=alertdialog]')!.textContent).toContain(
      'dialog_tabUnavailable',
    ),
  );
});

it('groups rule changes with no element by selector and finds a match on click', async () => {
  const bare = { elementIds: [], selector: '.card', scopeAddress: null };
  open({
    rules: [change('r1', bare), change('r2', bare), change('r3', { ...bare, selector: '.b' })],
    html: [],
  });
  expect(document.querySelectorAll('[data-group]')).toHaveLength(2);
  // the dialog store is module-wide: the last test may have left one open
  if (document.querySelector('[role=alertdialog]'))
    await click('[role=alertdialog] button:last-of-type');
  reply = (t) => (t === 'select_rule_target' ? true : ok);
  await click('[data-find]');
  await vi.waitFor(() => expect(types()).toContain('select_rule_target'));
  const call = send.mock.calls.find(
    (c) => (c[1] as { type: string }).type === 'select_rule_target',
  );
  expect((call![1] as { data: unknown[] }).data.slice(0, 2)).toEqual(['.card', null]);
  expect(document.querySelector('[role=alertdialog]')).toBeNull();
  reply = (t) => (t === 'select_rule_target' ? false : ok);
  await click('[data-find]');
  await vi.waitFor(() =>
    expect(document.querySelector('[role=alertdialog]')!.textContent).toContain(
      'dialog_noSelectedElement',
    ),
  );
});
