import { describe, expect, it } from 'vitest';
import {
  isVarValue,
  customProps,
  filterVars,
  groupKey,
  groupVars,
  isColorValue,
  isRootSelector,
  isVarName,
} from './variables';

const v = (name: string, value = '1') => ({ name, value });

describe('css variables', () => {
  it('recognises root selectors', () => {
    expect(isRootSelector(':root')).toBe(true);
    expect(isRootSelector('html')).toBe(true);
    expect(isRootSelector('.dark, :root')).toBe(true);
    expect(isRootSelector(':where(:root)')).toBe(true);
    expect(isRootSelector('html body')).toBe(false);
    expect(isRootSelector('.root')).toBe(false);
  });

  it('lists custom properties only', () => {
    const props = ['color', '--a', '--b-c'];
    expect(customProps({ length: 3, item: (i) => props[i]! })).toEqual(['--a', '--b-c']);
  });

  it('groups by prefix, singles into other', () => {
    expect(groupKey('--color-primary')).toBe('color');
    expect(groupKey('--gap')).toBe('');
    const g = groupVars([
      v('--space-1'),
      v('--color-a'),
      v('--space-2'),
      v('--radius-sm'),
      v('--x'),
    ]);
    expect(g.map((x) => [x.name, x.vars.map((y) => y.name)])).toEqual([
      ['space', ['--space-1', '--space-2']],
      ['', ['--x', '--color-a', '--radius-sm']],
    ]);
  });

  it('filters by name or value', () => {
    const list = [v('--brand', '#f00'), v('--gap', '4px')];
    expect(filterVars(list, 'BRA')).toEqual([list[0]]);
    expect(filterVars(list, '4px')).toEqual([list[1]]);
    expect(filterVars(list, ' ')).toBe(list);
  });

  it('detects colour values', () => {
    expect(isColorValue('#fff')).toBe(true);
    expect(isColorValue('rgb(0 0 0)')).toBe(true);
    expect(isColorValue('hsl(0 0% 0%)')).toBe(true);
    expect(isColorValue('rebeccapurple', (x) => x === 'rebeccapurple')).toBe(true);
    expect(isColorValue('4px', () => true)).toBe(false);
    expect(isColorValue('var(--x)', () => true)).toBe(false);
    expect(isColorValue('bold')).toBe(false);
  });

  it('validates names', () => {
    expect(isVarName('--a-b_1')).toBe(true);
    expect(isVarName('--a;b')).toBe(false);
    expect(isVarName('color')).toBe(false);
  });
});

describe('isVarValue', () => {
  it('keeps data URLs and quoted punctuation, rejects declaration breakout', () => {
    for (const v of ['', '#fff', 'url(data:image/png;base64,AAA=)', '"a;b}"', 'calc(1px + (2px))'])
      expect(isVarValue(v), v).toBe(true);
    for (const v of ['red; color: blue', 'red}', '{', 'red !important', '"open', '/* x', '(]'])
      expect(isVarValue(v), v).toBe(false);
  });
});
