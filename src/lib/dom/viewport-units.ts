/**
 * Full-page capture makes the viewport as tall as the page, so anything sized in viewport units
 * (`min-height: 100vh`, Tailwind `min-h-screen`, `h-dvh`…) would grow with it. Before that, pin those
 * elements at their current pixel size; the returned function puts their inline styles back.
 */
import { cssRulesOf } from '../css/matched';

const PROPS = ['height', 'min-height', 'max-height'] as const;
/** vh, svh, lvh, dvh, vb and vmin / vmax (they follow the height too). */
const VIEWPORT_UNIT = /\d(?:\.\d+)?(?:[sld]?v(?:h|b|min|max))\b/i;

type Prop = (typeof PROPS)[number];

/** Selector → viewport-unit properties, from every readable rule (nested @media/@layer too). */
function collect(rules: CSSRuleList, selector: string | null, out: Map<string, Set<Prop>>): void {
  for (const rule of rules) {
    const own = rule instanceof CSSStyleRule ? rule.selectorText : selector;
    const style = (rule as CSSStyleRule).style as CSSStyleDeclaration | undefined;
    if (own && style)
      for (const p of PROPS)
        if (VIEWPORT_UNIT.test(style.getPropertyValue(p))) {
          if (!out.has(own)) out.set(own, new Set());
          out.get(own)!.add(p);
        }
    const inner = (rule as CSSGroupingRule).cssRules;
    if (inner?.length) collect(inner, own, out);
  }
}

export function pinViewportUnits(roots: (Document | ShadowRoot)[]): () => void {
  const pinned = new Map<HTMLElement, Set<Prop>>();
  const add = (el: Element, props: Iterable<Prop>) => {
    if (!(el instanceof HTMLElement)) return;
    const set = pinned.get(el) ?? new Set<Prop>();
    for (const p of props) set.add(p);
    pinned.set(el, set);
  };
  for (const root of roots) {
    const bySelector = new Map<string, Set<Prop>>();
    for (const sheet of [...root.styleSheets, ...(root.adoptedStyleSheets ?? [])]) {
      const rules = cssRulesOf(sheet); // null: cross-origin, skipped
      if (rules) collect(rules, null, bySelector);
    }
    for (const [sel, props] of bySelector) {
      try {
        root.querySelectorAll(sel).forEach((el) => add(el, props));
      } catch {
        // a selector the engine can't query (nested `&`, unknown pseudo): skipped
      }
    }
    root.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
      const props = PROPS.filter((p) => VIEWPORT_UNIT.test(el.style.getPropertyValue(p)));
      if (props.length) add(el, props);
    });
  }

  const saved: [HTMLElement, Prop, string, string][] = [];
  for (const [el, props] of pinned) {
    const cs = getComputedStyle(el);
    // read every size first, then write: writing one could reflow the next
    const px = [...props].map((p) => [p, cs.getPropertyValue(p)] as const);
    for (const [p, v] of px) {
      if (!v || v === 'none' || v === 'auto') continue;
      saved.push([el, p, el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]);
      el.style.setProperty(p, v, 'important');
    }
  }
  return () => {
    for (const [el, p, v, prio] of saved.reverse()) {
      if (v) el.style.setProperty(p, v, prio);
      else el.style.removeProperty(p);
    }
  };
}
