import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { sendToBackground, sendToSidePanel } from '../../lib/ext/messaging';
import { stopSession } from '../core/session';
import {
  detectTechnologies,
  getPageData,
  initPageData,
  refreshPageData,
  subscribeWeight,
  unsubscribeWeight,
} from './page';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;

const toPanel = vi.mocked(sendToSidePanel);
const toBg = vi.mocked(sendToBackground);
const sent = (type: string) => toPanel.mock.calls.filter((c) => c[0] === type);

let feed: (entries: object[]) => void;
const disconnect = vi.fn();
class FakeObserver {
  constructor(cb: (l: { getEntries(): object[] }) => void) {
    feed = (entries) => cb({ getEntries: () => entries });
  }
  observe() {}
  disconnect = disconnect;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('PerformanceObserver', FakeObserver);
  toPanel.mockClear();
  toBg.mockReset();
  toBg.mockResolvedValue(undefined);
  disconnect.mockClear();
  document.head.innerHTML = '';
  document.body.innerHTML = '<h1>a</h1><h1>b</h1>';
  document.title = 'Page';
  initPageData((el) => `v-${el.textContent}`);
});
afterEach(() => {
  stopSession();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const res = (i: number) => ({
  name: `r${i}.js`,
  startTime: i + 1,
  initiatorType: 'script',
  transferSize: 10,
  encodedBodySize: 0,
});

it('sends page data once, localised, and caches it until refresh', () => {
  const d = getPageData();
  expect(d.title).toBe('Page');
  const h1 = d.seoIssues.filter((i) => i.groupingKey === 'multiple-h1');
  expect(h1.map((i) => i.id)).toEqual(['v-a', 'v-b']);
  expect(h1[0]!.message).toBe('seo_multipleH1_message');
  document.title = 'Changed';
  expect(getPageData().title).toBe('Page');
  refreshPageData();
  expect(sent('page_data').at(-1)![1]).toMatchObject({ title: 'Changed' });
});

it('throttles page_weight_update to one per 250ms', () => {
  subscribeWeight();
  expect(sent('page_weight_update')).toHaveLength(1); // the initial send
  vi.advanceTimersByTime(250);
  for (let i = 0; i < 10; i++) {
    feed([res(i)]);
    vi.advanceTimersByTime(10);
  }
  expect(sent('page_weight_update')).toHaveLength(2);
  vi.advanceTimersByTime(250);
  expect(sent('page_weight_update')).toHaveLength(3);
  vi.advanceTimersByTime(1000);
  expect(sent('page_weight_update')).toHaveLength(3);
});

it('disconnects on unsubscribe and on stop', () => {
  subscribeWeight();
  unsubscribeWeight();
  expect(disconnect).toHaveBeenCalledTimes(1);
  subscribeWeight();
  stopSession();
  expect(disconnect).toHaveBeenCalledTimes(2);
});

it('resends page data on hashchange', () => {
  getPageData();
  document.title = 'After hash';
  window.dispatchEvent(new Event('hashchange'));
  expect(sent('page_data').at(-1)![1]).toMatchObject({ title: 'After hash' });
});

describe('detectTechnologies', () => {
  const react = { id: 'react', name: 'React', version: null, url: '', icon: 'react' };

  it('takes the run_tech_detection answer, not a page postMessage', async () => {
    toBg.mockImplementation((async (type: string) =>
      type === 'run_tech_detection'
        ? { success: true, technologies: [react] }
        : undefined) as never);
    window.postMessage({ type: 'TECH_DETECTION_RESULT', technologies: [{ id: 'x' }] }, '*');
    await expect(detectTechnologies()).resolves.toEqual([react]);
  });

  it('gives up after 2s without an answer', async () => {
    toBg.mockImplementation(() => new Promise(() => {}));
    window.postMessage({ type: 'TECH_DETECTION_RESULT', technologies: [{ id: 'x' }] }, '*');
    const r = detectTechnologies();
    await vi.advanceTimersByTimeAsync(2000);
    await expect(r).resolves.toEqual([]);
  });

  it('sends page_technologies after page_data, and again from the cache', async () => {
    toBg.mockResolvedValue({ success: true, technologies: [react] } as never);
    getPageData();
    await vi.waitFor(() => expect(sent('page_technologies')).toHaveLength(1));
    getPageData();
    expect(sent('page_technologies')).toHaveLength(2);
    expect(sent('page_technologies')[1]![1]).toEqual([react]);
  });
});
