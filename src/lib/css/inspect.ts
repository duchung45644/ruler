import { formatColor, formatCss, parseColor, type ColorFormat } from '../style/color';

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

/** One measuring context for every call (creating a canvas per element was most of the cost). */
let measure: CanvasRenderingContext2D | null | undefined;
/** Font shorthand → rendered family; dropped while webfonts load (the answer may change). */
const fontMemo = new Map<string, string>();

/** Port of getRenderedFont (content.js:42745): the stack entry whose metrics match. */
export function renderedFont(s: CSSStyleDeclaration): string {
  const prefix = `${s.fontStyle} ${s.fontWeight} ${s.fontSize}`;
  const key = `${prefix} ${s.fontFamily}`;
  const loading = document.fonts?.status === 'loading';
  if (loading) fontMemo.clear();
  const known = fontMemo.get(key);
  if (known !== undefined) return known;
  measure ??= document.createElement('canvas').getContext('2d');
  const ctx = measure;
  if (!ctx) return s.fontFamily;
  const probe = 'BESbswy/\\[]{}()@iIlL10OoQgMmWw';
  ctx.font = key;
  const width = ctx.measureText(probe).width;
  let found = s.fontFamily;
  for (const f of s.fontFamily.split(',')) {
    const family = f.trim().replace(/['"]/g, '');
    ctx.font = `${prefix} ${family}`;
    if (Math.abs(width - ctx.measureText(probe).width) < 1) {
      found = family;
      break;
    }
  }
  if (!loading) fontMemo.set(key, found);
  return found;
}
