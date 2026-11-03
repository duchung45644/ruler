import { collectRules, matchedRules, sheetsOf, type KnownRule } from '../../lib/css/matched';
import type { MatchedRule } from '../../lib/element/types';
import { sendToBackground } from '../../lib/messaging';

/** Fetched copies of cross-origin sheets by href; never attached to the page. */
const fetched = new Map<string, CSSStyleSheet>();

const rootOf = (el: Element | null) => {
  const root = el?.getRootNode();
  return root instanceof ShadowRoot ? root : document;
};

/** Rules styling `el`'s tree, fetched copies swapped in, and the sheets still unreadable. */
function sheetsFor(el: Element | null): { rules: KnownRule[]; blocked: Set<string> } {
  const sheets = sheetsOf(rootOf(el)).map((s) => {
    const copy = fetched.get(s.source);
    return copy ? { sheet: copy, source: s.source } : s;
  });
  const blocked = new Set<string>();
  const rules = collectRules(sheets, (s) => blocked.add(s.source));
  return { rules, blocked };
}

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
  const hrefs = [...sheetsFor(el).blocked].filter((h) => /^https?:/.test(h));
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
  return { success: results.every(Boolean) };
}
