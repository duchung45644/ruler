import { expect, it } from 'vitest';
import { lineDiff, whitespaceOnly } from './diff';

it('diffs by line', () => {
  expect(lineDiff('a\nb', 'a\nc')).toEqual([
    { kind: '=', text: 'a', line: 1 },
    { kind: '-', text: 'b', line: 2 },
    { kind: '+', text: 'c', line: 2 },
  ]);
  expect(lineDiff('x', 'x\ny').map((d) => d.kind)).toEqual(['=', '+']);
});

it('detects whitespace-only changes', () => {
  expect(whitespaceOnly('a {x}', 'a{ x }')).toBe(true);
  expect(whitespaceOnly('a', 'a')).toBe(false);
  expect(whitespaceOnly('a{x}', 'a{y}')).toBe(false);
});
