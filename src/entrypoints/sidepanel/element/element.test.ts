import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { ElementDetails } from '../../../lib/element/types';
import { DEFAULT_PANEL_PREFS, getPanelPrefs } from '../../../lib/settings';
import { panel } from '../store.svelte';
import ElementTab from './ElementTab.svelte';
import { sampleElement } from './sample';

let app: ReturnType<typeof mount> | null = null;
/** Every message in send order: [target, type, ...data]. */
let log: unknown[][];
let bg: ReturnType<typeof vi.fn<(type: string, ...a: unknown[]) => unknown>>;
let page: ReturnType<typeof vi.fn<(type: string, ...a: unknown[]) => unknown>>;

/** Every section open, so the tests see their contents (the shipped default is all closed). */
const openPrefs = () => {
  const p = structuredClone(DEFAULT_PANEL_PREFS);
  for (const v of Object.values(p.sectionVisibility)) v.collapsed = false;
  return p;
};

beforeEach(() => {
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string, subs?: string[]) =>
    subs ? `${key} ${subs.join(' ')}` : key) as typeof fakeBrowser.i18n.getMessage;
  log = [];
  page = vi.fn<(type: string, ...a: unknown[]) => unknown>(() => undefined);
  bg = vi.fn<(type: string, ...a: unknown[]) => unknown>(() => true);
  vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockImplementation((async (_t: number, m: unknown) => {
    const p = m as { type: string; data: unknown[] };
    log.push(['page', p.type, ...p.data]);
    return page(p.type, ...p.data);
  }) as never);
  fakeBrowser.runtime.onMessage.addListener((m: unknown, _s, reply) => {
    const p = m as { target: string; type: string; data: unknown[] };
    if (p.target !== 'background') return;
    log.push(['bg', p.type, ...p.data]);
    reply(bg(p.type, ...p.data));
    return true;
  });
  Object.assign(panel, { tabId: 5, prefs: openPrefs(), issues: null });
});
afterEach(() => {
  if (app) unmount(app);
  app = null;
  document.body.replaceChildren();
  Object.assign(panel, { tabId: null, element: null, issues: null });
  vi.restoreAllMocks();
});

function show(el: ElementDetails = sampleElement()) {
  app = mount(ElementTab, { target: document.body, props: { el } });
  flushSync();
}
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const types = (target: string) => log.filter((l) => l[0] === target).map((l) => l[1]);

it('shows the header and goes to the tab before selecting the element', async () => {
  show();
  expect($('[data-selector]').textContent).toBe('p.lead');
  expect($('[data-size]').textContent).toBe('100 × 20.25');
  $('[data-selector]').click();
  await vi.waitFor(() => expect(types('page')).toContain('go_to_selected_element'));
  expect(log.filter((l) => l[1] !== 'get_history_state').map((l) => l.slice(0, 3))).toEqual([
    ['bg', 'go_to_tab', 5],
    ['page', 'go_to_selected_element', 'v-1'],
  ]);
});

it('shows non-zero box sides and dashes for the rest', () => {
  show();
  const margin = $('[data-ring="margin"]');
  expect(margin.querySelector('[data-side="top"]')!.textContent).toBe('8');
  for (const side of ['right', 'bottom', 'left'])
    expect(margin.querySelector(`:scope > [data-side="${side}"]`)!.textContent).toBe('-');
});

it('asks for matched rules once per element and offers cross-origin access', async () => {
  page.mockImplementation((type) =>
    type === 'get_matched_rules' ? { success: true, matchedRules: [] } : undefined,
  );
  bg.mockImplementation((type) => (type === 'has_host_permission' ? false : true));
  show(sampleElement({ skippedCrossOriginCount: 2 }));
  $('[data-mode="source"]').click();
  flushSync();
  await vi.waitFor(() => expect($('[data-code="source"]').textContent).toContain('noMatchedRules'));
  $('[data-mode="css"]').click();
  flushSync();
  $('[data-mode="source"]').click();
  flushSync();
  await vi.waitFor(() => expect($('[data-cross-origin]')?.textContent).toContain('2'));
  expect(types('page').filter((t) => t === 'get_matched_rules')).toHaveLength(1);
  expect((await getPanelPrefs()).codeViewMode).toBe('source');
});

it('shows and copies the Tailwind classes', async () => {
  const write = vi.fn(async () => {});
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: write },
    configurable: true,
  });
  show();
  $('[data-mode="tailwind"]').click();
  flushSync();
  const classes = 'flex px-[8px] py-[4px] text-[16px] text-[rgb(31,41,55)]';
  expect($('[data-tailwind]').textContent).toBe(classes);
  $('[data-section="css"] [data-copy]').click();
  await vi.waitFor(() => expect(write).toHaveBeenCalledWith(classes));
});

it('strikes overridden declarations in Source', async () => {
  const rule = (selector: string, score: number, sourceIndex: number, color: string) => ({
    selector,
    wrappers: [],
    mediaActive: true,
    specificity: [0, 0, 0],
    sourceIndex,
    score,
    source: 'inline',
    declarations: [{ property: 'color', value: color, important: false }],
  });
  page.mockImplementation((type) =>
    type === 'get_matched_rules'
      ? { success: true, matchedRules: [rule('#b', 10000, 1, 'blue'), rule('.a', 100, 0, 'red')] }
      : undefined,
  );
  show();
  $('[data-mode="source"]').click();
  await vi.waitFor(() => expect(document.querySelectorAll('[data-rule]')).toHaveLength(2));
  const struck = [...document.querySelectorAll('[data-rule] .line-through')].map(
    (d) => d.textContent,
  );
  expect(struck).toEqual([expect.stringContaining('red')]);
});

it('switches colour format and stores it', async () => {
  show();
  $('[data-format="RGB"]').click();
  flushSync();
  expect($('[data-color-copy]').textContent).toContain('rgb(');
  await vi.waitFor(async () => expect((await getPanelPrefs()).colorFormat).toBe('RGB'));
});

it('remembers a collapsed section', async () => {
  show();
  $('[data-section="colors"] button[aria-expanded]').click();
  flushSync();
  expect($('[data-color-copy]')).toBeNull();
  await vi.waitFor(async () =>
    expect((await getPanelPrefs()).sectionVisibility.colors.collapsed).toBe(true),
  );
});

it('walks issue instances round', async () => {
  show();
  $('[data-issue]').click();
  $('[data-next]').click();
  $('[data-next]').click();
  await vi.waitFor(() =>
    expect(log.filter((l) => l[1] === 'highlight_issue_element')).toHaveLength(3),
  );
  expect(log.filter((l) => l[1] === 'highlight_issue_element').map((l) => l[2])).toEqual([
    'v-11',
    'v-12',
    'v-11',
  ]);
  flushSync();
  expect($('[data-instances]').textContent).toContain('1/2');
});

it('hover highlights and leaving the panel clears them', async () => {
  show();
  $('[data-color-copy]').dispatchEvent(new MouseEvent('mouseenter'));
  $('[data-element-tab]').dispatchEvent(new MouseEvent('mouseleave'));
  await vi.waitFor(() => expect(types('page')).toContain('clear_element_highlights'));
  expect(log.find((l) => l[1] === 'highlight_elements_for_color')?.[2]).toBe('#1F2937');
});

it('does not download without the downloads permission', async () => {
  const request = vi.fn(async () => false);
  fakeBrowser.permissions.request = request as never;
  const download = vi.fn();
  (fakeBrowser as unknown as { downloads: unknown }).downloads = { download };
  show();
  $('[data-download]').click();
  await vi.waitFor(() => expect(request).toHaveBeenCalledWith({ permissions: ['downloads'] }));
  await Promise.resolve();
  expect(download).not.toHaveBeenCalled();
});

it('downloads inline SVG as a blob once granted', async () => {
  fakeBrowser.permissions.request = vi.fn(async () => true) as never;
  const download = vi.fn(async () => 1);
  (fakeBrowser as unknown as { downloads: unknown }).downloads = { download };
  show();
  $('[data-asset="svg"] [data-download]').click();
  await vi.waitFor(() => expect(download).toHaveBeenCalled());
  expect(download.mock.calls[0]).toEqual([
    { url: expect.stringMatching(/^blob:/), filename: 'panel_defaultSvgFilename' },
  ]);
});

it('Box Model stays open and the toolbar comes first, then the element with its parent', () => {
  panel.prefs.sectionVisibility.layout = { collapsed: true };
  show();
  expect($('[data-ring="margin"]')).not.toBeNull();
  const tab = $('[data-element-tab]');
  const first = tab.firstElementChild!;
  expect(first.hasAttribute('data-edit-toolbar')).toBe(true);
  expect(first.nextElementSibling!.querySelector('[data-parent]')).not.toBeNull();
});
