import { expect, it } from 'vitest';
import { splitShadows } from './shadow';

it('splits layers into inset, lengths and colour', () => {
  expect(splitShadows('inset 0 1px 2px rgba(0,0,0,.2), 0 0 0 1px red')).toMatchObject([
    { inset: true, x: '0', y: '1px', blur: '2px', spread: '0', color: 'rgba(0,0,0,.2)' },
    { inset: false, spread: '1px', color: 'red' },
  ]);
  expect(splitShadows('none')).toEqual([]);
});
