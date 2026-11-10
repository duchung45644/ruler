import { afterEach, expect, it } from 'vitest';
import { ALWAYS, NEVER } from '../../lib/responsive/color-scheme';
import { setFrameScheme } from './scheme';

const flush = () => new Promise((r) => setTimeout(r, 80));

afterEach(() => {
  setFrameScheme(null);
  document.head.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

function addStyle(css: string): HTMLStyleElement {
  const el = document.createElement('style');
  el.textContent = css;
  document.head.append(el);
  return el;
}
const mediaOf = (el: HTMLStyleElement, i = 0) =>
  (el.sheet!.cssRules[i] as CSSMediaRule).media.mediaText;

it('forces the scheme in media rules and restores them exactly', () => {
  const el = addStyle(
    '@media (prefers-color-scheme: dark) { a { color: red } } @media screen and (prefers-color-scheme: light) { a { color: blue } }',
  );
  const before = [mediaOf(el, 0), mediaOf(el, 1)];
  document.documentElement.style.colorScheme = 'normal';
  setFrameScheme('dark');
  expect(mediaOf(el, 0)).toBe(ALWAYS);
  expect(mediaOf(el, 1)).toContain(NEVER);
  expect(document.documentElement.style.colorScheme).toBe('dark');
  setFrameScheme('light');
  expect(mediaOf(el, 0)).toBe(NEVER);
  setFrameScheme(null);
  expect([mediaOf(el, 0), mediaOf(el, 1)]).toEqual(before);
  expect(document.documentElement.style.colorScheme).toBe('normal');
});

it('rewrites media attributes and sheets added while forced', async () => {
  const link = document.createElement('link');
  link.setAttribute('media', '(prefers-color-scheme: dark)');
  document.head.append(link);
  setFrameScheme('light');
  expect(link.getAttribute('media')).toBe(NEVER);
  const late = addStyle('@media (prefers-color-scheme: light) { a { color: red } }');
  await flush();
  expect(mediaOf(late)).toBe(ALWAYS);
  setFrameScheme(null);
  expect(link.getAttribute('media')).toBe('(prefers-color-scheme: dark)');
  expect(mediaOf(late)).toContain('prefers-color-scheme');
});

it('does nothing after restore', async () => {
  setFrameScheme('dark');
  setFrameScheme(null);
  const el = addStyle('@media (prefers-color-scheme: light) { a { color: red } }');
  await flush();
  expect(mediaOf(el)).toContain('prefers-color-scheme');
});
