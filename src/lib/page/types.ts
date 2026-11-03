/** Page tab data (legacy collectPageMetadata content.js:39207, getPageData :39538). */

export interface SeoIssue {
  id: string;
  groupingKey: string;
  severity: 'error' | 'warning' | 'info';
  target?: string;
  message: string;
  recommendation: string;
}

/** Port of collectPageWeight's result (content.js:39457). */
export interface PageWeight {
  total: number;
  document: number;
  byType: Record<string, number>;
  unknownCount: number;
  bufferFull: boolean;
}

export interface PageData {
  title: string;
  url: string;
  ogImage: string | null;
  meta: {
    seo: Record<string, string | null>;
    openGraph: Record<string, string | null>;
    twitter: Record<string, string | null>;
  };
  pageWeight: PageWeight | null;
  seoIssues: SeoIssue[];
}

/** One detector hit (legacy detect-technologies.js:3207). */
export interface Technology {
  id: string;
  name: string;
  version: string | null;
  url: string;
  icon: string;
}
