/** CSS variables section: read the page's :root custom properties, set one as an inline edit. */
import { cssRulesOf, sheetsOf } from '../../lib/css/matched';
import { customProps, isRootSelector, type CssVar } from '../../lib/css/variables';

const MAX_VARS = 2000;

/** Names declared on :root / html in readable sheets (inside @media / @layer / @import too) and inline. */
function rootVarNames(): Set<string> {
  const names = new Set<string>();
  const walk = (rules: CSSRuleList | null) => {
    if (!rules) return;
    for (const r of rules) {
      if (names.size >= MAX_VARS) return;
      if (r instanceof CSSStyleRule && isRootSelector(r.selectorText))
        for (const n of customProps(r.style)) names.add(n);
      if ('cssRules' in r) walk((r as CSSGroupingRule).cssRules);
      else if ('styleSheet' in r && r.styleSheet) walk(cssRulesOf(r.styleSheet as CSSStyleSheet));
    }
  };
  for (const { sheet } of sheetsOf(document)) walk(cssRulesOf(sheet));
  for (const n of customProps(document.documentElement.style)) names.add(n);
  return names;
}

/** All reads, then one computed style: no writes in between. */
export function rootVariables(): CssVar[] {
  const names = rootVarNames();
  const cs = getComputedStyle(document.documentElement);
  return [...names]
    .map((name) => ({ name, value: cs.getPropertyValue(name).trim() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
