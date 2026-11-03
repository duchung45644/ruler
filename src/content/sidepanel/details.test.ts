import { afterEach, expect, it, vi } from 'vitest';
import { collectElementDetails, styleMap } from './details';

const ids = (el: Element) => (el.id ? `v-${el.id}` : 'v-x');

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it('collects text, colours, box model and an id', () => {
  document.body.innerHTML =
    '<div><p id="p" style="color: rgb(255, 0, 0); margin-top: 8px">Hi</p></div>';
  const p = document.getElementById('p')!;
  const d = collectElementDetails(p, ids);
  expect(d.id).toMatch(/^v-/);
  expect(d.name).toBe('p#p');
  expect(d.type).toBe('text');
  expect(d.textContent).toBe('Hi');
  expect(d.colors.text).toContain('#FF0000');
  expect(d.boxModel.margin.top).toBe(8);
  expect(d.parentName).toBe('div');
  expect(d.parentSelectable).toBe(true);
  expect(d.css.color).toBe('rgb(255, 0, 0)');
  expect(d.before).toBeUndefined();
  expect(styleMap.get(p)?.colors.has('#FF0000')).toBe(true);
  expect(() => structuredClone(d)).not.toThrow();
});

it('adds ::before when it has content', () => {
  document.body.innerHTML = '<span>x</span>';
  const el = document.body.firstElementChild!;
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((e, pseudo) => {
    const s = real(e);
    if (pseudo !== '::before') return s;
    return new Proxy(s, {
      get: (t, k) =>
        k === 'getPropertyValue'
          ? (p: string) =>
              p === 'content' ? '"x"' : p === 'color' ? 'rgb(0, 0, 255)' : t.getPropertyValue(p)
          : Reflect.get(t, k),
    });
  });
  const d = collectElementDetails(el, ids);
  expect(d.before).toMatchObject({ content: '"x"', color: 'rgb(0, 0, 255)' });
  expect(d.after).toBeUndefined();
});
