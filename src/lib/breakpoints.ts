export type Breakpoint = { width: number; kind: 'min' | 'max' | 'both' };

/** Port of getPageBreakpoints (legacy-src/content.js:48891): grouped by Math.round across kinds. */
export function parseBreakpoints(conditions: string[]): Breakpoint[] {
  const groups = new Map<number, { min: number; max: number }>(); // rawMin / rawMax per rounded width
  for (const c of conditions)
    for (const [, kind, num, unit] of c.matchAll(/(min|max)-width:\s*([\d.]+)(px|em|rem)/g)) {
      const v = parseFloat(num!) * (unit === 'px' ? 1 : 16);
      let g = groups.get(Math.round(v));
      if (!g) groups.set(Math.round(v), (g = { min: Infinity, max: -Infinity }));
      if (kind === 'min') g.min = Math.min(g.min, v);
      else g.max = Math.max(g.max, v);
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

/** Media conditions of every readable sheet; cross-origin sheets (cssRules throws) are skipped. */
export function mediaConditions(roots: (Document | ShadowRoot)[]): string[] {
  const out: string[] = [];
  for (const r of roots)
    for (const sheet of [...r.styleSheets, ...(r.adoptedStyleSheets ?? [])]) {
      try {
        for (const rule of sheet.cssRules)
          if (rule instanceof CSSMediaRule) out.push(rule.conditionText);
      } catch {
        /* SecurityError: cross-origin sheet */
      }
    }
  return out;
}

/** Port of xv (legacy-src/content.js:26709). */
export const breakpointLabel = (b: Breakpoint): string =>
  `${b.kind === 'min' ? '≥' : b.kind === 'max' ? '≤' : ''}${b.width}px`;
