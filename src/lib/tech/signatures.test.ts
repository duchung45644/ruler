import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { detectAll, SIGNATURES } from './signatures';

const win = (extra: object) => Object.assign(Object.create(window), { document }, extra);

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

it('has every legacy signature, in order', () => {
  const names = Object.keys(SIGNATURES);
  expect(names).toHaveLength(184);
  expect(names[0]).toBe('GWT');
});

it('detects React from the global with its version', () => {
  expect(detectAll(win({ React: { Component: class {}, version: '18.2.0' } }))).toContainEqual(
    expect.objectContaining({ id: 'react', name: 'React', version: '18.2.0' }),
  );
});

it('adds React for Next.js', () => {
  const ids = detectAll(win({ __NEXT_DATA__: {} })).map((t) => t.id);
  expect(ids).toContain('next');
  expect(ids.filter((id) => id === 'react')).toHaveLength(1);
});

it('keeps going when one signature throws', () => {
  vi.spyOn(SIGNATURES.GWT!, 'test').mockImplementation(() => {
    throw new Error('boom');
  });
  expect(detectAll(win({ __NEXT_DATA__: {} })).map((t) => t.id)).toContain('next');
});

it('joins version arrays', () => {
  vi.spyOn(SIGNATURES.GWT!, 'test').mockReturnValue({ version: ['1', '2'] });
  expect(detectAll(win({}))).toContainEqual(
    expect.objectContaining({ id: 'gwt', version: '1, 2' }),
  );
});

// icon38 is upstream's generic placeholder; legacy never shipped it, so the panel shows the initial
it('ships a logo for every icon but the generic one', () => {
  const logos = new Set(readdirSync(resolve(__dirname, '../../../public/logos')));
  const missing = Object.values(SIGNATURES)
    .map((s) => s.icon)
    .filter((icon): icon is string => !!icon && !logos.has(`${icon}.svg`));
  expect(new Set(missing)).toEqual(new Set(['icon38']));
});
