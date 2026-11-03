import type { MatchedRule } from '../element/types';
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
    let rules: CSSRuleList;
    try {
      rules = s.sheet.cssRules;
    } catch {
      onBlocked?.(s);
      return;
    }
    walk(rules, s.source, wrappers, on);
  };
  for (const s of sheets) visit(s, [], true);
  return out;
}

/** Declarations as written (shorthands kept), from the rule's cssText. */
export function declarations(style: CSSStyleDeclaration): MatchedRule['declarations'] {
  return splitTop(style.cssText, ';').flatMap((d) => {
    const colon = d.indexOf(':');
    if (colon < 0) return [];
    let value = d.slice(colon + 1).trim();
    const important = /!\s*important$/i.test(value);
    if (important) value = value.replace(/\s*!\s*important$/i, '');
    return [{ property: d.slice(0, colon).trim(), value, important }];
  });
}

const safeMatches = (el: Element, sel: string) => {
  try {
    return el.matches(sel);
  } catch {
    return false;
  }
};

/**
 * Port of getAppliedRules, read-only: rules whose selector matches `el` itself (pseudo-element and
 * user-action-state alternatives left out), the most specific matching alternative scoring each.
 * Sorted by score, then later source first; inline style leads when present.
 */
export function matchedRules(el: Element, rules: KnownRule[]): MatchedRule[] {
  const out: MatchedRule[] = [];
  for (const k of rules) {
    let best: ReturnType<typeof specificity> | null = null;
    for (const alt of splitTop(k.rule.selectorText, ',')) {
      const { state, pseudoElement } = splitState(alt);
      if (state || pseudoElement || !safeMatches(el, alt)) continue;
      const s = specificity(alt);
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
      declarations: declarations(k.rule.style),
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
      declarations: declarations(inline),
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
