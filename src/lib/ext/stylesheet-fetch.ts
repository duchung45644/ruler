/** Port of Ge (background.js): IPv4 ranges that must never be fetched. */
function isPrivateV4(h: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return (
    a === 0 ||
    a === 127 ||
    a === 10 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 192 && b === 168) ||
    (a === 172 && b >= 16 && b <= 31)
  );
}

function isPrivateV6(host: string): boolean {
  const h = host.replace(/^\[/, '').replace(/\]$/, '');
  if (h === '::' || h === '::1') return true;
  if (h.startsWith('::')) {
    if (!h.startsWith('::ffff:')) return true;
    const rest = h.slice(7);
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(rest)) return isPrivateV4(rest);
    const parts = rest.split(':');
    if (parts.length > 2 || parts.some((p) => !/^[0-9a-f]{1,4}$/.test(p))) return true;
    const n = parts.reduce((acc, p) => acc * 65536 + parseInt(p, 16), 0);
    return isPrivateV4(`${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`);
  }
  const first = h.split(':')[0]!;
  if (!/^[0-9a-f]{1,4}$/.test(first)) return true;
  const u = parseInt(first, 16);
  return (u >= 0xfc00 && u <= 0xfdff) || (u >= 0xfe80 && u <= 0xfebf); // fc00::/7, fe80::/10
}

/** Port of Ue (background.js:5454): public http(s) hosts only. */
export function isAllowedStylesheetUrl(u: string): boolean {
  let url: URL;
  try {
    url = new URL(u);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  const h = url.hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost')) return false;
  return h.startsWith('[') ? !isPrivateV6(h) : !isPrivateV4(h);
}

export type StylesheetResult =
  { ok: true; text: string; finalUrl: string } | { ok: false; error: string };

const MAX_REDIRECTS = 5;

/**
 * Port of qe (background.js:5543): redirects are followed by hand so every hop is checked;
 * no cookies, 10s for the whole chain.
 */
export async function fetchStylesheet(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<StylesheetResult> {
  const signal = AbortSignal.timeout(10000);
  try {
    let current = url;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!isAllowedStylesheetUrl(current)) return { ok: false, error: 'blocked host' };
      const res = await fetchFn(current, { credentials: 'omit', redirect: 'manual', signal });
      const redirected = res.type === 'opaqueredirect' || (res.status >= 300 && res.status <= 399);
      if (!redirected) {
        if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
        return { ok: true, text: await res.text(), finalUrl: current };
      }
      const loc = res.headers.get('location');
      if (loc) {
        current = new URL(loc, current).href;
        continue;
      }
      // extension fetches see an opaque redirect without Location: follow, then check where it landed
      const end = await fetchFn(current, { credentials: 'omit', redirect: 'follow', signal });
      if (!end.url || !isAllowedStylesheetUrl(end.url)) return { ok: false, error: 'blocked host' };
      if (!end.ok) return { ok: false, error: `HTTP ${end.status}` };
      return { ok: true, text: await end.text(), finalUrl: end.url };
    }
    return { ok: false, error: 'too many redirects' };
  } catch (e) {
    return { ok: false, error: String((e as Error)?.message ?? e) };
  }
}
