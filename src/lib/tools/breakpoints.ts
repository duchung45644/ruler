export type Breakpoint = { width: number; kind: 'min' | 'max' | 'both' };

/** Port of getPageBreakpoints (legacy-src/content.js:48891): grouped by Math.round across kinds. */
export function parseBreakpoints(conditions: string[]): Breakpoint[] {
  const groups = new Map<number, { min: number; max: number }>(); // rawMin / rawMax per rounded width
  const add = (kind: 'min' | 'max', num: string, unit: string) => {
    const v = parseFloat(num) * (unit === 'px' ? 1 : 16);
    let g = groups.get(Math.round(v));
    if (!g) groups.set(Math.round(v), (g = { min: Infinity, max: -Infinity }));
    if (kind === 'min') g.min = Math.min(g.min, v);
    else g.max = Math.max(g.max, v);
  };
  const n = String.raw`([\d.]+)(px|em|rem)`;
  for (const c of conditions) {
    for (const [, kind, num, unit] of c.matchAll(
      new RegExp(String.raw`(min|max)-width:\s*${n}`, 'g'),
    ))
      add(kind as 'min' | 'max', num!, unit!);
    // range syntax (Tailwind v4): `width >= 40rem`, `width < 48rem`, `40rem <= width`
    for (const [, op, num, unit] of c.matchAll(
      new RegExp(String.raw`\bwidth\s*([<>]=?)\s*${n}`, 'g'),
    ))
      add(op!.startsWith('>') ? 'min' : 'max', num!, unit!);
    for (const [, num, unit, op] of c.matchAll(
      new RegExp(String.raw`${n}\s*([<>]=?)\s*width\b`, 'g'),
    ))
      add(op!.startsWith('<') ? 'min' : 'max', num!, unit!);
  }
  const out = new Map<number, Breakpoint['kind']>();
  for (const g of groups.values()) {
    const hasMin = g.min !== Infinity;
    const w = hasMin ? Math.ceil(g.min) : Math.floor(g.max);
    const kind = hasMin ? (g.max !== -Infinity ? 'both' : 'min') : 'max';
    const prev = out.get(w);
    out.set(w, prev && prev !== kind ? 'both' : kind);
  }
  return [...out].map(([width, kind]) => ({ width, kind })).sort((a, b) => a.width - b.width);
}

/**
 * Media conditions of every readable sheet. A cross-origin sheet (cssRules throws) is read from
 * `copyOf` when we fetched one, else its href goes to `blocked`.
 */
export function mediaConditions(
  roots: (Document | ShadowRoot)[],
  copyOf: (href: string | null) => CSSStyleSheet | undefined = () => undefined,
  blocked: string[] = [],
): string[] {
  const out: string[] = [];
  // @media can sit inside @layer / @supports / nested style rules (Tailwind v4 does all three)
  const walk = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSMediaRule) out.push(rule.conditionText);
      const inner = (rule as CSSGroupingRule).cssRules;
      if (inner?.length) walk(inner);
    }
  };
  const read = (sheet: CSSStyleSheet) => walk(sheet.cssRules);
  for (const r of roots)
    for (const sheet of [...r.styleSheets, ...(r.adoptedStyleSheets ?? [])]) {
      try {
        read(sheet);
      } catch {
        const copy = copyOf(sheet.href);
        if (copy) read(copy);
        else if (sheet.href) blocked.push(sheet.href);
      }
    }
  return out;
}

/** Port of xv (legacy-src/content.js:26709). */
export const breakpointLabel = (b: Breakpoint): string =>
  `${b.kind === 'min' ? '≥' : b.kind === 'max' ? '≤' : ''}${b.width}px`;
