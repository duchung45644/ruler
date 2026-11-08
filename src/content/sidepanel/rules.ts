import { collectRules, matchedRules, sheetsOf, type KnownRule } from '../../lib/css/matched';
import type { MatchedRule } from '../../lib/element/types';
import { sendToBackground } from '../../lib/ext/messaging';

/** Fetched copies of cross-origin sheets by href; never attached to the page. */
const fetched = new Map<string, CSSStyleSheet>();

export const rootOf = (el: Element | null) => {
  const root = el?.getRootNode();
  return root instanceof ShadowRoot ? root : document;
};

/** Source of the edit tracker's own `<style>`, kept apart so page `<style>` addresses never shift. */
export const OWN_SOURCE = 'sr-rule-edits';

/** Rules styling `root`'s tree, fetched copies swapped in, and the sheets still unreadable. */
export function rulesOf(root: Document | ShadowRoot): { rules: KnownRule[]; blocked: Set<string> } {
  const own = new Set(
    [...root.querySelectorAll(`style[id^="${OWN_SOURCE}-"]`)].map(
      (n) => (n as HTMLStyleElement).sheet,
    ),
  );
  const sheets = sheetsOf(root).map((s) => {
    const copy = fetched.get(s.source);
    if (copy) return { sheet: copy, source: s.source };
    return own.has(s.sheet) ? { sheet: s.sheet, source: OWN_SOURCE } : s;
  });
  const blocked = new Set<string>();
  const rules = collectRules(sheets, (s) => blocked.add(s.source));
  return { rules, blocked };
}

const sheetsFor = (el: Element | null) => rulesOf(rootOf(el));

const unreadable = (sheet: CSSStyleSheet) => {
  try {
    void sheet.cssRules;
    return false;
  } catch {
    return true;
  }
};

/** Cross-origin sheets we can neither read nor have a copy of (6.05); top level only, cheap. */
export const skippedCrossOriginCount = (el: Element) =>
  sheetsOf(rootOf(el)).filter((s) => !fetched.has(s.source) && unreadable(s.sheet)).length;

/** get_matched_rules (split from 5.21), read-only. */
export function getMatchedRules(el: Element | null): {
  success: boolean;
  matchedRules: MatchedRule[];
  skippedCrossOriginCount?: number;
} {
  if (!el?.isConnected) return { success: false, matchedRules: [] };
  const { rules, blocked } = sheetsFor(el);
  return {
    success: true,
    matchedRules: matchedRules(el, rules),
    skippedCrossOriginCount: blocked.size,
  };
}

/**
 * Port of loadCrossOriginStylesheets (content.js:31926): fetch each unreadable sheet through the
 * background (it needs <all_urls>) and parse a detached copy with replaceSync.
 */
export async function enableCrossOriginStyles(el: Element | null): Promise<{ success: boolean }> {
  return { success: await fetchCrossOrigin([...sheetsFor(el).blocked]) };
}

/** Fetched copy of a cross-origin sheet, if we have one. */
export const fetchedCopy = (href: string | null): CSSStyleSheet | undefined =>
  href ? fetched.get(href) : undefined;

/** Fetches and caches readable copies; true when every sheet was fetched. */
export async function fetchCrossOrigin(hrefs: string[]): Promise<boolean> {
  hrefs = hrefs.filter((h) => /^https?:/.test(h) && !fetched.has(h));
  const results = await Promise.all(
    hrefs.map(async (href) => {
      const r = await sendToBackground('fetch_stylesheet', href).catch(() => undefined);
      if (!r?.ok) return false;
      try {
        const sheet = new CSSStyleSheet({ baseURL: r.finalUrl });
        sheet.replaceSync(r.text);
        fetched.set(href, sheet);
        return true;
      } catch {
        return false;
      }
    }),
  );
  return results.every(Boolean);
}
