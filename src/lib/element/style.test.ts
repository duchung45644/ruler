import { expect, it } from 'vitest';
import { hexOf, splitTopLevel } from './style';

it('splits on top-level commas only', () => {
  expect(splitTopLevel('rgb(1, 2, 3) 0 0 4px, red 1px 1px')).toEqual([
    'rgb(1, 2, 3) 0 0 4px',
    'red 1px 1px',
  ]);
  expect(splitTopLevel('')).toEqual([]);
});

it('normalises colours to upper-case HEX, transparent to null', () => {
  expect(hexOf('rgb(255, 0, 0)')).toBe('#FF0000');
  expect(hexOf('rgba(0, 0, 0, 0)')).toBeNull();
  expect(hexOf('nonsense')).toBeNull();
});
