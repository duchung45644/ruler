import { expect, it } from 'vitest';
import { findAll, findTitle } from './find';

// happy-dom has no layout (offsetParent/boxes), so visibility is stubbed.
const vis = (el: Element) => !el.hasAttribute('style');

it('finds in document and open shadow roots, counting hidden', () => {
  document.body.innerHTML = '<p class=a></p><p class=a style="display:none"></p><div id=h></div>';
  document.getElementById('h')!.attachShadow({ mode: 'open' }).innerHTML = '<p class=a></p>';
  const r = findAll('.a', vis);
  expect(r.found).toHaveLength(2);
  expect(r.hidden).toBe(1);
});

it('empty or invalid selector finds nothing without throwing', () => {
  expect(findAll('div[', vis)).toEqual({ found: [], hidden: 0 });
  expect(findAll('>>', vis)).toEqual({ found: [], hidden: 0 });
  expect(findAll('  ', vis)).toEqual({ found: [], hidden: 0 });
});

it('findTitle', () => {
  const t = ((k: string) => k) as never;
  expect(findTitle(0, 3, 0, t)).toBe('1/3');
  expect(findTitle(0, 0, 2, t)).toBe('0 (find.hidden)');
  expect(findTitle(0, 0, 0, t)).toBe('find.title');
});
