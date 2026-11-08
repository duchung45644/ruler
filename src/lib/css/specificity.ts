import { STATE_TESTS } from './states';

export type Specificity = [number, number, number];

/** Split at top-level occurrences of `sep` (outside brackets and quotes). */
export function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && c === sep) {
      out.push(s.slice(start, i));
      start = i + 1;
    }
  }
  out.push(s.slice(start));
  return out.map((p) => p.trim()).filter(Boolean);
}

const LEGACY_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);
const ZERO: Specificity = [0, 0, 0];
const add = (a: Specificity, b: Specificity): Specificity => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
const cmp = (a: Specificity, b: Specificity) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const max = (list: Specificity[]) => list.reduce((m, s) => (cmp(s, m) > 0 ? s : m), ZERO);

/** Index just past the `)` matching the `(` at `open`. */
function closeParen(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0) return i + 1;
  }
  return s.length;
}

/** One complex selector (no top-level commas), Selectors 4 rules. */
function complex(sel: string): Specificity {
  let s: Specificity = [0, 0, 0];
  let i = 0;
  const ident = () => {
    const m = /^(?:\\.|[\w\-\u00a0-\uffff])+/.exec(sel.slice(i));
    i += m ? m[0].length : 1;
    return m ? m[0] : '';
  };
  while (i < sel.length) {
    const c = sel[i]!;
    if (c === '#') {
      i++;
      ident();
      s = add(s, [1, 0, 0]);
    } else if (c === '.') {
      i++;
      ident();
      s = add(s, [0, 1, 0]);
    } else if (c === '[') {
      let depth = 0;
      for (; i < sel.length; i++) {
        if (sel[i] === '[') depth++;
        else if (sel[i] === ']' && --depth === 0) break;
      }
      i++;
      s = add(s, [0, 1, 0]);
    } else if (c === ':') {
      const element = sel[i + 1] === ':';
      i += element ? 2 : 1;
      const name = ident().toLowerCase();
      let arg: string | null = null;
      if (sel[i] === '(') {
        const end = closeParen(sel, i);
        arg = sel.slice(i + 1, end - 1);
        i = end;
      }
      if (element || LEGACY_ELEMENTS.has(name)) {
        s = add(s, [0, 0, 1]);
        if (arg !== null && (name === 'slotted' || name === 'part'))
          s = add(s, specificity(arg).array);
      } else if (name === 'where') {
        // contributes nothing
      } else if (name === 'is' || name === 'not' || name === 'has' || name === 'matches') {
        s = add(s, specificity(arg ?? '').array);
      } else if ((name === 'nth-child' || name === 'nth-last-child') && arg && / of /i.test(arg)) {
        s = add(add(s, [0, 1, 0]), specificity(arg.split(/ of /i)[1]!).array);
      } else if ((name === 'host' || name === 'host-context') && arg !== null) {
        s = add(add(s, [0, 1, 0]), specificity(arg).array);
      } else s = add(s, [0, 1, 0]);
    } else if (c === '*' || c === '&' || /[\s>+~|]/.test(c)) i++;
    else if (/[\w\-\\\u00a0-\uffff]/.test(c)) {
      ident();
      s = add(s, [0, 0, 1]);
    } else i++;
  }
  return s;
}

/**
 * Port of calculateSpecificityOnce: [ids, classes, types] and legacy's score (10000·A + 100·B +
 * C). A list takes its most specific alternative; `:is()` / `:not()` / `:has()` their most
 * specific argument, `:where()` nothing.
 */
export function specificity(sel: string): { array: Specificity; score: number } {
  const array = max(splitTop(sel, ',').map(complex));
  return { array, score: 10000 * array[0] + 100 * array[1] + array[2] };
}

const PSEUDO_ELEMENT =
  /::?(?:before|after|first-line|first-letter)(?![\w-])|::(?:placeholder|selection|marker|backdrop|file-selector-button)(?![\w-])/;

/** The last compound selector (legacy Yg). */
function lastCompound(sel: string): string {
  let depth = 0;
  for (let n = sel.length - 1; n >= 0; n--) {
    const c = sel[n]!;
    if (c === ')' || c === ']') depth++;
    else if (c === '(' || c === '[') depth--;
    else if (depth === 0 && ' >+~'.includes(c)) return sel.slice(n + 1);
  }
  return sel;
}

/** Port of Jg: the user-action state and pseudo-element on the subject compound. */
export function splitState(sel: string): { state: string | null; pseudoElement: string | null } {
  const last = lastCompound(sel || '');
  const state = STATE_TESTS.find(([, re]) => re.test(last))?.[0] ?? null;
  const m = PSEUDO_ELEMENT.exec(last);
  return { state, pseudoElement: m ? m[0].replace(/^::?/, '::') : null };
}
