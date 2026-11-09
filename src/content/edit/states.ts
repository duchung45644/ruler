/** Forced :hover / :focus / … on the selected element (port of forceState, content.js:34379–34406; 5.11). */
import { safeMatches, type KnownRule } from '../../lib/css/matched';
import { splitTop } from '../../lib/css/specificity';
import {
  FORCEABLE_STATES,
  forceAttr,
  rewriteForState,
  statesInSelector,
} from '../../lib/css/states';
import { rootOf, rulesOf } from '../sidepanel/rules';
import { appendStyle, wrapRule } from './rules';

const STATE_RE = new RegExp(`(${FORCEABLE_STATES.join('|')})(?![a-z-])`, 'g');

/** States of rules that would match `el` if their states held. */
export function availableStates(el: Element, rules: KnownRule[]): string[] {
  const out = new Set<string>();
  for (const k of rules)
    for (const alt of splitTop(k.rule.selectorText, ',')) {
      const states = statesInSelector(alt);
      if (!states.length) continue;
      const bare = alt.replace(STATE_RE, '').trim() || '*';
      if (safeMatches(el, bare)) for (const s of states) out.add(s);
    }
  return FORCEABLE_STATES.filter((s) => out.has(s));
}

/** `alt` with every forced state it uses swapped for its attribute, or null when it uses none. */
export function rewriteForStates(
  alt: string,
  states: readonly string[],
  extId: string,
): string | null {
  let out: string | null = null;
  for (const st of states) out = rewriteForState(out ?? alt, st, extId) ?? out;
  return out;
}

/** Forces any set of states on one element at a time (the panel chips; MCP forces one). */
export class StateForcer {
  private el: Element | null = null;
  private states: string[] = [];
  private style: HTMLStyleElement | null = null;

  constructor(private extId: string) {}

  /** The forced states, in FORCEABLE_STATES order; empty once the element left the page. */
  get forcedStates(): string[] {
    return this.el?.isConnected ? [...this.states] : [];
  }

  /** The first forced state (MCP replies with one). */
  get forced(): string | null {
    return this.forcedStates[0] ?? null;
  }

  /** The element the states are forced on, if any. */
  get target(): Element | null {
    return this.el;
  }

  get styleId(): string {
    return `sr-force-state-${this.extId}`;
  }

  /** Forces exactly `state` (null clears). */
  forceState(el: Element | null, state: string | null): void {
    this.setStates(el, state ? [state] : []);
  }

  /** Forces exactly `states` on `el`; unknown states are ignored, an empty list clears. */
  setStates(el: Element | null, states: readonly string[]): void {
    this.clear();
    const list = FORCEABLE_STATES.filter((s) => states.includes(s));
    if (!el || !list.length) return;
    this.el = el;
    this.states = list;
    for (const st of list) el.setAttribute(forceAttr(st, this.extId), '');
    const root = rootOf(el);
    const css: string[] = [];
    for (const k of rulesOf(root).rules) {
      const sel = splitTop(k.rule.selectorText, ',')
        .map((alt) => rewriteForStates(alt, list, this.extId))
        .filter((s): s is string => !!s && safeMatches(el, s))
        .join(', ');
      if (sel) css.push(wrapRule(sel, k.rule.style.cssText, k.wrappers));
    }
    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = css.join('\n');
    appendStyle(root, style);
    this.style = style;
  }

  clear(): void {
    for (const st of this.states) this.el?.removeAttribute(forceAttr(st, this.extId));
    this.style?.remove();
    this.el = this.style = null;
    this.states = [];
  }
}
