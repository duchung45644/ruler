import type { i18n } from '#i18n';
import { isRendered, shadowRoots } from '../dom/dom';

const isOwn = (el: Element) => el.localName === 'iodob-ui';

/** Port of findElement (legacy-src/content.js:38503): document, then each open shadow root. */
export function findAll(
  selector: string,
  isVisible: (el: Element) => boolean,
): { found: Element[]; hidden: number } {
  if (!selector.trim()) return { found: [], hidden: 0 };
  let all: Element[];
  try {
    all = [document, ...shadowRoots(document, isOwn)].flatMap((r) => [
      ...r.querySelectorAll(selector),
    ]);
  } catch {
    return { found: [], hidden: 0 }; // invalid selector: silent (Review Focus 4)
  }
  const found = all.filter(isVisible);
  return { found, hidden: all.length - found.length };
}

/** Port of isElementVisible (legacy-src/content.js:44420). */
export function isVisible(el: Element): boolean {
  if (!el.isConnected) return false;
  let top: Element = el;
  for (let r = top.getRootNode(); r instanceof ShadowRoot; r = top.getRootNode()) top = r.host;
  if (!document.body.contains(top)) return false;
  const cs = getComputedStyle(el);
  if (
    top === el &&
    (el as HTMLElement).offsetParent === null &&
    el.localName !== 'body' &&
    cs.position !== 'fixed' &&
    cs.position !== 'sticky'
  )
    return false;
  if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0)
    return false;
  return isRendered(el);
}

/** Port of updateFindTitle (legacy-src/content.js:38901). */
export function findTitle(index: number, count: number, hidden: number, t: typeof i18n.t): string {
  let s = count > 0 ? `${index + 1}/${count}` : hidden > 0 ? '0' : t('find.title');
  if (hidden > 0) s += ` (${t('find.hidden', [String(hidden)])})`;
  return s;
}
