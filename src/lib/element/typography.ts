import type { TypographyStyle } from './types';
import type { StyleLike } from './style';

/** First family of a stack, unquoted. */
export const firstFamily = (stack: string): string =>
  (stack.split(',')[0] ?? '').replace(/['"]/g, '').trim();

/** Grouping key of getElementTypography (content.js:41604); null for text without a size. */
export function typographyKey(family: string, style: StyleLike): string | null {
  const size = parseFloat(style.getPropertyValue('font-size'));
  if (!size || size <= 0) return null;
  const g = (p: string) => style.getPropertyValue(p);
  return `${firstFamily(family)}|${size}|${g('font-weight')}|${g('letter-spacing')}|${g('text-transform')}`;
}

/**
 * Port of getElementTypography (content.js:41584) over pre-filtered text elements: one entry per
 * key with a usage count, biggest size then heaviest weight first.
 */
export function typographyStyles(items: { style: StyleLike; family: string }[]): TypographyStyle[] {
  const byKey = new Map<string, TypographyStyle>();
  for (const { style, family } of items) {
    const key = typographyKey(family, style);
    if (!key) continue;
    const hit = byKey.get(key);
    if (hit) {
      hit.usage++;
      continue;
    }
    const g = (p: string) => style.getPropertyValue(p);
    byKey.set(key, {
      fontFamily: firstFamily(family),
      fontStack: g('font-family'),
      fontSize: g('font-size'),
      fontWeight: g('font-weight'),
      letterSpacing: g('letter-spacing') !== 'normal' ? g('letter-spacing') || null : null,
      textTransform: g('text-transform') !== 'none' ? g('text-transform') || null : null,
      typographyKey: key,
      usage: 1,
    });
  }
  const weight = (t: TypographyStyle) => parseFloat(t.fontWeight) || 400;
  return [...byKey.values()].sort(
    (a, b) => parseFloat(b.fontSize) - parseFloat(a.fontSize) || weight(b) - weight(a),
  );
}
