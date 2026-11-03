/** Property / value suggestions and number stepping for the CSS editor (6.41). */

const PRIORITY = [
  'display',
  'position',
  'color',
  'background',
  'background-color',
  'margin',
  'padding',
  'width',
  'height',
  'max-width',
  'min-height',
  'font-size',
  'font-weight',
  'line-height',
  'border',
  'border-radius',
  'flex',
  'flex-direction',
  'justify-content',
  'align-items',
  'gap',
  'grid-template-columns',
  'top',
  'left',
  'z-index',
  'opacity',
  'overflow',
  'transform',
  'transition',
  'box-shadow',
  'text-align',
];

// Only the widespread prefixed names are worth offering.
const KEEP_PREFIXED = new Set([
  '-webkit-line-clamp',
  '-webkit-box-orient',
  '-webkit-text-stroke',
  '-webkit-font-smoothing',
  '-webkit-tap-highlight-color',
  '-webkit-appearance',
]);

/** Property names known to this browser, read at runtime (D7). */
export function knownProperties(doc: Document = document): string[] {
  const cs = doc.defaultView?.getComputedStyle(doc.documentElement);
  if (!cs) return [...PRIORITY];
  const names = new Set<string>(PRIORITY);
  for (let i = 0; i < cs.length; i++) names.add(cs[i]!);
  return [...names];
}

export function suggestProperties(prefix: string, all: string[]): string[] {
  const p = prefix.trim().toLowerCase();
  const rank = (n: string) => {
    const i = PRIORITY.indexOf(n);
    return i < 0 ? PRIORITY.length : i;
  };
  return [...new Set(all)]
    .filter(
      (n) => (!n.startsWith('-') || n.startsWith('--') || KEEP_PREFIXED.has(n)) && n.startsWith(p),
    )
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

const GLOBAL_VALUES = ['inherit', 'initial', 'unset', 'revert', 'revert-layer'];
const FLEX_ALIGN = ['flex-start', 'flex-end', 'center', 'stretch', 'baseline', 'start', 'end'];
const VALUES: Record<string, string[]> = {
  display: [
    'block',
    'inline',
    'inline-block',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'none',
    'contents',
  ],
  position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
  'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],
  'justify-content': [
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
    'start',
    'end',
  ],
  'align-items': FLEX_ALIGN,
  'align-self': ['auto', ...FLEX_ALIGN],
  'text-align': ['left', 'right', 'center', 'justify', 'start', 'end'],
  overflow: ['visible', 'hidden', 'scroll', 'auto', 'clip'],
  visibility: ['visible', 'hidden', 'collapse'],
  cursor: ['auto', 'default', 'pointer', 'text', 'move', 'not-allowed', 'grab'],
  'font-weight': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  'box-sizing': ['content-box', 'border-box'],
  'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line'],
};

export function suggestValues(property: string, prefix: string, vars: string[]): string[] {
  const p = prefix.trim().toLowerCase();
  const own = VALUES[property.toLowerCase()] ?? [];
  const varVals = vars.map((v) => `var(${v})`);
  return [...new Set([...own, ...GLOBAL_VALUES, ...varVals])].filter((v) =>
    v.toLowerCase().startsWith(p),
  );
}

/**
 * Steps the number under `caret` by `delta` (1, 10 or 0.1), keeping its unit.
 * Null when there is no number there.
 */
export function stepNumber(value: string, caret: number, delta: number): string | null {
  const re = /-?(?:\d+\.?\d*|\.\d+)/g;
  for (let m = re.exec(value); m; m = re.exec(value)) {
    const start = m.index;
    const end = start + m[0].length;
    // A digit glued to letters before it (e.g. "h1") is not a number.
    if (start > 0 && /[a-z_]/i.test(value[start - 1]!)) continue;
    if (caret < start || caret > end) continue;
    const decimals = Math.max((m[0].split('.')[1] ?? '').length, delta % 1 ? 1 : 0);
    const next = (parseFloat(m[0]) + delta).toFixed(decimals);
    return value.slice(0, start) + String(Number(next)) + value.slice(end);
  }
  return null;
}
