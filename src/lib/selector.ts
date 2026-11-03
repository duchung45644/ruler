/** Element ids and selectors shared by the side panel bridge (port of content.js:15151–15360). */

/** Per-install attribute, so two copies of the extension never read each other's ids (2.17). */
export const ID_ATTR = (extId: string): string => `data-sr-id-${extId}`;

export const generateId = (rand: () => number = Math.random): string =>
  `v-${rand().toString(36).substring(2, 11)}`;

export function ensureElementId(
  el: Element,
  attr: string,
  map: Map<string, WeakRef<Element>>,
): string {
  let id = el.getAttribute(attr);
  if (!id) {
    id = generateId();
    el.setAttribute(attr, id);
  }
  if (map.get(id)?.deref() !== el) map.set(id, new WeakRef(el));
  return id;
}

function queryDeep(root: ParentNode, sel: string): Element | null {
  const hit = root.querySelector(sel);
  if (hit) return hit;
  for (const el of root.querySelectorAll('*')) {
    const found = el.shadowRoot && queryDeep(el.shadowRoot, sel);
    if (found) return found;
  }
  return null;
}

/** Map first; then the attribute, through open shadow roots (the page may have re-rendered). */
export function resolveElementById(
  id: string,
  attr: string,
  map: Map<string, WeakRef<Element>>,
  root: ParentNode = document,
): Element | null {
  const el = map.get(id)?.deref();
  if (el?.isConnected) return el;
  const found = queryDeep(root, `[${attr}="${CSS.escape(id)}"]`);
  if (found) map.set(id, new WeakRef(found));
  else map.delete(id);
  return found;
}

const classes = (el: Element): string[] =>
  typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean) : [];

/** Port of getDisplaySelector: `tag#id.class1.class2`. */
export function displaySelector(el: Element): string {
  let s = el.tagName.toLowerCase();
  if (el.id) s += `#${el.id}`;
  const c = classes(el);
  return c.length ? `${s}.${c.join('.')}` : s;
}

export const STATE_CLASSES = [
  'active',
  'disabled',
  'hidden',
  'visible',
  'open',
  'closed',
  'selected',
  'hover',
  'focus',
];
const SIMPLE_ID = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;

/** Port of getUniquePath: shortest selector unique in the element's own root (2.18). */
export function uniquePath(el: Element): string {
  const node = el.getRootNode() as Document | ShadowRoot;
  const root: Document | ShadowRoot = 'querySelectorAll' in node ? node : document;
  const isDoc = root === document;
  const count = (sel: string) => root.querySelectorAll(sel).length;
  if (el.id && SIMPLE_ID.test(el.id) && root.getElementById?.(el.id) === el) return `#${el.id}`;
  const stable = classes(el)
    .filter((c) => !STATE_CLASSES.includes(c))
    .map((c) => CSS.escape(c));
  if (stable.length && count(`.${stable.join('.')}`) === 1) return `.${stable.join('.')}`;
  const tag = el.tagName.toLowerCase();
  const all = classes(el).map((c) => CSS.escape(c));
  if (all.length && count(`${tag}.${all.join('.')}`) === 1) return `${tag}.${all.join('.')}`;

  const parts: string[] = [];
  for (
    let u: Element | null = el;
    u && !(isDoc && (u === document.body || u === document.documentElement));
    u = u.parentElement
  ) {
    if (u.id && SIMPLE_ID.test(u.id) && count(`#${CSS.escape(u.id)}`) === 1) {
      parts.unshift(`#${u.id}`);
      break;
    }
    let part = u.tagName.toLowerCase();
    const c = classes(u).map((x) => CSS.escape(x));
    if (c.length) part += `.${c.join('.')}`;
    const siblings = [
      ...(((u.parentElement ?? u.parentNode) as ParentNode | null)?.children ?? []),
    ];
    if (siblings.length > 1) part += `:nth-child(${siblings.indexOf(u) + 1})`;
    parts.unshift(part);
  }
  return parts.join(' > ');
}

/** Unique paths of the shadow hosts around `el`, outermost first. */
export function shadowHostPath(el: Element): string[] {
  const out: string[] = [];
  for (let n = el.getRootNode() as Node; n instanceof ShadowRoot; n = n.host.getRootNode())
    out.unshift(uniquePath(n.host));
  return out;
}

/** Port of getFullPath: shadow hosts joined with ` >>> `. */
export function fullPath(el: Element): string {
  return [...shadowHostPath(el), uniquePath(el)].join(' >>> ');
}
