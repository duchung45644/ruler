import { expect, it } from 'vitest';
import { forwardKey } from './panel-keys';

const key = (key: string, target: Element, mods: Partial<Record<string, boolean>> = {}) => ({
  key,
  target,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  ...mods,
});

it('forwards digits and Escape from plain elements', () => {
  const div = document.createElement('div');
  expect(forwardKey(key('3', div))).toBe('3');
  expect(forwardKey(key('Escape', div))).toBe('Escape');
  expect(forwardKey(key('a', div))).toBeNull();
  expect(forwardKey(key('3', div, { ctrlKey: true }))).toBeNull();
});

it('keeps keys typed into fields', () => {
  const ce = document.createElement('div');
  ce.contentEditable = 'true';
  document.body.append(ce);
  for (const el of [document.createElement('input'), document.createElement('select'), ce])
    expect(forwardKey(key('3', el))).toBeNull();
  ce.remove();
});
