export const SKIP_TAGS = ['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE'];

const skip = (n: Element, isOwn: (n: Element) => boolean) =>
  SKIP_TAGS.includes(n.tagName) || isOwn(n);

/** Port of isElementStillRendered (legacy-src/content.js:44391): connected with a non-empty box. */
export function isRendered(el: Element): boolean {
  if (!el.isConnected) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 || r.height > 0;
}

/** Stops below body: null when the parent is body/html (legacy selectParent :46993). */
export function parentOf(el: Element): Element | null {
  const p = el.parentElement;
  return !p || p === document.body || p === document.documentElement ? null : p;
}

/** Port of bdFirstRealChild, also skipping non-visual tags. */
export function firstChildOf(el: Element, isOwn: (n: Element) => boolean): Element | null {
  return [...el.children].find((n) => !skip(n, isOwn)) ?? null;
}

/** Port of selectSibling (legacy-src/content.js:47136). */
export function siblingOf(
  el: Element,
  dir: -1 | 1,
  isOwn: (n: Element) => boolean,
): Element | null {
  let n: Element | null = el;
  do n = dir < 0 ? n.previousElementSibling : n.nextElementSibling;
  while (n && skip(n, isOwn));
  return n;
}

/** Every open shadow root under root, nested, in tree order, skipping our own hosts (port of legacy oe(), content.js:1548). */
export function shadowRoots(
  root: Document | ShadowRoot,
  isOwn: (el: Element) => boolean,
  depth = 0,
): ShadowRoot[] {
  if (depth > 32) return [];
  return [...root.querySelectorAll('*')].flatMap((el) =>
    el.shadowRoot && !isOwn(el)
      ? [el.shadowRoot, ...shadowRoots(el.shadowRoot, isOwn, depth + 1)]
      : [],
  );
}
