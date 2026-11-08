import { afterEach, expect, it } from 'vitest';
import {
  displaySelector,
  ensureElementId,
  fullPath,
  generateId,
  resolveElementById,
  uniquePath,
} from './selector';

afterEach(() => document.body.replaceChildren());
const ATTR = 'data-sr-id-test';

it('generates short base-36 ids', () => {
  expect(generateId(() => 0.123456789)).toMatch(/^v-[0-9a-z]{1,9}$/);
});

it('assigns an id once and resolves it after the map is lost', () => {
  const el = document.body.appendChild(document.createElement('p'));
  const map = new Map<string, WeakRef<Element>>();
  const id = ensureElementId(el, ATTR, map);
  expect(el.getAttribute(ATTR)).toBe(id);
  expect(ensureElementId(el, ATTR, map)).toBe(id);
  map.clear();
  expect(resolveElementById(id, ATTR, map)).toBe(el);
  expect(resolveElementById('v-missing', ATTR, map)).toBeNull();
});

it('resolves ids inside shadow roots', () => {
  const host = document.body.appendChild(document.createElement('x-card'));
  const inner = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('b'));
  inner.setAttribute(ATTR, 'v-1');
  expect(resolveElementById('v-1', ATTR, new Map())).toBe(inner);
});

it('display selector lists tag, id and classes', () => {
  const el = document.createElement('a');
  el.id = 'x';
  el.className = ' btn  primary ';
  expect(displaySelector(el)).toBe('a#x.btn.primary');
});

it('unique path prefers a stable class, else walks up to the nearest id', () => {
  document.body.innerHTML = '<div id="app"><ul><li class="active item">a</li></ul></div>';
  const li = document.querySelector('li')!;
  expect(uniquePath(li)).toBe('.item');
  li.after(Object.assign(document.createElement('li'), { className: 'item' }));
  const second = document.querySelectorAll('li')[1]!;
  // legacy keeps the classes on each step (getUniquePath, content.js:15290)
  expect(uniquePath(second)).toBe('#app > ul > li.item:nth-child(2)');
});

it('full path crosses shadow roots with >>>', () => {
  const host = document.body.appendChild(document.createElement('x-card'));
  host.id = 'c';
  const span = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('span'));
  span.className = 'title';
  expect(fullPath(span)).toBe('#c >>> .title');
});
