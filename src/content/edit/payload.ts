/** Rule payload for the edit view (port of getRuleEditPayload :32625, scheduleEditExtras :33679, setupMediaActivityWatch :33713; 5.10). */
import {
  INLINE_SOURCE,
  matchedRules,
  overriddenDecls,
  declKey,
  inheritedProperty,
  type KnownRule,
} from '../../lib/css/matched';
import { parseDecls } from '../../lib/edit/decls';
import { addressOf, scopeAddressOf } from '../../lib/edit/rule-address';
import type { EditableRule, RulePayload } from '../../lib/edit/types';
import { sendToSidePanel } from '../../lib/messaging';
import { rootOf, rulesOf } from '../sidepanel/rules';
import { attachedSheets, lineOf, writable } from './rules';
import { availableStates, type StateForcer } from './states';

let paySeq = 0;

/** What every rule of one root shares: its scope, the attached sheets, rule occurrences. */
interface RootCtx {
  root: Document | ShadowRoot;
  rules: KnownRule[];
  scope: string | null;
  attached: Set<CSSStyleSheet>;
  occ: Map<CSSStyleRule, number>;
}

function rootCtx(root: Document | ShadowRoot, rules: KnownRule[]): RootCtx {
  // addressOf's occurrence count for every rule in one pass (it is O(rules) per call)
  const occ = new Map<CSSStyleRule, number>();
  const seen = new Map<string, number>();
  for (const k of rules) {
    const slot = `${k.source}\u0000${k.rule.selectorText}\u0000${k.wrappers.join('\u0000')}\u0000${k.wrappers.length}`;
    const n = seen.get(slot) ?? 0;
    if (!occ.has(k.rule)) occ.set(k.rule, n); // addressOf stops at the rule's first appearance
    seen.set(slot, n + 1);
  }
  return { root, rules, scope: scopeAddressOf(root), attached: attachedSheets(root), occ };
}

function editable(el: Element, c: RootCtx): EditableRule[] {
  return matchedRules(el, c.rules)
    .filter((m) => m.source !== INLINE_SOURCE)
    .map((m) => {
      const k = c.rules[m.sourceIndex]!;
      const address = {
        stylesheet: k.source,
        selector: k.rule.selectorText,
        wrappers: [...k.wrappers],
        occ: c.occ.get(k.rule) ?? addressOf(k, c.rules, c.scope).occ,
        scopeAddress: c.scope,
      };
      return {
        ...m,
        address,
        editable: writable(k.rule, c.root, c.attached),
        line: lineOf(k.rule, k.rule.selectorText),
      };
    });
}

export function buildPayload(el: Element, forcer: StateForcer): RulePayload {
  const root = rootOf(el);
  const { rules, blocked } = rulesOf(root);
  return {
    rules: editable(el, rootCtx(root, rules)),
    inline: parseDecls(el.getAttribute('style') ?? ''),
    availableStates: availableStates(el, rules),
    forcedState: forcer.forced,
    paySeq: ++paySeq,
    crossOriginMissing: blocked.size,
  };
}

/** Ancestor rules that set an inherited property, nearest ancestor first. */
export function inheritedRules(el: Element): EditableRule[] {
  const out: EditableRule[] = [];
  // ancestors share their root: read its rules (and build their index) once, not per ancestor
  const ctxs = new Map<Document | ShadowRoot, RootCtx>();
  for (let a = el.parentElement; a; a = a.parentElement) {
    const root = rootOf(a);
    let c = ctxs.get(root);
    if (!c) ctxs.set(root, (c = rootCtx(root, rulesOf(root).rules)));
    const rules = editable(a, c).filter((r) =>
      r.declarations.some((d) => inheritedProperty(d.property)),
    );
    out.push(...rules);
  }
  return out;
}

type Send = typeof sendToSidePanel;
let cancelExtras: (() => void) | null = null;

/** Inherited rules are slow on big pages, so they follow the payload when the page is idle. */
export function scheduleExtras(el: Element, seq: number, send: Send = sendToSidePanel): void {
  cancelExtras?.();
  const run = () => {
    cancelExtras = null;
    if (!el.isConnected) return;
    void send('edit_payload_extras', seq, inheritedRules(el)).catch(() => {});
  };
  if (typeof requestIdleCallback === 'function') {
    const h = requestIdleCallback(run, { timeout: 500 });
    cancelExtras = () => cancelIdleCallback(h);
  } else {
    const h = setTimeout(run, 0);
    cancelExtras = () => clearTimeout(h);
  }
}

let stopMedia: (() => void) | null = null;

/** One matchMedia per distinct `@media` wrapper; the panel hears when any flips. */
export function watchMedia(rules: { wrappers: string[] }[], send: Send = sendToSidePanel): void {
  unwatchMedia();
  const conds = [
    ...new Set(rules.flatMap((r) => r.wrappers.filter((w) => w.startsWith('@media ')))),
  ];
  if (!conds.length) return;
  const lists = conds.map((c) => [c, matchMedia(c.slice(7))] as const);
  const report = () =>
    void send('media_activity', Object.fromEntries(lists.map(([c, m]) => [c, m.matches]))).catch(
      () => {},
    );
  for (const [, m] of lists) m.addEventListener('change', report);
  stopMedia = () => {
    for (const [, m] of lists) m.removeEventListener('change', report);
  };
}

export function unwatchMedia(): void {
  stopMedia?.();
  stopMedia = null;
}

export function cancelScheduledExtras(): void {
  cancelExtras?.();
  cancelExtras = null;
}

const literal = (v: string) =>
  !/var\(|calc\(|env\(|attr\(|%|em\b|inherit|initial|unset|revert/i.test(v);

/**
 * Properties whose computed value disagrees with the cascade winner we know of: something we
 * cannot read (a cross-origin sheet) must be overriding them (6.42).
 */
export function ghostProbe(el: Element): string[] {
  const root = rootOf(el);
  const { rules } = rulesOf(root);
  const matched = matchedRules(el, rules);
  const lost = overriddenDecls(matched);
  const cs = getComputedStyle(el);
  const out = new Set<string>();
  matched.forEach((r, i) => {
    if (!r.mediaActive) return;
    for (const d of r.declarations) {
      if (lost.has(declKey(i, d.property)) || d.property.startsWith('--') || !literal(d.value))
        continue;
      const got = cs.getPropertyValue(d.property).trim();
      if (got && normalize(got) !== normalize(d.value)) out.add(d.property);
    }
  });
  return [...out];
}

/** Colour and spacing spellings differ between authored and computed text. */
function normalize(v: string): string {
  const probe = document.createElement('div').style;
  probe.color = v;
  const asColor = probe.color;
  return (asColor || v).replace(/\s+/g, ' ').trim().toLowerCase();
}
