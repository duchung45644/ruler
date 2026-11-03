import { expect, it } from 'vitest';
import type { KnownRule } from '../css/matched';
import { addressOf, locate, scopeAddressOf } from './rule-address';

const known = (selectorText: string, source = 'a.css', wrappers: string[] = []): KnownRule => ({
  rule: { selectorText } as CSSStyleRule,
  source,
  wrappers,
  mediaActive: true,
  sourceIndex: 0,
});

it('numbers repeated rules and locates them back', () => {
  const all = [
    known('.a'),
    known('.b'),
    known('.a'),
    known('.a', 'b.css'),
    known('.a', 'a.css', ['@media x']),
  ];
  const second = addressOf(all[2]!, all, null);
  expect(second.occ).toBe(1);
  expect(addressOf(all[0]!, all, null).occ).toBe(0);
  expect(addressOf(all[4]!, all, null).occ).toBe(0);
  expect(locate(second, all)).toBe(all[2]);
  expect(locate({ ...second, occ: 2 }, all)).toBeNull();
});

it('addresses shadow roots by host path', () => {
  expect(scopeAddressOf(document)).toBeNull();
  const host = document.body.appendChild(document.createElement('x-card'));
  host.id = 'c';
  expect(scopeAddressOf(host.attachShadow({ mode: 'open' }))).toBe('#c');
  host.remove();
});
