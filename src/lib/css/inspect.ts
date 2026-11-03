import { formatColor, formatCss, parseColor, type ColorFormat } from '../color';

type Style = Pick<CSSStyleDeclaration, 'getPropertyValue'>;
export type InspectGroup = {
  label: 'inspect.layout' | 'inspect.appearance' | 'inspect.text';
  rows: Array<[prop: string, value: string]>;
};

const GROUPS: Array<[InspectGroup['label'], string[]]> = [
  ['inspect.layout', ['width', 'height', 'display', 'gap', 'margin', 'padding', 'box-sizing']],
  ['inspect.appearance', ['border-radius', 'background-color', 'color']],
  [
    'inspect.text',
    ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align'],
  ],
];
/** Values hidden as defaults (legacy buildInspectContent :42881). */
const DEFAULTS: Record<string, string> = {
  'letter-spacing': 'normal',
  'text-align': 'start',
  gap: 'normal',
};

/** Round every `Npx` token to 1 decimal. */
const roundPx = (v: string) =>
  v.replace(/(-?[\d.]+)px/g, (_, n: string) => `${Math.round(parseFloat(n) * 10) / 10}px`);

function value(
  prop: string,
  raw: string,
  style: Style,
  font: string,
  f: ColorFormat,
): string | undefined {
  if (!raw || raw === DEFAULTS[prop]) return;
  if (prop.includes('color')) {
    const c = parseColor(raw);
    return c ? (c.a ? formatColor(c, f) : undefined) : raw;
  }
  if (
    ['margin', 'padding', 'border-radius'].includes(prop) &&
    raw.split(' ').every((p) => p === '0px')
  )
    return;
  if (prop === 'font-family') return font;
  if (prop === 'line-height') {
    const fs = parseFloat(style.getPropertyValue('font-size'));
    const lh = parseFloat(raw);
    if (fs > 0 && !isNaN(lh)) return `${Math.round((lh / fs) * 100) / 100}`;
  }
  return roundPx(raw);
}

export function inspectGroups(
  style: Style,
  renderedFont: string,
  f: ColorFormat = 'HEX',
): InspectGroup[] {
  return GROUPS.map(([label, props]) => ({
    label,
    rows: props.flatMap((p): Array<[string, string]> => {
      const v = value(p, style.getPropertyValue(p), style, renderedFont, f);
      return v === undefined ? [] : [[p, v]];
    }),
  })).filter((g) => g.rows.length);
}

/** Port of bdElementSelector (:42775): `#id`, else `tag.class1.class2`, else `tag`. */
export function elementSelector(el: Element): string {
  if (el.id) return `#${el.id}`;
  const tag = el.tagName.toLowerCase();
  return el.classList.length ? `${tag}.${[...el.classList].join('.')}` : tag;
}

const SNIPPET_PROPS = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'width',
  'height',
  'margin',
  'padding',
  'box-sizing',
  'border',
  'border-radius',
  'background-color',
  'color',
  'opacity',
  'box-shadow',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'flex-direction',
  'justify-content',
  'align-items',
  'gap',
  'grid-template-columns',
  'grid-template-rows',
];

/** Port of bdBuildCssSnippet (:42791). Colours stay as computed unless `f` is given. */
export function cssSnippet(el: Element, style: Style, f?: ColorFormat): string {
  const get = (p: string) => style.getPropertyValue(p);
  const display = get('display');
  const flex = display === 'flex' || display === 'inline-flex';
  const grid = display === 'grid' || display === 'inline-grid';
  const isStatic = get('position') === 'static';
  const noBorder = ['top', 'right', 'bottom', 'left'].every(
    (s) => !parseFloat(get(`border-${s}-width`)),
  );
  const lines = SNIPPET_PROPS.flatMap((p) => {
    if (['flex-direction', 'justify-content', 'align-items'].includes(p) && !flex) return [];
    if (p.startsWith('grid-template') && !grid) return [];
    if (['position', 'top', 'right', 'bottom', 'left'].includes(p) && isStatic) return [];
    if (p === 'border' && noBorder) return [];
    const v = get(p);
    if (!v || ['none', 'normal', 'auto', '0px'].includes(v)) return [];
    if (p.includes('color') && v === 'rgba(0, 0, 0, 0)') return [];
    return [`  ${p}: ${f && p.includes('color') ? formatCss(v, f) : v};`];
  });
  return `${elementSelector(el)} {\n${lines.join('\n')}\n}`;
}

/** Port of getRenderedFont (:42745): first family in the stack whose metrics match the computed font. */
export function renderedFont(el: Element): string {
  const s = getComputedStyle(el);
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return s.fontFamily;
  const sample = 'BESbswy/\\[]{}()@iIlL10OoQgMmWw';
  const prefix = `${s.fontStyle} ${s.fontWeight} ${s.fontSize}`;
  ctx.font = `${prefix} ${s.fontFamily}`;
  const width = ctx.measureText(sample).width;
  for (const f of s.fontFamily.split(',')) {
    const name = f.trim().replace(/['"]/g, '');
    ctx.font = `${prefix} ${name}`;
    if (Math.abs(width - ctx.measureText(sample).width) < 1) return name;
  }
  return s.fontFamily;
}
