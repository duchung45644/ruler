import { expect, it } from 'vitest';
import { rewriteForState, statesInSelector } from './states';

it('finds states without prefix collisions', () => {
  expect(statesInSelector('.btn:hover > span:focus-visible')).toEqual([':hover', ':focus-visible']);
  expect(statesInSelector('[title=":hover"] a')).toEqual([]);
});

it('rewrites a state to the force attribute', () => {
  expect(rewriteForState('a:hover, b:hover:focus', ':hover', 'x')).toBe(
    'a[data-sr-force-hover-x], b[data-sr-force-hover-x]:focus',
  );
  expect(rewriteForState('a:focus-visible', ':focus', 'x')).toBeNull();
});
