/** Page tab data (legacy collectPageMetadata content.js:39207, getPageData :39538). */

import type { SeoCheck } from './seo';

/**
 * One SEO finding (collectSEOIssues :39254). `multiple-h1` / `missing-alt` come once per element,
 * with `id` = the element's data-sr-id so highlight_issue_element can frame it.
 */
export interface SeoFinding {
  id: string;
  groupingKey: SeoCheck;
  severity: 'error' | 'warning' | 'info';
  target: string;
  selector?: string;
}

/** A finding as the panel gets it: localised in the page, as legacy (seo.<check> keys). */
export interface SeoIssue extends SeoFinding {
  message: string;
  recommendation: string;
}

export const PW_TYPES = ['script', 'css', 'img', 'font', 'fetch', 'media', 'other'] as const;
export type PwType = (typeof PW_TYPES)[number];

/** collectPageWeight's result (:39435); bytes, transfer size or else encoded body size. */
export interface PageWeight {
  total: number;
  /** The navigation document; 0 after an in-page navigation. */
  document: number;
  byType: Record<PwType, number>;
  /** Resources with no size to show (cross-origin without Timing-Allow-Origin). */
  unknownCount: number;
  bufferFull: boolean;
}

export interface PageMeta {
  title: string;
  url: string;
  ogImage: string | null;
  meta: {
    seo: Record<'title' | 'description' | 'canonical' | 'robots' | 'viewport', string | null>;
    openGraph: Record<
      'og:title' | 'og:description' | 'og:image' | 'og:url' | 'og:type' | 'og:site_name',
      string | null
    >;
    twitter: Record<
      'twitter:card' | 'twitter:title' | 'twitter:description' | 'twitter:image' | 'twitter:site',
      string | null
    >;
  };
}

export interface PageData extends PageMeta {
  /** null when the page has no resource timing at all, as legacy. */
  pageWeight: PageWeight | null;
  seoIssues: SeoIssue[];
}

/** One detector hit (legacy detect-technologies.js:3207). */
export interface Technology {
  id: string;
  name: string;
  version: string | null;
  url: string | null;
  /** Logo name in public/logos; null or a missing file shows the initial. */
  icon: string | null;
}
