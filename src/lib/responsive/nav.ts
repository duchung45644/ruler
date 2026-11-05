export type NavDecision = 'external-tab' | 'in-frame' | 'default';

/** Two-label public suffixes and shared hosts treated as one level (legacy `sg`). */
const MULTI_SUFFIXES = new Set([
  'co.uk',
  'org.uk',
  'ac.uk',
  'gov.uk',
  'me.uk',
  'net.uk',
  'com.au',
  'net.au',
  'org.au',
  'edu.au',
  'gov.au',
  'co.jp',
  'ne.jp',
  'or.jp',
  'ac.jp',
  'go.jp',
  'com.br',
  'net.br',
  'org.br',
  'co.nz',
  'org.nz',
  'co.in',
  'net.in',
  'org.in',
  'com.mx',
  'co.za',
  'org.za',
  'com.sg',
  'com.hk',
  'com.tw',
  'com.cn',
  'com.ar',
  'com.tr',
  'co.kr',
  'or.kr',
  'co.id',
  'com.my',
  'com.ph',
  'com.vn',
  'github.io',
  'gitlab.io',
  'netlify.app',
  'vercel.app',
  'pages.dev',
  'web.app',
  'firebaseapp.com',
  'herokuapp.com',
  'azurewebsites.net',
  'amplifyapp.com',
  'onrender.com',
  'surge.sh',
  'fly.dev',
  'workers.dev',
]);

/** Approximate registrable domain (legacy `lg`). IPs and IPv6 are returned as-is. */
export function siteOf(hostname: string): string {
  const h = hostname.toLowerCase().replace(/\.$/, '');
  if (/^[\d.]+$/.test(h) || h.includes(':')) return h;
  const parts = h.split('.');
  if (parts.length <= 2) return h;
  const last2 = parts.slice(-2).join('.');
  return MULTI_SUFFIXES.has(last2) ? parts.slice(-3).join('.') : last2;
}

/** Legacy `cg`: both http(s), same site; single-label hosts and IPs must also match port. */
export function isSameSite(a: string, b: string): boolean {
  let ua: URL;
  let ub: URL;
  try {
    ua = new URL(a);
    ub = new URL(b);
  } catch {
    return false;
  }
  if (!/^https?:$/.test(ua.protocol) || !/^https?:$/.test(ub.protocol)) return false;
  const site = siteOf(ua.hostname);
  if (site !== siteOf(ub.hostname)) return false;
  const plainDomain = site.includes('.') && !/^[\d.]+$/.test(site);
  return plainDomain || ua.port === ub.port;
}

export interface NavRequest {
  kind: 'link' | 'form';
  /** Absolute target URL (resolved href / form action). */
  url: string;
  /** `target` / `formtarget` attribute, any case. */
  target?: string | null;
  /** URL of the frame document. */
  current: string;
}

/**
 * Port of onNavigationClick / onNavigationSubmit (after the event filters: unprevented, primary
 * button, no modifiers, no `download`). Cross-site → new tab; same-site link aimed at _top/_parent
 * → navigate inside the frame; everything else is left to the browser. `_blank` and non-http(s)
 * links are always left alone.
 */
export function decideNavigation(req: NavRequest): NavDecision {
  const target = (req.target ?? '').toLowerCase();
  if (target === '_blank') return 'default';
  if (req.kind === 'link' && !/^https?:/i.test(req.url)) return 'default';
  if (!isSameSite(req.url, req.current)) return 'external-tab';
  if (req.kind === 'link' && (target === '_top' || target === '_parent')) return 'in-frame';
  return 'default';
}

/** GET form opened in a new tab: legacy replaces the query with the serialised form fields. */
export function formGetUrl(action: string, fields: Iterable<[string, string]>): string {
  const u = new URL(action);
  u.search = new URLSearchParams([...fields]).toString();
  return u.href;
}
