import { afterEach, describe, expect, it } from 'vitest';
import { locateElement, locatorKey, resolveLocator } from './element-locator';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('element locator', () => {
  it('round-trips an element through its locator', () => {
    document.body.innerHTML = '<div><p>a</p><section><span id="t"></span></section></div>';
    const el = document.getElementById('t')!;
    const loc = locateElement(el)!;
    expect(loc.hops[0]!.map((s) => s.tag)).toEqual(['html', 'body', 'div', 'section', 'span']);
    expect(resolveLocator(loc)).toBe(el);
    expect(resolveLocator(JSON.parse(JSON.stringify(loc)))).toBe(el);
    expect(locatorKey(loc)).toBe(locatorKey(locateElement(el)!));
  });

  it('returns null on a tag mismatch or a missing step', () => {
    document.body.innerHTML = '<div><p>a</p><section><span id="t"></span></section></div>';
    const loc = locateElement(document.getElementById('t')!)!;
    document.body.innerHTML = '<div><p>a</p><article><span></span></article></div>';
    expect(resolveLocator(loc)).toBeNull();
    document.body.innerHTML = '<div><p>a</p></div>';
    expect(resolveLocator(loc)).toBeNull();
    expect(resolveLocator({ hops: [] })).toBeNull();
    expect(resolveLocator('junk')).toBeNull();
  });

  it('crosses open shadow roots', () => {
    document.body.innerHTML = '<div id="h"></div>';
    const root = document.getElementById('h')!.attachShadow({ mode: 'open' });
    root.innerHTML = '<style></style><b><i></i></b>';
    const el = root.querySelector('i')!;
    const loc = locateElement(el)!;
    expect(loc.hops).toHaveLength(2);
    expect(resolveLocator(loc)).toBe(el);
  });

  it('detached elements have no locator', () => {
    expect(locateElement(document.createElement('div'))).toBeNull();
  });
});
