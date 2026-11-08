/** Escape and the dock's letter keys (lowercase; Shift is not forwarded). */
const FORWARD = new Set(['Escape', ...'ixgrbvcfspoma']);

export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  target: EventTarget | null;
}

/** Port of Go (sidepanel.js:12702): keys pressed in the panel that act on the page (6.15). */
export function forwardKey(e: KeyLike): string | null {
  if (!FORWARD.has(e.key) || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return null;
  const t = e.target as HTMLElement | null;
  if (t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable))
    return null;
  return e.key;
}
