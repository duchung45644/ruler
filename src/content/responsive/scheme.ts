/**
 * Per-frame color scheme emulation. Chrome does not pass an iframe's CSS `color-scheme` on to the
 * embedded document's `prefers-color-scheme`, so the frame rewrites its own media conditions while
 * a scheme is forced, and puts every original back on 'system' / stop.
 *
 * Not covered:
 * - Cross-origin sheets whose `cssRules` throw. stylesheet-fetch can read their text, but swapping
 *   in a rewritten copy would reorder the cascade and drop relative URLs, so they keep the system
 *   scheme.
 * - Page JS reading `matchMedia('(prefers-color-scheme: …)')`: this isolated world cannot patch the
 *   page's matchMedia, and there is no main-world content script to do it from.
 * - Sheets inside shadow roots.
 */
import { forceSchemeMedia, hasSchemeFeature } from '../../lib/responsive/color-scheme';
import type { ForcedScheme } from '../../lib/responsive/color-scheme';

type Restore = () => void;

interface SchemeState {
  current: ForcedScheme;
  restores: Restore[];
  /** Media lists / elements already rewritten for `current`. */
  done: WeakSet<object>;
  observer: MutationObserver | null;
  onLoad: (() => void) | null;
  timer: ReturnType<typeof setTimeout> | undefined;
  /** The page's own inline root color-scheme. */
  rootScheme: string;
}

declare global {
  interface Window {
    __PIXELLENS_SCHEME__?: SchemeState;
  }
}

// on the (isolated-world) window, not in the module: frames can run more than one copy of the
// content script, and each must see the one emulation instead of saving the other's rewrites
const S: SchemeState = (window.__PIXELLENS_SCHEME__ ??= {
  current: null,
  restores: [],
  done: new WeakSet(),
  observer: null,
  onLoad: null,
  timer: undefined,
  rootScheme: '',
});

function rewriteList(list: MediaList, scheme: 'light' | 'dark'): void {
  if (S.done.has(list)) return;
  S.done.add(list);
  const text = list.mediaText;
  if (!hasSchemeFeature(text)) return;
  list.mediaText = forceSchemeMedia(text, scheme);
  S.restores.push(() => (list.mediaText = text));
}

function walkRules(rules: CSSRuleList, scheme: 'light' | 'dark', depth = 0): void {
  if (depth > 16) return;
  // duck-typed: @media and @import carry `media`, @import its `styleSheet`, grouping rules (@media,
  // @supports, @layer, @container, nesting) their own `cssRules`
  for (const rule of Array.from(rules) as Partial<CSSImportRule & CSSGroupingRule>[]) {
    if (rule.media) rewriteList(rule.media, scheme);
    if (rule.styleSheet) walkSheet(rule.styleSheet, scheme, depth + 1);
    if (rule.cssRules) walkRules(rule.cssRules, scheme, depth + 1);
  }
}

function walkSheet(sheet: CSSStyleSheet, scheme: 'light' | 'dark', depth = 0): void {
  let rules: CSSRuleList;
  try {
    rules = sheet.cssRules;
  } catch {
    return; // cross-origin, see the header
  }
  walkRules(rules, scheme, depth);
}

function rewriteAttr(el: Element, scheme: 'light' | 'dark'): void {
  if (S.done.has(el)) return;
  S.done.add(el);
  const text = el.getAttribute('media');
  if (text === null || !hasSchemeFeature(text)) return;
  el.setAttribute('media', forceSchemeMedia(text, scheme));
  S.restores.push(() => el.setAttribute('media', text));
}

function applyAll(): void {
  const scheme = S.current;
  if (!scheme) return;
  // <link media> / <style media> / <picture><source media>: the attribute drives the sheet's list
  for (const el of document.querySelectorAll('link[media], style[media], source[media]')) {
    rewriteAttr(el, scheme);
  }
  for (const sheet of Array.from(document.styleSheets)) walkSheet(sheet, scheme);
  for (const sheet of document.adoptedStyleSheets ?? []) walkSheet(sheet, scheme);
}

const STYLE_NODES = new Set(['STYLE', 'LINK', 'SOURCE', 'PICTURE']);
const touchesStyles = (r: MutationRecord): boolean =>
  STYLE_NODES.has(r.target.nodeName) ||
  Array.from(r.addedNodes).some(
    (n) =>
      STYLE_NODES.has(n.nodeName) ||
      (n instanceof Element && !!n.querySelector('style, link, source')),
  );

function schedule(): void {
  clearTimeout(S.timer);
  S.timer = setTimeout(applyAll, 50);
}

function restore(): void {
  clearTimeout(S.timer);
  S.timer = undefined;
  S.observer?.disconnect();
  S.observer = null;
  if (S.onLoad) document.removeEventListener('load', S.onLoad, true);
  S.onLoad = null;
  for (const r of S.restores.reverse()) r();
  S.restores = [];
  S.done = new WeakSet();
  if (S.current) document.documentElement.style.colorScheme = S.rootScheme;
  S.current = null;
}

/** Force `scheme` on this document, or put the page back as it was (null). */
export function setFrameScheme(scheme: ForcedScheme): void {
  if (scheme === S.current) return;
  restore();
  if (scheme !== 'light' && scheme !== 'dark') return;
  S.current = scheme;
  // UA widgets and scrollbars follow the root's color-scheme
  S.rootScheme = document.documentElement.style.colorScheme;
  document.documentElement.style.colorScheme = scheme;
  applyAll();
  // sheets added later: new <style>/<link> nodes, and links once loaded (cssRules ready)
  S.observer = new MutationObserver((records) => {
    if (records.some(touchesStyles)) schedule();
  });
  S.observer.observe(document, { childList: true, subtree: true });
  S.onLoad = schedule;
  document.addEventListener('load', schedule, true);
}
