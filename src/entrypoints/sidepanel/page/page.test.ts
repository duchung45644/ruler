import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import type { PageData, PageWeight } from '../../../lib/page/types';
import { DEFAULT_PANEL_PREFS, getPanelPrefs } from '../../../lib/settings';
import App from '../App.svelte';
import { panel } from '../store.svelte';

let app: ReturnType<typeof mount> | null = null;
let send: ReturnType<typeof vi.spyOn>;

const pageData = (og: string | null = 'https://x.test/og.png'): PageData => ({
  title: 'Home',
  url: 'https://x.test/a/b?q=1',
  ogImage: og,
  meta: {
    seo: { title: 'Home', description: 'Desc', canonical: null, robots: null, viewport: null },
    openGraph: {
      'og:title': 'OG title',
      'og:description': null,
      'og:image': og,
      'og:url': null,
      'og:type': null,
      'og:site_name': null,
    },
    twitter: {
      'twitter:card': null,
      'twitter:title': 'TW title',
      'twitter:description': null,
      'twitter:image': null,
      'twitter:site': null,
    },
  },
  pageWeight: null,
  seoIssues: [
    {
      id: 'missing-canonical',
      groupingKey: 'missing-canonical',
      severity: 'warning',
      target: 'head',
      message: 'm',
      recommendation: 'r',
    },
  ],
});
const weight = (script: number): PageWeight => ({
  total: 1000 + script,
  document: 1000,
  byType: { script, css: 0, img: 0, font: 0, fetch: 0, media: 0, other: 0 },
  unknownCount: 2,
  bufferFull: false,
});

beforeEach(() => {
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
  vi.spyOn(fakeBrowser.commands, 'getAll').mockResolvedValue([] as never);
  fakeBrowser.tabs.connect = vi.fn(() => ({
    disconnect: vi.fn(),
    onDisconnect: { addListener: vi.fn() },
  })) as never;
  send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never);
  Object.assign(panel, { prefs: structuredClone(DEFAULT_PANEL_PREFS) });
});
afterEach(() => {
  if (app) unmount(app);
  app = null;
  document.body.replaceChildren();
  Object.assign(panel, { selectedTab: 'element', page: null, technologies: null, weight: null });
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function open() {
  history.replaceState(null, '', '/sidepanel.html?tabId=5');
  app = mount(App, { target: document.body });
  await vi.waitFor(() => expect(panel.tabId).toBe(5));
  panel.selectedTab = 'page';
  flushSync();
}
const toPanel = async (type: string, ...data: unknown[]) => {
  await fakeBrowser.runtime.onMessage.trigger(
    { target: 'sidepanel', type, data },
    {
      tab: { id: 5 },
    } as never,
    () => {},
  );
  flushSync();
};
const sent = (type: string) =>
  send.mock.calls.filter((c: unknown[]) => (c[1] as { type: string }).type === type);
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);

it('shows the social preview only with og:image and switches to X', async () => {
  await open();
  await toPanel('page_data', pageData(null));
  expect($('[data-preview]')).toBeNull();
  await toPanel('page_data', pageData());
  expect($('[data-preview]')!.dataset.preview).toBe('facebook');
  expect($('[data-preview-title]')!.textContent).toBe('OG title');
  $('[data-kind="x"]')!.click();
  flushSync();
  expect(panel.prefs.socialPreviewType).toBe('x');
  expect($('[data-preview-title]')!.textContent).toBe('TW title');
  await vi.waitFor(async () => expect((await getPanelPrefs()).socialPreviewType).toBe('x'));
});

it('keeps the refresh icon spinning for at least 600ms', async () => {
  await open();
  await toPanel('page_data', pageData());
  vi.useFakeTimers();
  $('[data-refresh]')!.click();
  flushSync();
  expect(sent('refresh_page_data')).toHaveLength(1);
  vi.advanceTimersByTime(100);
  await toPanel('page_data', pageData());
  vi.advanceTimersByTime(400);
  flushSync();
  expect($('[data-refresh]')!.dataset.spinning).toBeDefined();
  vi.advanceTimersByTime(100);
  flushSync();
  expect($('[data-refresh]')!.dataset.spinning).toBeUndefined();
});

it('drops page data when the tab starts loading and asks again', async () => {
  await open();
  await toPanel('page_data', pageData());
  expect($('[data-no-info]')).toBeNull();
  const before = sent('refresh_page_data').length;
  await fakeBrowser.tabs.onUpdated.trigger(5, { status: 'loading' }, {} as never);
  flushSync();
  expect($('[data-no-info]')!.textContent).toBe('page_noInfo');
  expect(sent('refresh_page_data')).toHaveLength(before + 1);
});

it('shows logos or initials and puts technologies before SEO', async () => {
  await open();
  await toPanel('page_data', pageData());
  await toPanel('page_technologies', [
    { id: 'react', name: 'React', version: '18', url: null, icon: 'react' },
    { id: 'foo', name: 'foo', version: null, url: 'https://foo.test', icon: 'nope' },
  ]);
  expect($<HTMLImageElement>('[data-tech="react"] img')!.src).toContain('/logos/react.svg');
  expect($<HTMLAnchorElement>('[data-tech="react"]')!.href).toBe(
    'https://www.google.com/search?q=React',
  );
  $('[data-tech="foo"] img')!.dispatchEvent(new Event('error'));
  flushSync();
  expect($('[data-tech="foo"] [data-initial]')!.textContent).toBe('F');
  const tech = $('[data-section="technologies"]')!;
  const seo = $('[data-section="seoIssues"]')!;
  expect(tech.compareDocumentPosition(seo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it('ignores page weight updates while the Element tab is shown', async () => {
  await open();
  await toPanel('page_data', pageData());
  await toPanel('page_weight_update', weight(500));
  expect($('[data-pw="script"]')!.textContent).toContain('500 B');
  expect($('[data-pw-hidden]')!.textContent).toContain('page_pwHidden');
  panel.selectedTab = 'element';
  flushSync();
  await toPanel('page_weight_update', weight(900));
  panel.selectedTab = 'page';
  flushSync();
  expect($('[data-pw="script"]')!.textContent).toContain('500 B');
  await toPanel('page_weight_update', weight(900));
  expect($('[data-pw="script"]')!.textContent).toContain('900 B');
});
