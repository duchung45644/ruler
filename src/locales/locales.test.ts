import { describe, expect, it } from 'vitest';
import en from './en.json';
import vi from './vi.json';

const keys = (o: object, p = ''): string[] =>
  Object.entries(o)
    .flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]))
    .sort();

describe('locales', () => {
  it('vi có đúng bộ khoá của en', () => {
    expect(keys(vi)).toEqual(keys(en));
  });
  it('en có các khoá manifest dùng', () => {
    expect(keys(en)).toEqual(
      expect.arrayContaining([
        'extName',
        'extNameShort',
        'extDescription',
        'cmdSelectParent',
        'cmdSelectChild',
      ]),
    );
  });
});
