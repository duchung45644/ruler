import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { offGrid, scanStyles } from './audit';

beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 10, 10));
});
afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const notOwn = () => false;

it('collects colors, spacing and off-grid count', () => {
  document.body.innerHTML =
    '<p style="color:rgb(255,0,0);margin:6px">x</p><div style="background:rgb(0,0,255);padding:8px"></div>';
  const r = scanStyles(document.documentElement, notOwn);
  const red = r.colors.find((c) => c.key === '#FF0000');
  expect(red?.uses?.has('text')).toBe(true);
  expect(r.colors.find((c) => c.key === '#0000FF')?.uses?.has('bg')).toBe(true);
  const keys = r.spacing.map((s) => s.key);
  expect(keys).toContain('6');
  expect(keys).toContain('8');
  expect(offGrid(r.spacing)).toBe(1);
});

it('skips own and hidden elements', () => {
  document.body.innerHTML =
    '<p id="own" style="color:rgb(1,2,3)">a</p><p style="display:none;color:rgb(4,5,6)">b</p>';
  const own = document.getElementById('own')!;
  const r = scanStyles(document.documentElement, (el) => el === own);
  expect(r.colors.map((c) => c.key)).not.toContain('#010203');
  expect(r.colors.map((c) => c.key)).not.toContain('#040506');
});

it('limit = 1 scans only html and body', () => {
  document.body.innerHTML = '<p style="color:rgb(255,0,0);margin:6px">x</p>';
  const r = scanStyles(document.documentElement, notOwn, 1);
  expect(r.colors.map((c) => c.key)).not.toContain('#FF0000');
  expect(r.spacing).toEqual([]);
});
