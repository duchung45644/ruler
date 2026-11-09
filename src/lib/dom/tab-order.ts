/** Elements that can take sequential focus (before tabindex / disabled / visibility checks). */
export const FOCUSABLE =
  'a[href],area[href],button,input:not([type="hidden"]),select,textarea,iframe,summary,audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),[tabindex]';

/**
 * Sequential navigation order (HTML focus order): positive tabindex first, ascending, ties in
 * tree order; then tabindex 0 in tree order. Negative indexes are skipped. `items` is in tree order.
 */
export function sortTabOrder<T>(items: readonly T[], tabIndexOf: (t: T) => number): T[] {
  return items
    .map((t, i) => ({ t, i, n: tabIndexOf(t) }))
    .filter((x) => x.n >= 0)
    .sort((a, b) => {
      if (a.n > 0 !== b.n > 0) return a.n > 0 ? -1 : 1;
      return (a.n > 0 ? a.n - b.n : 0) || a.i - b.i;
    })
    .map((x) => x.t);
}

function isVisible(el: Element): boolean {
  const check = (el as HTMLElement).checkVisibility;
  if (check) return check.call(el, { visibilityProperty: true });
  for (let n: Element | null = el; n; n = n.parentElement)
    if (getComputedStyle(n).display === 'none') return false;
  return getComputedStyle(el).visibility !== 'hidden';
}

/** Not disabled (itself or by a disabled fieldset), not inert, rendered: reachable by Tab. */
export function isTabbable(el: Element): boolean {
  if ((el as HTMLButtonElement).disabled) return false;
  if (el.closest('[inert]')) return false;
  // a disabled fieldset disables its form controls (the first-legend exception is ignored)
  if (el.matches('button,input,select,textarea') && el.closest('fieldset[disabled]')) return false;
  return isVisible(el);
}

/**
 * Focusable, tabbable elements under `root` in Tab order, skipping `isOwn` (our UI). An open shadow
 * root is its own scope: sorted on its own and inserted where its host sits, ordered by the host's
 * tabindex (after the host itself when the host is focusable). Slotted content keeps its light-DOM place.
 */
export function tabOrder(root: ParentNode, isOwn: (el: Element) => boolean): HTMLElement[] {
  const focusable = new Set(root.querySelectorAll(FOCUSABLE));
  const entries: { n: number; els: HTMLElement[] }[] = [];
  for (const el of root.querySelectorAll<HTMLElement>('*')) {
    if (isOwn(el)) continue;
    const self = focusable.has(el) && isTabbable(el) ? [el] : [];
    const inner = el.shadowRoot ? tabOrder(el.shadowRoot, isOwn) : [];
    if (!self.length && !inner.length) continue;
    const n = self.length || el.hasAttribute('tabindex') ? el.tabIndex : 0;
    entries.push({ n, els: [...self, ...inner] });
  }
  return sortTabOrder(entries, (e) => e.n).flatMap((e) => e.els);
}

/** The node itself or an ancestor is our UI (an own host, or a `data-pixellens` node). */
function inOwn(node: Node, isOwn: (el: Element) => boolean): boolean {
  for (let el = node instanceof Element ? node : node.parentElement; el; el = el.parentElement)
    if (isOwn(el) || el.hasAttribute('data-pixellens')) return true;
  return false;
}

/** True when some record touches the page rather than only our own nodes (overlay, split bar…). */
export function touchesPage(records: MutationRecord[], isOwn: (el: Element) => boolean): boolean {
  return records.some((r) => {
    if (r.type !== 'childList') return !inOwn(r.target, isOwn);
    if (inOwn(r.target, isOwn)) return false;
    return [...r.addedNodes, ...r.removedNodes].some((n) => n.nodeType === 1 && !inOwn(n, isOwn));
  });
}
