import { expect, it } from 'vitest';
import { collectPageMetadata } from './meta';

it('resolves og:image against the page and groups twitter tags', () => {
  document.head.innerHTML = `
    <meta property="og:image" content="/img/card.png">
    <meta name="twitter:title" content="Tw">
    <meta name="description" content="Desc">`;
  document.title = 'Home';
  const m = collectPageMetadata(document, 'https://example.com/a/b');
  expect(m.ogImage).toBe('https://example.com/img/card.png');
  expect(m.meta.openGraph['og:image']).toBe('/img/card.png');
  expect(m.meta.twitter['twitter:title']).toBe('Tw');
  expect(m.meta.seo).toMatchObject({ title: 'Home', description: 'Desc', canonical: null });
});

it('has no og image when the tag is missing', () => {
  document.head.innerHTML = '';
  expect(collectPageMetadata(document, 'https://example.com/').ogImage).toBeNull();
});
