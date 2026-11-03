import { expect, it } from 'vitest';
import { knownProperties, stepNumber, suggestProperties, suggestValues } from './suggest';

it('ranks common properties first and drops rare prefixes', () => {
  const out = suggestProperties('d', ['direction', '-moz-x', 'display', 'd']);
  expect(out[0]).toBe('display');
  expect(suggestProperties('-', ['-moz-x', '-webkit-line-clamp'])).toEqual(['-webkit-line-clamp']);
  expect(knownProperties()).toContain('display');
});

it('suggests keywords and variables', () => {
  expect(suggestValues('display', 'fl', [])).toEqual(['flex']);
  expect(suggestValues('color', 'v', ['--brand'])).toEqual(['var(--brand)']);
  expect(suggestValues('color', 'in', [])).toContain('inherit');
});

it('steps the number under the caret, keeping units', () => {
  expect(stepNumber('10px', 1, 1)).toBe('11px');
  expect(stepNumber('auto', 1, 1)).toBeNull();
  expect(stepNumber('1px 2px', 5, 10)).toBe('1px 12px');
  expect(stepNumber('0.5em', 0, 0.1)).toBe('0.6em');
  expect(stepNumber('1px', 0, -10)).toBe('-9px');
});
