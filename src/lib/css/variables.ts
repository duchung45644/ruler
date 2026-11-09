/** Page custom properties (`--*`) defined on :root / html, for the CSS variables section. */
import { parseColor } from '../style/color';

export interface CssVar {
  name: string;
  /** Computed on the root element: what the page uses now. */
  value: string;
}

export interface VarGroup {
  name: string;
  vars: CssVar[];
}

/** Enough of CSSStyleDeclaration to list its properties. */
export interface DeclList {
  length: number;
  item(i: number): string;
}

const ROOT_PART = /^(?:html)?(?::root)?$|^:where\(\s*:root\s*\)$/i;

/** `:root`, `html`, `html:root`, or a list that holds one of them. */
export const isRootSelector = (selector: string): boolean =>
  selector.split(',').some((p) => {
    const s = p.trim();
    return s !== '' && ROOT_PART.test(s);
  });

/** Custom property names declared in `style`, in order. */
export function customProps(style: DeclList): string[] {
  const out: string[] = [];
  for (let i = 0; i < style.length; i++) {
    const p = style.item(i);
    if (p.startsWith('--')) out.push(p);
  }
  return out;
}

/** `--color-primary-500` → `color`; one-word names share the `other` group (key ''). */
export function groupKey(name: string): string {
  const body = name.replace(/^--/, '');
  const dash = body.search(/[-_]/);
  return dash > 0 ? body.slice(0, dash).toLowerCase() : '';
}

/** Groups by name prefix; a prefix used once falls into the '' group. Groups sorted, '' last. */
export function groupVars(vars: CssVar[]): VarGroup[] {
  const by = new Map<string, CssVar[]>();
  for (const v of vars) {
    const k = groupKey(v.name);
    by.set(k, [...(by.get(k) ?? []), v]);
  }
  const other = by.get('') ?? [];
  const groups: VarGroup[] = [];
  for (const [name, list] of by) {
    if (!name) continue;
    if (list.length > 1) groups.push({ name, vars: list });
    else other.push(...list);
  }
  groups.sort((a, b) => a.name.localeCompare(b.name));
  if (other.length) groups.push({ name: '', vars: other });
  return groups;
}

export function filterVars(vars: CssVar[], query: string): CssVar[] {
  const q = query.trim().toLowerCase();
  if (!q) return vars;
  return vars.filter((v) => v.name.toLowerCase().includes(q) || v.value.toLowerCase().includes(q));
}

const COLOR_FN = /^(?:hsla?|hwb|color-mix|light-dark)\(/i;

/** Whether a swatch makes sense; `supports` (CSS.supports in a page) catches named colours. */
export function isColorValue(
  value: string,
  supports: (v: string) => boolean = () => false,
): boolean {
  const v = value.trim();
  if (!v || v.startsWith('var(')) return false;
  if (/^[\d.-]/.test(v)) return false; // numbers and lengths: `0` is a valid nothing, not a colour
  return parseColor(v) !== null || COLOR_FN.test(v) || supports(v);
}

/** Valid custom property name (what setProperty accepts). */
export const isVarName = (name: string): boolean => /^--[\w-]+$/.test(name);

const CLOSE: Record<string, string> = { '(': ')', '[': ']', '{': '}' };

/**
 * A value that stays one declaration inside a `style` attribute: brackets balanced, strings and
 * comments closed, no `;` or `!` outside a string or
 * parentheses. Rejected rather than rewritten, so a data URL or
 * quoted `;` keeps its meaning.
 */
export function isVarValue(value: string): boolean {
  const stack: string[] = [];
  for (let i = 0; i < value.length; i++) {
    const c = value[i]!;
    if (c === '"' || c === "'") {
      for (i++; i < value.length && value[i] !== c; i++) {
        if (value[i] === '\\') i++;
        else if (value[i] === '\n') return false;
      }
      if (i >= value.length) return false;
    } else if (c === '/' && value[i + 1] === '*') {
      const end = value.indexOf('*/', i + 2);
      if (end < 0) return false;
      i = end + 1;
    } else if (c === '\\') i++;
    else if (CLOSE[c]) stack.push(CLOSE[c]);
    else if (c === ')' || c === ']' || c === '}') {
      if (stack.pop() !== c) return false;
    } else if ((c === ';' || c === '!') && stack.at(-1) !== ')') return false;
  }
  return stack.length === 0;
}
