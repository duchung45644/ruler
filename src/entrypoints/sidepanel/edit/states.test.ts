import { expect, it } from 'vitest';
import { toggleState } from './states';

it('toggles one state and keeps the canonical order', () => {
  expect(toggleState([':active'], ':hover')).toEqual([':hover', ':active']);
  expect(toggleState([':hover', ':active'], ':hover')).toEqual([':active']);
  expect(toggleState([], ':nope')).toEqual([]);
});
