import type { MatchedRule } from '../element/types';
import { parseDecls } from '../edit/decls';
import { specificity, splitState, splitTop } from './specificity';

/** A style rule met while walking the sheets, with the at-rules around it. */
export interface KnownRule {
  rule: CSSStyleRule;
  source: string;
  wrappers: string[];
  mediaActive: boolean;
  sourceIndex: number;
}

/** Inline `style=""` travels as a pseudo rule; it beats any selector (legacy vv: 1e9). */
export const INLINE_SOURCE = 'element.style';
const INLINE_SCORE = 1_000_000_000;

const ctor = (name: string) =>
  (globalThis as Record<string, unknown>)[name] as
    (abstract new (...a: never[]) => unknown) | undefined;
const is = (r: CSSRule, name: string) => {
  const C = ctor(name);
  return !!C && r instanceof C;
};

export interface SourcedSheet {
  sheet: CSSStyleSheet;
  /** Legacy `o` (content.js:31331): the href, `inline` for `<style>`, `constructed` if adopted. */
  source: string;
}

/** The sheets that style `root`'s tree, in cascade order: owned by nodes, then adopted. */
/** A sheet's rules, or null when it cannot be read (cross-origin). */
export function cssRulesOf(sheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return sheet.cssRules;
  } catch {
    return null;
  }
}

export function sheetsOf(root: Document | ShadowRoot): SourcedSheet[] {
  const owned = [...root.querySelectorAll('style, link[rel~="stylesheet"]')].flatMap((n) => {
    const sheet = (n as HTMLStyleElement | HTMLLinkElement).sheet;
    if (!sheet || sheet.disabled) return [];
    return [{ sheet, source: n instanceof HTMLLinkElement ? n.href || 'inline' : 'inline' }];
  });
  const adopted = (root.adoptedStyleSheets ?? []).map((sheet) => ({
    sheet,
    source: 'constructed',
  }));
  return [...owned, ...adopted];
}

/** Legacy yv (content.js:26631): the group name the panel shows. */
export function sourceName(source: string): string {
  if (source === 'inline') return '<style>';
  if (source === 'constructed' || source === INLINE_SOURCE) return source;
  return source.split(/[?#]/)[0]!.split('/').pop() || source;
}

function active(r: CSSRule): boolean {
  try {
    if (is(r, 'CSSMediaRule')) return matchMedia((r as CSSMediaRule).media.mediaText).matches;
    if (is(r, 'CSSSupportsRule')) return CSS.supports((r as CSSSupportsRule).conditionText);
  } catch {
    // unparseable condition: show the rule as active
  }
  return true;
}

function wrapper(r: CSSRule): string | null {
  if (is(r, 'CSSMediaRule')) return `@media ${(r as CSSMediaRule).media.mediaText}`;
  if (is(r, 'CSSSupportsRule')) return `@supports ${(r as CSSSupportsRule).conditionText}`;
  if (is(r, 'CSSLayerBlockRule')) return `@layer ${(r as CSSLayerBlockRule).name}`.trim();
  if (is(r, 'CSSContainerRule')) return `@container ${(r as CSSContainerRule).conditionText}`;
  return null;
}

/**
 * Every style rule in `sheets`, in source order, `@import`s followed. `@media` / `@supports` /
 * `@layer` / `@container` become `wrappers`; `mediaActive` is false when an enclosing condition
 * does not hold now. `onBlocked` gets each sheet whose rules are cross-origin.
 */
export function collectRules(
  sheets: SourcedSheet[],
  onBlocked?: (s: SourcedSheet) => void,
): KnownRule[] {
  const out: KnownRule[] = [];
  const walk = (rules: CSSRuleList, source: string, wrappers: string[], on: boolean) => {
    for (const r of rules) {
      if (is(r, 'CSSStyleRule')) {
        out.push({
          rule: r as CSSStyleRule,
          source,
          wrappers,
          mediaActive: on,
          sourceIndex: out.length,
        });
        continue;
      }
      if (is(r, 'CSSImportRule')) {
        const sheet = (r as CSSImportRule).styleSheet;
        if (sheet) visit({ sheet, source: sheet.href || source }, wrappers, on);
        continue;
      }
      const w = wrapper(r);
      const inner = (r as CSSGroupingRule).cssRules;
      if (w !== null && inner) walk(inner, source, [...wrappers, w], on && active(r));
    }
  };
  const visit = (s: SourcedSheet, wrappers: string[], on: boolean) => {
    const rules = cssRulesOf(s.sheet);
    if (rules) walk(rules, s.source, wrappers, on);
    else onBlocked?.(s);
  };
  for (const s of sheets) visit(s, [], true);
  return out;
}

/** el.matches that treats an invalid selector as no match. */
export const safeMatches = (el: Element, sel: string) => {
  try {
    return el.matches(sel);
  } catch {
    return false;
  }
};

/** One selector alternative: skipped when it targets a state or a pseudo-element. */
interface Alt {
  sel: string;
  skip: boolean;
  spec?: ReturnType<typeof specificity>;
  /** subjectKey, once computed. */
  key?: string | null;
}
/** Parsed alternatives per rule, kept while its selectorText stays the same. */
const parsed = new WeakMap<CSSStyleRule, { text: string; alts: Alt[] }>();

function altsOf(rule: CSSStyleRule): Alt[] {
  const text = rule.selectorText;
  let p = parsed.get(rule);
  if (!p || p.text !== text) {
    const alts = splitTop(text, ',').map((sel) => {
      const { state, pseudoElement } = splitState(sel);
      return { sel, skip: !!(state || pseudoElement) };
    });
    parsed.set(rule, (p = { text, alts }));
  }
  return p.alts;
}

/** Index just past the escape starting at `s[i] === '\\'` (hex escapes eat one whitespace). */
function pastEscape(s: string, i: number): number {
  const hex = /^[0-9a-fA-F]{1,6}[ \t\n\r\f]?/.exec(s.slice(i + 1, i + 8));
  return hex ? i + 1 + hex[0].length : i + 2;
}

/** CSS escape value: zero, surrogates and out-of-range code points become U+FFFD. */
const codePoint = (n: number) =>
  String.fromCodePoint(n === 0 || n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff) ? 0xfffd : n);

/**
 * Bucket key of a complex selector: `#id`, else `.class`, else the tag of its subject compound,
 * read outside brackets / parentheses (`:not(.x)` says nothing). null: test it on every element.
 * An element matching the selector always carries the key, so the index never drops a match.
 */
export function subjectKey(sel: string): string | null {
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i]!;
    if (c === '\\') {
      i = pastEscape(sel, i) - 1;
      continue;
    }
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && ' >+~\t\n\r\f'.includes(c)) start = i + 1;
  }
  const comp = sel.slice(start);
  if (!comp || depth !== 0 || quote || comp.includes('|')) return null;
  let i = 0;
  const ident = () => {
    let out = '';
    while (i < comp.length) {
      const c = comp[i]!;
      if (c === '\\') {
        const j = pastEscape(comp, i);
        const body = comp.slice(i + 1, j);
        // a hex escape drops its one trailing whitespace; any other escaped char (space too) stays
        out += /^[0-9a-fA-F]/.test(body) ? codePoint(parseInt(body, 16)) : body;
        i = j;
      } else if (/[\w\-\u00a0-\uffff]/.test(c)) {
        out += c;
        i++;
      } else break;
    }
    return out;
  };
  const skipGroup = () => {
    let d = 0;
    let q = '';
    for (; i < comp.length; i++) {
      const c = comp[i]!;
      if (c === '\\') i = pastEscape(comp, i) - 1;
      else if (q) {
        if (c === q) q = '';
      } else if (c === '"' || c === "'") q = c;
      else if (c === '(' || c === '[') d++;
      else if ((c === ')' || c === ']') && --d === 0) {
        i++;
        return;
      }
    }
  };
  let id = '';
  let cls = '';
  let tag = '';
  if (/[\w\-\\\u00a0-\uffff]/.test(comp[0]!)) tag = ident().toLowerCase();
  while (i < comp.length) {
    const c = comp[i]!;
    if (c === '#' || c === '.') {
      i++;
      const v = ident();
      if (c === '#') id ||= v;
      else cls ||= v;
    } else if (c === '[' || c === '(') skipGroup();
    else if (c === ':') {
      i += comp[i + 1] === ':' ? 2 : 1;
      ident();
      if (comp[i] === '(') skipGroup();
    } else i++;
  }
  return id ? `#${id}` : cls ? `.${cls}` : tag ? tag : null;
}

interface RuleIndex {
  keyed: Map<string, number[]>;
  /** Rules with an alternative that has no key. */
  always: number[];
}
const indexes = new WeakMap<KnownRule[], RuleIndex>();

/** Built once per rule list (rulesOf returns a fresh list per read). */
function indexOf(rules: KnownRule[]): RuleIndex {
  let ix = indexes.get(rules);
  if (ix) return ix;
  ix = { keyed: new Map(), always: [] };
  rules.forEach((k, n) => {
    let always = false;
    const keys = new Set<string>();
    for (const alt of altsOf(k.rule)) {
      if (alt.skip) continue;
      const key = alt.key !== undefined ? alt.key : (alt.key = subjectKey(alt.sel));
      if (key === null) always = true;
      else keys.add(key);
    }
    if (always) ix!.always.push(n);
    else
      for (const key of keys) {
        const list = ix!.keyed.get(key);
        if (list) list.push(n);
        else ix!.keyed.set(key, [n]);
      }
  });
  indexes.set(rules, ix);
  return ix;
}

/** Rules that can match `el`: its id / class / tag buckets plus the unkeyed ones. */
function candidates(el: Element, rules: KnownRule[]): Iterable<number> {
  // quirks mode matches class / id names case-insensitively: no shortcuts there
  if (el.ownerDocument.compatMode === 'BackCompat') return rules.keys();
  const ix = indexOf(rules);
  const hit = new Set<number>(ix.always);
  const add = (key: string) => {
    for (const n of ix.keyed.get(key) ?? []) hit.add(n);
  };
  if (el.id) add(`#${el.id}`);
  for (const c of el.classList) add(`.${c}`);
  add(el.localName.toLowerCase());
  // rule order, so ties in the final sort come out as in the linear scan
  return [...hit].sort((a, b) => a - b);
}

/**
 * Port of getAppliedRules, read-only: rules whose selector matches `el` itself (pseudo-element and
 * user-action-state alternatives left out), the most specific matching alternative scoring each.
 * Sorted by score, then later source first; inline style leads when present.
 */
export function matchedRules(el: Element, rules: KnownRule[]): MatchedRule[] {
  const out: MatchedRule[] = [];
  for (const n of candidates(el, rules)) {
    const k = rules[n]!;
    let best: ReturnType<typeof specificity> | null = null;
    for (const alt of altsOf(k.rule)) {
      if (alt.skip || !safeMatches(el, alt.sel)) continue;
      const s = (alt.spec ??= specificity(alt.sel));
      if (!best || s.score > best.score) best = s;
    }
    if (!best) continue;
    out.push({
      selector: k.rule.selectorText,
      wrappers: k.wrappers,
      mediaActive: k.mediaActive,
      specificity: best.array,
      sourceIndex: k.sourceIndex,
      score: best.score,
      source: k.source,
      declarations: parseDecls(k.rule.style.cssText),
    });
  }
  const inline = (el as HTMLElement).style;
  if (inline?.length) {
    out.push({
      selector: INLINE_SOURCE,
      wrappers: [],
      mediaActive: true,
      specificity: [0, 0, 0],
      sourceIndex: rules.length,
      score: INLINE_SCORE,
      source: INLINE_SOURCE,
      declarations: parseDecls(inline.cssText),
    });
  }
  return out.sort((a, b) => b.score - a.score || b.sourceIndex - a.sourceIndex);
}

/** Rules grouped by sheet, groups in the order the sheets come (6.25). */
export function groupBySource(
  rules: MatchedRule[],
): { source: string; name: string; rules: MatchedRule[] }[] {
  const groups = new Map<
    string,
    { source: string; name: string; rules: MatchedRule[]; first: number }
  >();
  for (const r of rules) {
    // two <style> blocks share the name, as legacy shows them under one <style> heading
    let g = groups.get(r.source);
    if (!g)
      groups.set(
        r.source,
        (g = { source: r.source, name: sourceName(r.source), rules: [], first: r.sourceIndex }),
      );
    g.rules.push(r);
    g.first = Math.min(g.first, r.sourceIndex);
  }
  return [...groups.values()]
    .sort((a, b) =>
      a.source === INLINE_SOURCE ? -1 : b.source === INLINE_SOURCE ? 1 : a.first - b.first,
    )
    .map(({ source, name, rules }) => ({ source, name, rules }));
}

/** Key of one declaration in `overriddenDecls`: the rule's index in the list and the property. */
export const declKey = (ruleIndex: number, property: string) => `${ruleIndex}:${property}`;

/**
 * Declarations that lose the cascade: per property the winner is `!important` first, then inline
 * style, then score, then later source. Rules whose media does not hold neither win nor lose.
 */
export function overriddenDecls(rules: MatchedRule[]): Set<string> {
  const rank = (r: MatchedRule, important: boolean): [number, number, number] => [
    important ? 1 : 0,
    r.score,
    r.sourceIndex,
  ];
  const better = (a: number[], b: number[]) => a[0]! - b[0]! || a[1]! - b[1]! || a[2]! - b[2]!;
  const winner = new Map<string, { key: string; rank: number[] }>();
  const all: { key: string; property: string }[] = [];
  rules.forEach((r, i) => {
    if (!r.mediaActive) return;
    for (const d of r.declarations) {
      const key = declKey(i, d.property);
      const p = d.property.toLowerCase();
      all.push({ key, property: p });
      const rk = rank(r, d.important);
      const w = winner.get(p);
      if (!w || better(rk, w.rank) >= 0) winner.set(p, { key, rank: rk });
    }
  });
  return new Set(all.filter((d) => winner.get(d.property)?.key !== d.key).map((d) => d.key));
}

/** Properties children take from ancestors; inherited rules only matter for these. */
const INHERITED =
  /^(--|color$|font|line-height$|letter-spacing$|word-spacing$|text-(align|indent|transform|shadow|decoration-color)|white-space$|visibility$|cursor$|direction$|quotes$|list-style|tab-size$|hyphens$|writing-mode$)/;
export const inheritedProperty = (p: string): boolean => INHERITED.test(p.toLowerCase());
