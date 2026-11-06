import { i18n } from '#i18n';
import { collectPageMetadata } from '../../lib/page/meta';
import { collectSeoIssues } from '../../lib/page/seo';
import type { PageData, PageWeight, SeoFinding, SeoIssue, Technology } from '../../lib/page/types';
import { WeightTotals } from '../../lib/page/weight';
import { sendToBackground, sendToSidePanel } from '../../lib/messaging';
import { displaySelector } from '../../lib/selector';
import { onStop, sessionSignal } from '../core/session';

const DETECT_TIMEOUT = 2000; // legacy waited 2s for TECH_DETECTION_RESULT
const THROTTLE = 250; // page_weight_update at most 4×/s (7.09)
const isOwn = (el: Element) => el.tagName.toLowerCase() === 'iodob-ui';

let idOf: (el: Element) => string = () => '';
let cached: PageData | null = null;
let technologies: Technology[] | null = null;
let totals = new WeightTotals();
let observer: PerformanceObserver | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let lastSent = 0;

const send = <T>(p: Promise<T>) => void p.catch(() => {});

function pageWeight(): PageWeight | null {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) return null;
  try {
    for (const e of performance.getEntriesByType('resource'))
      totals.add(e as PerformanceResourceTiming);
  } catch {
    /* as legacy: a partial total beats none */
  }
  const nav = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  return totals.result(nav);
}

const camel = (id: string) => id.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
const localise = (f: SeoFinding): SeoIssue => ({
  ...f,
  message: i18n.t(`seo.${camel(f.groupingKey)}.message` as 'seo.missingTitle.message'),
  recommendation: i18n.t(
    `seo.${camel(f.groupingKey)}.recommendation` as 'seo.missingTitle.recommendation',
  ),
});

/**
 * Port of detectTechnologies (content.js:48056). Only the background's executeScript result counts,
 * never a page postMessage (Review Focus 7); no answer in 2s means none.
 */
export function detectTechnologies(): Promise<Technology[]> {
  const run = sendToBackground('run_tech_detection').then(
    (r) => (r?.success ? r.technologies : []),
    () => [],
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<Technology[]>(
    (res) => (timer = setTimeout(() => res([]), DETECT_TIMEOUT)),
  );
  return Promise.race([run, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Port of getPageData (content.js:39538): cached until a navigation or refresh_page_data;
 * technologies follow as page_technologies once detected.
 */
export function getPageData(): PageData {
  if (cached) {
    send(sendToSidePanel('page_data', cached));
    if (technologies) send(sendToSidePanel('page_technologies', technologies));
    return cached;
  }
  const data: PageData = (cached = {
    ...collectPageMetadata(document, location.href),
    pageWeight: pageWeight(),
    seoIssues: collectSeoIssues(document, idOf, displaySelector, isOwn).map(localise),
  });
  technologies = null;
  send(sendToSidePanel('page_data', data));
  void detectTechnologies().then((t) => {
    if (cached !== data) return; // a navigation started a newer round
    technologies = t;
    send(sendToSidePanel('page_technologies', t));
  });
  return data;
}

export function refreshPageData(): void {
  cached = null;
  getPageData();
}

function sendWeight(): void {
  lastSent = Date.now();
  send(sendToSidePanel('page_weight_update', pageWeight()));
}

/** Legacy _schedulePageWeightSend: now if the last send is ≥250ms old, else once at the edge. */
function scheduleWeight(): void {
  const since = Date.now() - lastSent;
  if (since >= THROTTLE) sendWeight();
  else
    timer ??= setTimeout(() => {
      timer = undefined;
      sendWeight();
    }, THROTTLE - since);
}

/** page_weight_subscribe (7.09, legacy _startPageWeightObserver). */
export function subscribeWeight(): void {
  if (observer || typeof PerformanceObserver === 'undefined') return;
  try {
    observer = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) totals.add(e as PerformanceResourceTiming);
      scheduleWeight();
    });
    observer.observe({ type: 'resource', buffered: true });
  } catch {
    observer = null;
  }
  sendWeight();
}

export function unsubscribeWeight(): void {
  observer?.disconnect();
  observer = null;
  clearTimeout(timer);
  timer = undefined;
}

/** In-page navigation: count only what loads from now on, and resend (7.07). */
function onNavigate(): void {
  totals = new WeightTotals(performance.now());
  refreshPageData();
  if (observer) sendWeight();
}

function onBufferFull(): void {
  totals.bufferFull = true;
  if (observer) scheduleWeight();
}

/** Per session, from the bridge; `elementId` tags per-element SEO findings. */
export function initPageData(elementId: (el: Element) => string): void {
  idOf = elementId;
  const signal = sessionSignal();
  window.addEventListener('popstate', onNavigate, { signal });
  window.addEventListener('hashchange', onNavigate, { signal });
  performance.addEventListener?.('resourcetimingbufferfull', onBufferFull, { signal });
  onStop(() => {
    unsubscribeWeight();
    cached = null;
    technologies = null;
    totals = new WeightTotals();
    lastSent = 0;
  });
}
