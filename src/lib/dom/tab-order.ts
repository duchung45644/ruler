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

/** Focusable, tabbable elements under `root` in Tab order, skipping `isOwn` (our UI). */
export function tabOrder(root: ParentNode, isOwn: (el: Element) => boolean): HTMLElement[] {
  const els = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !isOwn(el) && isTabbable(el),
  );
  return sortTabOrder(els, (el) => el.tabIndex);
}
