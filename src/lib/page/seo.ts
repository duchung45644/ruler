import { shadowRoots } from '../dom';
import type { SeoFinding } from './types';

/** The 16 checks of collectSEOIssues (content.js:39254), in the order they run. */
export const SEO_CHECKS = [
  'missing-title',
  'title-too-short',
  'title-too-long',
  'missing-description',
  'description-too-short',
  'description-too-long',
  'missing-h1',
  'multiple-h1',
  'missing-canonical',
  'missing-viewport',
  'missing-lang',
  'robots-noindex',
  'missing-alt',
  'missing-og-title',
  'missing-og-description',
  'missing-og-image',
] as const;
export type SeoCheck = (typeof SEO_CHECKS)[number];

/**
 * Port of collectSEOIssues. `idOf` tags the elements of per-element findings (legacy kept a
 * random id → element map; the data-sr-id does that job here). `selectorOf` names them.
 */
export function collectSeoIssues(
  doc: Document,
  idOf: (el: Element) => string,
  selectorOf: (el: Element) => string,
  isOwn: (el: Element) => boolean = () => false,
): SeoFinding[] {
  // legacy `se`: the document, then every open shadow root
  const all = (sel: string) => [
    ...doc.querySelectorAll(sel),
    ...shadowRoots(doc, isOwn).flatMap((r) => [...r.querySelectorAll(sel)]),
  ];
  const out: SeoFinding[] = [];
  const add = (id: SeoCheck, severity: SeoFinding['severity'], target: string) =>
    out.push({ id, groupingKey: id, severity, target });
  const each = (els: Iterable<Element>, check: SeoCheck, target: string) => {
    for (const el of els)
      out.push({
        id: idOf(el),
        groupingKey: check,
        severity: 'warning',
        target,
        selector: selectorOf(el),
      });
  };

  const title = (doc.title || '').trim();
  if (!title) add('missing-title', 'error', '<title>');
  else if (title.length < 30) add('title-too-short', 'info', '<title>');
  else if (title.length > 60) add('title-too-long', 'warning', '<title>');

  const descTarget = '<meta name="description">';
  const desc = (
    doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  ).trim();
  if (!desc) add('missing-description', 'warning', descTarget);
  else if (desc.length < 70) add('description-too-short', 'info', descTarget);
  else if (desc.length > 160) add('description-too-long', 'warning', descTarget);

  const h1s = all('h1');
  if (h1s.length === 0) add('missing-h1', 'error', '<h1>');
  else if (h1s.length > 1) each(h1s, 'multiple-h1', '<h1>');

  if (!doc.querySelector('link[rel="canonical"]')) add('missing-canonical', 'info', '<head>');
  if (!doc.querySelector('meta[name="viewport"]'))
    add('missing-viewport', 'error', '<meta name="viewport">');
  if (!(doc.documentElement.getAttribute('lang') || '').trim())
    add('missing-lang', 'warning', '<html>');
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  if (/noindex/i.test(robots)) add('robots-noindex', 'info', '<meta name="robots">');

  each(all('img:not([alt])'), 'missing-alt', '<img>');

  for (const [key, check, severity] of [
    ['og:title', 'missing-og-title', 'warning'],
    ['og:description', 'missing-og-description', 'info'],
    ['og:image', 'missing-og-image', 'info'],
  ] as const)
    if (!doc.querySelector(`meta[property="${key}"]`))
      add(check, severity, `<meta property="${key}">`);
  return out;
}
