import postcss, { type AtRule, type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';
import { shadowDomCss } from './shadow-dom-css';

const run = (css: string, plugin = shadowDomCss()) =>
  postcss([plugin]).process(css, { from: undefined }).root;

describe('shadowDomCss', () => {
  it('đổi rem sang px trong giá trị khai báo', () => {
    expect(
      run(
        '.a{margin:.25rem;padding:-0.5rem 1.5rem;--spacing:0.25rem;width:calc(1.125rem + 2px)}',
      ).toString(),
    ).toBe('.a{margin:4px;padding:-8px 24px;--spacing:4px;width:calc(18px + 2px)}');
  });

  it('giữ nguyên rem trong điều kiện @media', () => {
    expect(run('@media (width>=40rem){.a{color:red}}').toString()).toContain('40rem');
  });

  it('thay @property bằng giá trị mặc định ở layer thấp nhất', () => {
    const root = run(
      '@layer theme, base, components, utilities;' +
        '@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}' +
        '@property --tw-ring-inset{syntax:"*";inherits:false}.a{color:red}',
    );
    expect(root.toString()).not.toContain('@property');
    const first = root.first as AtRule;
    expect([first.name, first.params, first.nodes]).toEqual(['layer', 'properties', undefined]);
    const last = root.last as AtRule;
    expect([last.name, last.params]).toEqual(['layer', 'properties']);
    const rule = last.first as Rule;
    expect(rule.selector).toBe(':host, *, ::before, ::after, ::backdrop');
    expect(rule.nodes.map(String)).toEqual(['--tw-shadow: 0 0 #0000']);
  });

  it('không thêm gì khi không có @property', () => {
    expect(run('.a{color:red}').toString()).toBe('.a{color:red}');
  });

  it('mỗi file một trạng thái riêng', () => {
    const plugin = shadowDomCss();
    run('@property --x{syntax:"*";inherits:false;initial-value:1px}', plugin);
    expect(run('.a{color:red}', plugin).toString()).toBe('.a{color:red}');
  });
});
