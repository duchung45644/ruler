import type { Shadow } from './types';
import { splitTop } from '../css/specificity';

const LENGTH = /^-?[\d.]/;

/** Port of `H` (content.js:40444) plus a split of each layer into its parts (6.31). */
export function splitShadows(boxShadow: string): Shadow[] {
  if (!boxShadow || boxShadow === 'none') return [];
  return splitTop(boxShadow, ',')
    .filter((raw) => raw !== 'none')
    .map((raw) => {
      const t = splitTop(raw, ' ');
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
