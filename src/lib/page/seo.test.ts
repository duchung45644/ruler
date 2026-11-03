import { beforeEach, expect, it } from 'vitest';
import { collectSeoIssues, SEO_CHECKS } from './seo';

const ids = new Map<Element, string>();
const idOf = (el: Element) => {
  if (!ids.has(el)) ids.set(el, `v-${ids.size + 1}`);
  return ids.get(el)!;
};
const run = () => collectSeoIssues(document, idOf, (el) => el.tagName.toLowerCase());
const keys = () => run().map((i) => i.groupingKey);

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  document.title = '';
  document.documentElement.removeAttribute('lang');
  ids.clear();
});

it('has the 16 legacy checks', () => {
  expect(new Set(SEO_CHECKS).size).toBe(16);
});

it('flags everything missing on an empty page, in legacy order', () => {
  expect(keys()).toEqual([
    'missing-title',
    'missing-description',
    'missing-h1',
    'missing-canonical',
    'missing-viewport',
    'missing-lang',
    'missing-og-title',
    'missing-og-description',
    'missing-og-image',
  ]);
  expect(run()[0]).toMatchObject({ id: 'missing-title', severity: 'error', target: '<title>' });
});

it('checks title and description length bounds', () => {
  document.title = 'x'.repeat(20);
  expect(keys()).toContain('title-too-short');
  document.title = 'x'.repeat(30);
  expect(keys()).not.toContain('title-too-short');
  document.title = 'x'.repeat(70);
  expect(keys()).toContain('title-too-long');
  document.head.innerHTML = `<meta name="description" content="${'d'.repeat(50)}">`;
  expect(keys()).toContain('description-too-short');
  document.head.innerHTML = `<meta name="description" content="${'d'.repeat(161)}">`;
  expect(keys()).toContain('description-too-long');
});

it('lists every h1 and img without alt by element id', () => {
  document.body.innerHTML = '<h1>a</h1><h1>b</h1><img src="x.png"><img alt="" src="y.png">';
  const multi = run().filter((i) => i.groupingKey === 'multiple-h1');
  expect(multi.map((i) => i.id)).toEqual(['v-1', 'v-2']);
  expect(multi[0]).toMatchObject({ selector: 'h1', severity: 'warning' });
  expect(run().filter((i) => i.groupingKey === 'missing-alt')).toHaveLength(1);
});

it('finds h1 inside open shadow roots', () => {
  document.body.innerHTML = '<h1>a</h1><div id="host"></div>';
  document.getElementById('host')!.attachShadow({ mode: 'open' }).innerHTML = '<h1>b</h1>';
  expect(keys().filter((k) => k === 'multiple-h1')).toHaveLength(2);
});

it('flags noindex robots', () => {
  document.head.innerHTML = '<meta name="robots" content="noindex,follow">';
  expect(keys()).toContain('robots-noindex');
});
