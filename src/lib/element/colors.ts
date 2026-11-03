import type { ElementColors } from './types';
import { hexOf, type StyleLike } from './style';

const COLOR_FN = /(?:rgba?|oklab|oklch|lab|lch|hwb|color)\([^)]+\)/g;
const SIDES = ['top', 'right', 'bottom', 'left'];

/**
 * One element's share of getSelectionColors (content.js:41459): text colour, background colour
 * plus gradient stop colours, and border colours that differ from the text colour.
 */
export function colorsOf(style: StyleLike): ElementColors {
  const text = hexOf(style.getPropertyValue('color'));
  const backgrounds: string[] = [];
  const bg = hexOf(style.getPropertyValue('background-color'));
  if (bg) backgrounds.push(bg);
  const image = style.getPropertyValue('background-image');
  if (/(?:linear|radial|conic)-gradient/.test(image))
    for (const m of image.match(COLOR_FN) ?? []) {
      const c = hexOf(m);
      if (c) backgrounds.push(c);
    }
  const borders: string[] = [];
  for (const side of SIDES) {
    const c = hexOf(style.getPropertyValue(`border-${side}-color`));
    if (c && c !== text) borders.push(c);
  }
  return { text: text ? [text] : [], backgrounds, borders };
}

/** Merge per-element colours, first occurrence wins the order (6.28). */
export function elementColors(entries: ElementColors[]): ElementColors {
  const merge = (pick: (e: ElementColors) => string[]) => [...new Set(entries.flatMap(pick))];
  return {
    text: merge((e) => e.text),
    backgrounds: merge((e) => e.backgrounds),
    borders: merge((e) => e.borders),
  };
}
