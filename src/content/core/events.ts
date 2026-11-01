export function isOwnEvent(e: Event, host: Element): boolean {
  return e.composedPath().includes(host);
}

/** Topmost page element under the point, ignoring our host and html/body. */
export function pageElementAt(x: number, y: number, host: Element): Element | null {
  return (
    document
      .elementsFromPoint(x, y)
      .find((n) => n !== host && n !== document.body && n !== document.documentElement) ?? null
  );
}
