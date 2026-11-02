/** Our elements living in the page DOM (overlay images, …); legacy ownNodes() in bd/core.js. */
export const ownNodes = new Set<Element>();

const isOwnNode = (n: Element): boolean => [...ownNodes].some((o) => o.contains(n));

export function isOwnEvent(e: Event, host: Element): boolean {
  return e.composedPath().some((n) => n === host || ownNodes.has(n as Element));
}

/** Topmost page element under the point, ignoring our host, own nodes and html/body. */
export function pageElementAt(x: number, y: number, host: Element): Element | null {
  return (
    document
      .elementsFromPoint(x, y)
      .find(
        (n) => n !== host && n !== document.body && n !== document.documentElement && !isOwnNode(n),
      ) ?? null
  );
}
