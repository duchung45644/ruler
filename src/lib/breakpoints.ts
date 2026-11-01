export type Breakpoint = { width: number; kind: 'min' | 'max' | 'both' };

/**
 * Port of getPageBreakpoints (legacy-src/content.js:48891). Deviation: values are grouped per kind
 * before rounding, so 768 min + 767.98 max stay two lines (legacy merged them into one `both`).
 */
export function parseBreakpoints(conditions: string[]): Breakpoint[] {
  const raw = new Map<string, number>(); // `${kind}:${round}` → min rawMin / max rawMax
  for (const c of conditions)
    for (const [, kind, num, unit] of c.matchAll(/(min|max)-width:\s*([\d.]+)(px|em|rem)/g)) {
      const v = parseFloat(num!) * (unit === 'px' ? 1 : 16);
      const k = `${kind}:${Math.round(v)}`;
      const prev = raw.get(k);
      raw.set(k, prev === undefined ? v : kind === 'min' ? Math.min(prev, v) : Math.max(prev, v));
    }
  const out = new Map<number, Breakpoint['kind']>();
  for (const [k, v] of raw) {
    const kind = k.startsWith('min') ? 'min' : 'max';
    const w = kind === 'min' ? Math.ceil(v) : Math.floor(v);
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
