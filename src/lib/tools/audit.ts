import { parseColor, toHex } from '../style/color';

/** Page styles audit (3.19), port of scanPage in unpacked/scripts/bd/audit.js. */
export type AuditRow = {
  key: string;
  els: Set<Element>;
  uses?: Set<string>;
  variants?: Set<string>;
  size?: number;
};

const SKIP = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'META', 'LINK', 'BR'];
const SPACING = [
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'rowGap',
  'columnGap',
] as const;

/** Uppercase HEX; null when unparsable or fully transparent (legacy toHex). */
function hex(css: string): string | null {
  const c = parseColor(css);
  return c && c.a > 0 ? toHex(c).toUpperCase() : null;
}

const round = (v: number, f: number) => Math.round(v * f) / f;

export function scanStyles(
  root: Element,
  isOwn: (el: Element) => boolean,
  limit = 8000,
): { colors: AuditRow[]; fonts: AuditRow[]; spacing: AuditRow[] } {
  const colors = new Map<string, AuditRow>();
  const fonts = new Map<string, AuditRow>();
  const spacing = new Map<string, AuditRow>();
  const color = (css: string, el: Element, use: string) => {
    const k = hex(css);
    if (!k) return;
    let v = colors.get(k);
    if (!v) colors.set(k, (v = { key: k, els: new Set(), uses: new Set() }));
    v.els.add(el);
    v.uses!.add(use);
  };
  const body = root.ownerDocument.body;
  const all = body ? [root, body, ...body.getElementsByTagName('*')] : [];
  const owned = (el: Element) => {
    for (let n: Element | null = el; n; n = n.parentElement) if (isOwn(n)) return true;
    return false;
  };
  let n = 0;
  for (const el of all) {
    if (n++ > limit) break;
    if (SKIP.includes(el.tagName) || owned(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if ([...el.childNodes].some((c) => c.nodeType === 3 && c.textContent?.trim())) {
      color(cs.color, el, 'text');
      const fam = (cs.fontFamily.split(',')[0] ?? '').replace(/["']/g, '').trim();
      const size = round(parseFloat(cs.fontSize), 100);
      const lh =
        cs.lineHeight === 'normal' ? 'normal' : `${round(parseFloat(cs.lineHeight), 100)}px`;
      let f = fonts.get(fam);
      if (!f) fonts.set(fam, (f = { key: fam, els: new Set(), size: 0, variants: new Set() }));
      f.els.add(el);
      f.variants!.add(`${size}px / ${cs.fontWeight} / ${lh}`);
      f.size = Math.max(f.size!, size || 0);
    }
    color(cs.backgroundColor, el, 'bg');
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none')
      color(cs.borderTopColor, el, 'border');
    if (el instanceof SVGElement)
      for (const p of ['fill', 'stroke'] as const)
        if (cs[p]?.startsWith('rgb')) color(cs[p], el, p);
    for (const p of SPACING) {
      const v = parseFloat(cs[p]);
      if (!(v > 0)) continue;
      const k = String(round(v, 10));
      let s = spacing.get(k);
      if (!s) spacing.set(k, (s = { key: k, els: new Set() }));
      s.els.add(el);
    }
  }
  return {
    colors: [...colors.values()].sort((a, b) => b.els.size - a.els.size),
    fonts: [...fonts.values()].sort((a, b) => b.size! - a.size! || b.els.size - a.els.size),
    spacing: [...spacing.values()].sort((a, b) => Number(a.key) - Number(b.key)),
  };
}

export const offGrid = (rows: AuditRow[]): number =>
  rows.filter((r) => Number(r.key) % 4 !== 0).length;
