/**
 * Plain-JSON views of the page for an AI agent (10.09): port of buildPageInfo (content.js:48452),
 * extractAiAttributes (:48492), buildOutlineTree (:48567), buildElementSummary (:48654),
 * queryBySelector (:48757). `idOf` tags elements with the same data-sr-id-* ids the panel uses.
 */
import { queryAllDeep, isOwnHost } from '../../lib/dom/dom';
import { displaySelector } from '../../lib/dom/selector';
import { LIMITS } from '../../lib/mcp/protocol';

export type IdOf = (el: Element) => string;

const SKIP_OUTLINE = new Set(['script', 'style', 'link', 'meta', 'noscript', 'br']);
const SKIP_QUERY = new Set(['script', 'style', 'link', 'meta', 'noscript']);
const ATTRS = [
  'role',
  'href',
  'src',
  'srcset',
  'alt',
  'title',
  'name',
  'type',
  'placeholder',
  'value',
  'for',
  'target',
  'rel',
  'disabled',
  'checked',
  'selected',
];
const SUMMARY_CSS = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'padding',
  'margin',
  'border',
  'border-radius',
  'box-sizing',
  'background',
  'background-color',
  'background-image',
  'color',
  'opacity',
  'visibility',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-decoration',
  'text-transform',
  'flex',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'align-content',
  'gap',
  'grid-template-columns',
  'grid-template-rows',
  'box-shadow',
  'filter',
  'transform',
  'transition',
  'overflow',
];

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);
const classesOf = (el: Element): string | null =>
  typeof el.className === 'string' && el.className.trim() ? el.className.trim() : null;
const rectOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
};

/** The element's own text nodes, whitespace collapsed. */
export function ownText(el: Element): string {
  let t = '';
  for (const n of el.childNodes) if (n.nodeType === Node.TEXT_NODE) t += n.nodeValue ?? '';
  return t.replace(/\s+/g, ' ').trim();
}

export function buildPageInfo(doc: Document = document) {
  const de = doc.documentElement;
  const meta = (key: string, attr = 'name') =>
    doc.querySelector(`meta[${attr}="${key}"]`)?.getAttribute('content') || null;
  const h1 = doc.querySelector('h1');
  return {
    url: location.href,
    title: doc.title || null,
    lang: de.lang || null,
    description: meta('description'),
    ogTitle: meta('og:title', 'property'),
    ogDescription: meta('og:description', 'property'),
    ogImage: meta('og:image', 'property'),
    charset: doc.characterSet || null,
    h1: h1 ? (h1.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 200) : null,
    viewport: { width: innerWidth, height: innerHeight },
    pageSize: { width: de.scrollWidth, height: de.scrollHeight },
    scroll: { x: scrollX, y: scrollY },
    devicePixelRatio: devicePixelRatio,
  };
}

export interface AiAttributes {
  [attr: string]: string | Record<string, string> | undefined;
  data?: Record<string, string>;
  aria?: Record<string, string>;
}

/** Useful attributes, data-* (≤ 5) and aria-* (≤ 8 plus aria-label); our own data-sr-* skipped. */
export function extractAiAttributes(el: Element): AiAttributes {
  const out: AiAttributes = {};
  for (const name of ATTRS) {
    const v = el.getAttribute(name);
    if (v) out[name] = cut(v, 200);
  }
  const data: Record<string, string> = {};
  const aria: Record<string, string> = {};
  let nd = 0;
  let na = 0;
  for (const a of el.attributes) {
    if (a.name.startsWith('data-sr-')) continue;
    if (a.name.startsWith('data-')) {
      if (nd < 5 && a.value) {
        data[a.name] = cut(a.value, 100);
        nd++;
      }
    } else if (a.name.startsWith('aria-') && a.name !== 'aria-label' && na < 8 && a.value) {
      aria[a.name] = a.value;
      na++;
    }
  }
  const label = el.getAttribute('aria-label');
  if (label !== null) aria['aria-label'] = label;
  if (Object.keys(data).length) out.data = data;
  if (Object.keys(aria).length) out.aria = aria;
  return out;
}

export interface OutlineNode {
  id: string;
  tag: string;
  selector: string;
  htmlId?: string;
  classes?: string;
  text?: string;
  attrs?: AiAttributes;
  shadowRoot?: true;
  children?: OutlineNode[];
  truncatedChildren?: number;
}

export function buildOutlineTree(
  root: Element,
  idOf: IdOf,
  opts: { maxDepth?: number; maxChildren?: number } = {},
): OutlineNode | null {
  const maxDepth = opts.maxDepth ?? 8;
  const maxChildren = opts.maxChildren ?? 30;
  const walk = (el: Element, depth: number): OutlineNode | null => {
    const tag = el.tagName.toLowerCase();
    if (SKIP_OUTLINE.has(tag) || isOwnHost(el)) return null;
    const node: OutlineNode = { id: idOf(el), tag, selector: displaySelector(el) };
    if (el.id) node.htmlId = el.id;
    const c = classesOf(el);
    if (c) node.classes = c;
    const t = ownText(el);
    if (t) node.text = cut(t, 80);
    const attrs = extractAiAttributes(el);
    if (Object.keys(attrs).length) node.attrs = attrs;
    const kids = el.shadowRoot ? [...el.shadowRoot.children] : [...el.children];
    if (el.shadowRoot) node.shadowRoot = true;
    if (depth < maxDepth && kids.length) {
      const children: OutlineNode[] = [];
      for (const k of kids) {
        if (children.length >= maxChildren) break;
        const n = walk(k, depth + 1);
        if (n) children.push(n);
      }
      if (children.length) node.children = children;
      if (kids.length > maxChildren) node.truncatedChildren = kids.length - maxChildren;
    }
    return node;
  };
  return walk(root, 0);
}

export function buildElementSummary(el: Element, idOf: IdOf) {
  const s = getComputedStyle(el);
  const css: Record<string, string> = {};
  for (const p of SUMMARY_CSS) css[p] = s.getPropertyValue(p);
  const text = ownText(el);
  return {
    id: idOf(el),
    tag: el.tagName.toLowerCase(),
    selector: displaySelector(el),
    htmlId: el.id || null,
    classes: classesOf(el),
    rect: rectOf(el),
    css,
    ...(text && { text: cut(text, 300) }),
  };
}

/** Matches in `root` and its open shadow roots, our own UI and page scaffolding skipped. */
export function queryBySelector(
  selector: string,
  idOf: IdOf,
  opts: { root?: Element; limit?: number } = {},
) {
  const limit = Math.min(Math.max(opts.limit ?? LIMITS.limitDefault, 1), LIMITS.limitMax);
  const root = opts.root ?? document.body;
  let all: Element[];
  try {
    all = queryAllDeep(root, selector, isOwnHost);
  } catch (e) {
    return {
      count: 0,
      truncated: 0,
      matches: [],
      error: `Invalid selector: ${(e as Error).message}`,
    };
  }
  const matches = [];
  let count = 0;
  for (const el of all) {
    if (SKIP_QUERY.has(el.tagName.toLowerCase()) || isOwnHost(el)) continue;
    if (el === document.body || el === document.documentElement) continue;
    count++;
    if (matches.length >= limit) continue;
    const text = ownText(el);
    const attrs = extractAiAttributes(el);
    const c = classesOf(el);
    matches.push({
      id: idOf(el),
      tag: el.tagName.toLowerCase(),
      selector: displaySelector(el),
      rect: rectOf(el),
      ...(el.id && { htmlId: el.id }),
      ...(c && { classes: c }),
      ...(text && { text: cut(text, 80) }),
      ...(Object.keys(attrs).length && { attrs }),
    });
  }
  return { count, truncated: count - matches.length, matches };
}
