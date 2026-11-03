/** Stable address of a stylesheet rule across re-reads (port of content.js:16845, 17387). */
import type { KnownRule } from '../css/matched';
import { fullPath } from '../selector';

export interface RuleAddress {
  stylesheet: string;
  selector: string;
  wrappers: string[];
  /** Index among rules with the same stylesheet, selector and wrappers. */
  occ: number;
  scopeAddress: string | null;
}

const sameSlot = (r: KnownRule, stylesheet: string, selector: string, wrappers: string[]) =>
  r.source === stylesheet &&
  r.rule.selectorText === selector &&
  r.wrappers.length === wrappers.length &&
  r.wrappers.every((w, i) => w === wrappers[i]);

export function addressOf(
  rule: KnownRule,
  all: KnownRule[],
  scopeAddress: string | null,
): RuleAddress {
  const selector = rule.rule.selectorText;
  let occ = 0;
  for (const r of all) {
    if (r === rule || r.rule === rule.rule) break;
    if (sameSlot(r, rule.source, selector, rule.wrappers)) occ++;
  }
  return { stylesheet: rule.source, selector, wrappers: [...rule.wrappers], occ, scopeAddress };
}

/** `all` must come from the root named by `addr.scopeAddress`. */
export function locate(addr: RuleAddress, all: KnownRule[]): KnownRule | null {
  let occ = 0;
  for (const r of all) {
    if (!sameSlot(r, addr.stylesheet, addr.selector, addr.wrappers)) continue;
    if (occ++ === addr.occ) return r;
  }
  return null;
}

export const scopeAddressOf = (root: Document | ShadowRoot): string | null =>
  root instanceof ShadowRoot ? fullPath(root.host) : null;
