import { expect, it } from 'vitest';
import { specificity, splitState } from './specificity';

it.each([
  ['#a .b p', [1, 1, 1], 10101],
  [':not(#x) a:hover', [1, 1, 1], 10101],
  ['::before', [0, 0, 1], 1],
  [':where(.a) b', [0, 0, 1], 1],
  [':is(.a, #b) > li', [1, 0, 1], 10001],
  ['a:before', [0, 0, 2], 2],
  ['input[type="text"]', [0, 1, 1], 101],
  ['*', [0, 0, 0], 0],
  ['.a, #b', [1, 0, 0], 10000],
])('%s → %j', (sel, array, score) => {
  expect(specificity(sel)).toEqual({ array, score });
});

it('finds the state and pseudo-element of the subject compound', () => {
  expect(splitState('.a:hover')).toEqual({ state: ':hover', pseudoElement: null });
  expect(splitState('.a:hover .b')).toEqual({ state: null, pseudoElement: null });
  expect(splitState('.a:focus-visible')).toEqual({ state: ':focus-visible', pseudoElement: null });
  expect(splitState('p:before')).toEqual({ state: null, pseudoElement: '::before' });
  expect(splitState('input::placeholder')).toEqual({ state: null, pseudoElement: '::placeholder' });
});
