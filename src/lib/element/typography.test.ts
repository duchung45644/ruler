import { expect, it } from 'vitest';
import { styleOf } from './style';
import { typographyKey, typographyStyles } from './typography';

const s = (size: string, weight = '400') =>
  styleOf({
    'font-family': '"Inter", sans-serif',
    'font-size': size,
    'font-weight': weight,
    'letter-spacing': 'normal',
    'text-transform': 'none',
  });

it('groups by key with usage, biggest then heaviest first', () => {
  const out = typographyStyles([
    { style: s('14px'), family: 'Inter' },
    { style: s('14px'), family: 'Inter' },
    { style: s('20px'), family: 'Inter' },
    { style: s('14px', '700'), family: 'Inter' },
  ]);
  expect(out.map((t) => [t.fontSize, t.fontWeight, t.usage])).toEqual([
    ['20px', '400', 1],
    ['14px', '700', 1],
    ['14px', '400', 2],
  ]);
  expect(out[0]!.letterSpacing).toBeNull();
  expect(typographyKey('"Inter", x', s('14px'))).toBe('Inter|14|400|normal|none');
  expect(typographyKey('Inter', s('0px'))).toBeNull();
});
