import { expect, it } from 'vitest';
import { mergeDecls, parseDecls, serializeDecls } from './decls';

it('splits on top-level semicolons only', () => {
  expect(parseDecls('color:red; background:url("a;b") !important')).toEqual([
    { property: 'color', value: 'red', important: false },
    { property: 'background', value: 'url("a;b")', important: true },
  ]);
  expect(parseDecls('/* x; */ --My-Var: calc(1px; 2px); junk')).toEqual([
    { property: '--My-Var', value: 'calc(1px; 2px)', important: false },
  ]);
});

it('serializes and merges, empty value removing', () => {
  const base = parseDecls('color: red; margin: 0');
  const merged = mergeDecls(base, parseDecls('margin: ; padding: 1px !important; color: blue'));
  expect(serializeDecls(merged)).toBe('color: blue; padding: 1px !important;');
});
