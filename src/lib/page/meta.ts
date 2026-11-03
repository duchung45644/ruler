import type { PageMeta } from './types';

/** Port of collectPageMetadata (content.js:39207), without the weight and SEO parts. */
export function collectPageMetadata(doc: Document, href: string): PageMeta {
  const meta = (attr: string, key: string) =>
    doc.querySelector(`meta[${attr}="${key}"]`)?.getAttribute('content') ?? null;
  const og = (k: string) => meta('property', k);
  const tw = (k: string) => meta('name', k);
  const image = og('og:image');
  return {
    title: doc.title,
    url: href,
    ogImage: image ? new URL(image, href).href : null,
    meta: {
      seo: {
        title: doc.title,
        description: meta('name', 'description'),
        canonical: doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || null,
        robots: meta('name', 'robots'),
        viewport: meta('name', 'viewport'),
      },
      openGraph: {
        'og:title': og('og:title'),
        'og:description': og('og:description'),
        'og:image': image,
        'og:url': og('og:url'),
        'og:type': og('og:type'),
        'og:site_name': og('og:site_name'),
      },
      twitter: {
        'twitter:card': tw('twitter:card'),
        'twitter:title': tw('twitter:title'),
        'twitter:description': tw('twitter:description'),
        'twitter:image': tw('twitter:image'),
        'twitter:site': tw('twitter:site'),
      },
    },
  };
}
