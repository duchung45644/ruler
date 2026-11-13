/** Our elements living in the page DOM (overlay images, …); legacy ownNodes() in bd/core.js. */
export const ownNodes = new Set<Element>();

const isOwnNode = (n: Element): boolean => [...ownNodes].some((o) => o.contains(n));

/**
 * Input events the agent dispatched (MCP click_element / type_text / press_key). PixelLens's own
 * listeners (inspector, measure, ruler, shortcuts, drag guard) let them through to the page.
 */
export const agentEvents = new WeakSet<Event>();

export function isOwnEvent(e: Event, host: Element): boolean {
  if (agentEvents.has(e)) return true;
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
