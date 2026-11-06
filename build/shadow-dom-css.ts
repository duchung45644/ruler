import { AtRule, Rule, type Plugin } from 'postcss';

// Tailwind trong shadow DOM: rem → px (trang có thể đổi font-size của html),
// @property → giá trị mặc định ở layer thấp nhất (WXT đưa @property lên <head> của trang).
export const shadowDomCss = (): Plugin => ({
  postcssPlugin: 'iodob-shadow-dom-css',
  prepare() {
    const defaults: [string, string][] = [];
    return {
      Declaration(decl) {
        decl.value = decl.value.replace(
          /(-?\d*\.?\d+)rem\b/g,
          (_, n: string) => `${Number((Number(n) * 16).toFixed(4))}px`,
        );
      },
      AtRule: {
        property(rule) {
          let value: string | undefined;
          rule.walkDecls('initial-value', (d) => {
            value = d.value;
          });
          if (value !== undefined) defaults.push([rule.params, value]);
          rule.remove();
        },
      },
      OnceExit(root) {
        if (!defaults.length) return;
        root.prepend(new AtRule({ name: 'layer', params: 'properties' }));
        const rule = new Rule({ selector: ':host, *, ::before, ::after, ::backdrop' });
        for (const [prop, value] of defaults) rule.append({ prop, value, raws: { between: ': ' } });
        root.append(new AtRule({ name: 'layer', params: 'properties', nodes: [rule] }));
      },
    };
  },
});
