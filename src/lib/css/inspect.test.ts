import { describe, expect, it } from 'vitest';
import { cssSnippet, elementSelector, inspectGroups } from './inspect';

const fake = (o: Record<string, string>) => ({ getPropertyValue: (p: string) => o[p] ?? '' });
const rows = (o: Record<string, string>) =>
  Object.fromEntries(inspectGroups(fake(o), 'Inter').flatMap((g) => g.rows));

describe('inspectGroups', () => {
  it('drops defaults', () => {
    const r = rows({ display: 'block', padding: '0px' });
    expect(r.display).toBe('block');
    expect(r).not.toHaveProperty('padding');
  });
  it('line-height as ratio', () => {
    expect(rows({ 'font-size': '16px', 'line-height': '24px' })['line-height']).toBe('1.5');
  });
  it('colours as hex', () => {
    expect(rows({ color: 'rgb(99, 102, 241)' }).color).toBe('#6366f1');
  });
  it('uses the rendered font', () => {
    expect(rows({ 'font-family': 'Foo, Inter' })['font-family']).toBe('Inter');
  });
});

describe('elementSelector / cssSnippet', () => {
  it('follows legacy format: id wins, else tag.classes', () => {
    const d = document.createElement('div');
    d.className = 'a b';
    expect(elementSelector(d)).toBe('div.a.b');
    d.id = 'x';
    expect(elementSelector(d)).toBe('#x');
  });
  it('skips static position, flex props on block, zero values', () => {
    const d = document.createElement('p');
    const s = fake({
      display: 'block',
      position: 'static',
      top: '0px',
      'justify-content': 'center',
      margin: '0px',
      'border-top-width': '0px',
      border: '0px none',
      color: 'rgb(0, 0, 0)',
      'background-color': 'rgba(0, 0, 0, 0)',
    });
    expect(cssSnippet(d, s)).toBe('p {\n  display: block;\n  color: rgb(0, 0, 0);\n}');
  });
});
