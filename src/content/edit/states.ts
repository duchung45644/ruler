/** Forced :hover / :focus / … on the selected element (port of forceState, content.js:34379–34406; 5.11). */
import type { KnownRule } from '../../lib/css/matched';
import { splitTop } from '../../lib/css/specificity';
import {
  FORCEABLE_STATES,
  forceAttr,
  rewriteForState,
  statesInSelector,
} from '../../lib/css/states';
import { rootOf, rulesOf } from '../sidepanel/rules';

const STATE_RE = new RegExp(`(${FORCEABLE_STATES.join('|')})(?![a-z-])`, 'g');

const matches = (el: Element, sel: string) => {
  try {
    return el.matches(sel);
  } catch {
    return false;
  }
};

/** States of rules that would match `el` if their states held. */
export function availableStates(el: Element, rules: KnownRule[]): string[] {
  const out = new Set<string>();
  for (const k of rules)
    for (const alt of splitTop(k.rule.selectorText, ',')) {
      const states = statesInSelector(alt);
      if (!states.length) continue;
      const bare = alt.replace(STATE_RE, '').trim() || '*';
      if (matches(el, bare)) for (const s of states) out.add(s);
    }
  return FORCEABLE_STATES.filter((s) => out.has(s));
}

export class StateForcer {
  private el: Element | null = null;
  private state: string | null = null;
  private style: HTMLStyleElement | null = null;

  constructor(private extId: string) {}

  get forced(): string | null {
    return this.el?.isConnected ? this.state : null;
  }

  get styleId(): string {
    return `sr-force-state-${this.extId}`;
  }

  forceState(el: Element | null, state: string | null): void {
    this.clear();
    if (!el || !state) return;
    this.el = el;
    this.state = state;
    el.setAttribute(forceAttr(state, this.extId), '');
    const root = rootOf(el);
    const css: string[] = [];
    for (const k of rulesOf(root).rules) {
      const sel = splitTop(k.rule.selectorText, ',')
        .map((alt) => rewriteForState(alt, state, this.extId))
        .filter((s): s is string => !!s && matches(el, s))
        .join(', ');
      if (!sel) continue;
      css.push(
        k.wrappers.reduceRight(
          (inner, w) => `${w} { ${inner} }`,
          `${sel} { ${k.rule.style.cssText} }`,
        ),
      );
    }
    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = css.join('\n');
    (root.nodeType === Node.DOCUMENT_NODE ? (root as Document).head : root).append(style);
    this.style = style;
  }

  clear(): void {
    if (this.el && this.state) this.el.removeAttribute(forceAttr(this.state, this.extId));
    this.style?.remove();
    this.el = this.state = this.style = null;
  }
}
