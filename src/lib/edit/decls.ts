/** CSS declaration text <-> list, used by rule edits, inline style edits and merges. */

export interface Decl {
  property: string;
  value: string;
  important: boolean;
}

/** Splits on top-level `sep`, ignoring it inside parentheses, strings and comments. */
function splitDecls(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let cur = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quote) {
      cur += c;
      if (c === '\\') cur += text[++i] ?? '';
      else if (c === quote) quote = '';
    } else if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end < 0 ? text.length : end + 1;
    } else if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if (c === '(') {
      depth++;
      cur += c;
    } else if (c === ')') {
      depth = Math.max(0, depth - 1);
      cur += c;
    } else if (c === ';' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/** One declaration: custom properties keep their case, a trailing !important becomes the flag. */
export function toDecl(property: string, raw: string): Decl {
  property = property.trim();
  if (!property.startsWith('--')) property = property.toLowerCase();
  let value = raw.trim();
  const imp = /\s*!\s*important\s*$/i.exec(value);
  if (imp) value = value.slice(0, imp.index).trim();
  return { property, value, important: !!imp };
}

export function parseDecls(text: string): Decl[] {
  const out: Decl[] = [];
  for (const part of splitDecls(text)) {
    const colon = part.indexOf(':');
    if (colon < 0 || !part.slice(0, colon).trim()) continue;
    out.push(toDecl(part.slice(0, colon), part.slice(colon + 1)));
  }
  return out;
}

export const serializeDecls = (d: Decl[]): string =>
  d.map((x) => `${x.property}: ${x.value}${x.important ? ' !important' : ''};`).join(' ');

/** Patch wins per property; an empty value removes the property. */
export function mergeDecls(base: Decl[], patch: Decl[]): Decl[] {
  const out = base.map((d) => ({ ...d }));
  for (const p of patch) {
    const i = out.findIndex((d) => d.property === p.property);
    if (!p.value.trim()) {
      if (i >= 0) out.splice(i, 1);
    } else if (i >= 0) out[i] = { ...p };
    else out.push({ ...p });
  }
  return out;
}
