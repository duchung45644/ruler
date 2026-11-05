/**
 * Structural address of an element that survives across documents with the same markup
 * (responsive frames and the page): element-child indexes from the document, hopping into
 * open shadow roots, with tag names as a sanity check.
 */

/** One tree level: index among the parent's element children, and the expected tag. */
export interface LocatorStep {
  i: number;
  tag: string;
}

/** `hops[0]` starts at the document; each next hop starts at the previous element's shadow root. */
export interface ElementLocator {
  hops: LocatorStep[][];
}

type Parent = Document | ShadowRoot | Element;

/** Locator of `el`, or null when it is not in a document (or sits in a closed shadow root). */
export function locateElement(el: Element): ElementLocator | null {
  const hops: LocatorStep[][] = [];
  let cur: Element = el;
  for (;;) {
    const steps: LocatorStep[] = [];
    let node: Element = cur;
    let top: Node;
    for (;;) {
      const parent: Node | null = node.parentNode;
      if (!parent) return null;
      const i = Array.prototype.indexOf.call((parent as Parent).children, node);
      if (i < 0) return null;
      steps.unshift({ i, tag: node.localName });
      if (parent.nodeType !== Node.ELEMENT_NODE) {
        top = parent;
        break;
      }
      node = parent as Element;
    }
    hops.unshift(steps);
    if (top.nodeType === Node.DOCUMENT_NODE) return { hops };
    if (!(top instanceof ShadowRoot) || top.mode !== 'open') return null;
    cur = top.host;
  }
}

/** Element at `loc` in `doc`, or null if any step is missing or its tag differs. */
export function resolveLocator(loc: unknown, doc: Document = document): Element | null {
  if (!isElementLocator(loc)) return null;
  let start: Parent | null = doc;
  let el: Element | null = null;
  for (const hop of loc.hops) {
    if (!start) return null;
    let p: Parent = start;
    for (const s of hop) {
      const next: Element | undefined = p.children[s.i];
      if (!next || next.localName !== s.tag) return null;
      p = next;
    }
    el = p as Element;
    start = el.shadowRoot;
  }
  return el;
}

/** Stable string key for a locator (map key / dedupe). */
export const locatorKey = (loc: ElementLocator): string =>
  loc.hops.map((h) => h.map((s) => `${s.i}:${s.tag}`).join('/')).join('|');

export function isElementLocator(v: unknown): v is ElementLocator {
  const hops = (v as ElementLocator | null)?.hops;
  return (
    Array.isArray(hops) &&
    hops.length > 0 &&
    hops.every(
      (h) =>
        Array.isArray(h) &&
        h.length > 0 &&
        h.every(
          (s: LocatorStep) =>
            !!s && Number.isInteger(s.i) && s.i >= 0 && typeof s.tag === 'string' && !!s.tag,
        ),
    )
  );
}
