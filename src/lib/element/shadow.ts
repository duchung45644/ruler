import type { Shadow } from './types';
import { splitTopLevel } from './style';

const LENGTH = /^-?[\d.]/;

/** Tokens separated by spaces outside parentheses. */
function tokens(s: string): string[] {
  const out: string[] = [];
  let cur = '';
  let depth = 0;
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (cur) out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/** Port of `H` (content.js:40444) plus a split of each layer into its parts (6.31). */
export function splitShadows(boxShadow: string): Shadow[] {
  if (!boxShadow || boxShadow === 'none') return [];
  return splitTopLevel(boxShadow)
    .filter((raw) => raw !== 'none')
    .map((raw) => {
      const t = tokens(raw);
      const lengths = t.filter((x) => LENGTH.test(x));
      const color = t.filter((x) => x !== 'inset' && !LENGTH.test(x)).join(' ');
      return {
        inset: t.includes('inset'),
        x: lengths[0] ?? '0',
        y: lengths[1] ?? '0',
        blur: lengths[2] ?? '0',
        spread: lengths[3] ?? '0',
        color: color || 'currentcolor',
        raw,
      };
    });
}
