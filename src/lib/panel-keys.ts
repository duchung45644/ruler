const FORWARD = new Set(['Escape', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

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
