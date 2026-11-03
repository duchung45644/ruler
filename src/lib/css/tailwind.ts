/**
 * CSS → Tailwind classes. Port of the generator bundled in legacy content.js:17948–19737,
 * which is transform-to-tailwindcss-core by Simon He (MIT, see THIRD_PARTY_NOTICES.md),
 * plus the v3 → v4 rename table `wg` (:20991) that the panel applies after it.
 * Logic is kept as-is (arbitrary values like `p-[16px]`, `op-50`); only syntax is tidied.
 */

type Rule = (prop: string, value: string) => string | undefined;
interface Pattern {
  key: string;
  pattern: RegExp | string;
}
interface Transformed {
  transformedResult: string;
  deleteKeys: string[];
}
interface Template {
  allMatch: Record<string, RegExp | string>;
  anyMatch?: Pattern[];
  priority?: string[];
  outputTemplate: string | ((v: string) => string);
}

const Ip = /^(?:calc|clamp|min|max)\s*\(.*\)/;
const Op = /^-?[0-9.]+(px|rem|em|%|vw|vh|vmin|vmax|deg|s|ms)$/;
const Np = ['top', 'right', 'bottom', 'left', 'center'];
function Pp(e: string) {
  return e.startsWith('calc(');
}
function Fp(e: string): string {
  return e.split('-')[0]!;
}
function zp(e: string): string {
  const t = e.split('-');
  return t[t.length - 1]!;
}
function Dp(e: string) {
  return e.startsWith('rgb');
}
function Hp(e: string) {
  return (
    e.startsWith('linear-gradient') ||
    e.startsWith('radial-gradient') ||
    e.startsWith('conic-gradient')
  );
}
function Bp(e: string) {
  return (
    /^\d+\/\d+$/.test(e) ||
    ((e) => e.startsWith('url('))(e) ||
    ((t: string) => /^#[0-9A-F]{2,}$/i.test(t) || Dp(e) || ((e) => e.startsWith('hsl'))(e))(e) ||
    Ip.test(e) ||
    Op.test(e) ||
    Hp(e) ||
    qp(e) ||
    Pp(e) ||
    ((e) => e.startsWith('cubic-bezier'))(e) ||
    ((e) => /^attr\(/i.test(e))(e) ||
    ((e) => /^repeating-linear-gradient\(/i.test(e))(e) ||
    ((e) => /^repeating-radial-gradient\(/i.test(e))(e) ||
    ((e) => /^constant\(/.test(e))(e) ||
    ((e) => /^env\(/.test(e))(e) ||
    ((e) => e.endsWith('turn'))(e)
  );
}
function $p(e: string | number | undefined, t?: (v: string) => string, n = '', r = false): string {
  e = String(e);
  if (r || Bp(e)) {
    return `-[${n}${((e, t = 'around') => {
      switch (t) {
        case 'pre':
          return e.replace(/(^\s*)/g, '');
        case 'post':
          return e.replace(/(\s*$)/g, '');
        case 'all':
          return e.replace(/\s+/g, '');
        case 'around':
          return e.replace(/(^\s*)|(\s*$)/g, '');
        default:
          return e;
      }
    })(t ? t(e) : e, 'all').replace(/['"]/g, '')}]`;
  }
  if (n) {
    return `-[${n}${t ? t(e) : e}]`;
  }
  return `-${t ? t(e) : e}`;
}
function jp(e: string) {
  if (e.endsWith('%') || e.endsWith('deg') || e === '0') {
    return e;
  }
  const t = Math.round(100 * Number(e));
  if (Number.isNaN(t)) {
    return t;
  }
  return `${t}%`;
}
function Up(e: string) {
  return e.replace(/\s+/g, ' ').split(/\s/g).join('-');
}
function Wp(e: string) {
  return e.replace(/\s+/g, ' ').split(/\s/g).join('_');
}
function Vp(e: string, t = true): [string, string] {
  if (t) {
    e = e
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*\/\s*/g, '/');
  }
  if (/calc\([^)]+\)/.test(e)) {
    e = e.replace(/calc\(([^)]+)\)/g, (e: string, t: string) => e.replace(t, t.replace(/\s/g, '')));
  }
  if (/rgb/.test(e)) {
    e = e.replace(/rgba?\(([^)]+)\)/g, (e: string, t: string) => {
      const n = t.trim().split(' ');
      return e.replace(
        t,
        n
          .map((e, t) => {
            if (e.endsWith(',')) {
              return e;
            }
            return e + (n.length - 1 === t ? '' : ',');
          })
          .join(''),
      );
    });
  }
  if (/hsl/.test(e)) {
    e = e.replace(/hsla?\(([^)]+)\)/g, (e: string, t: string) => {
      const n = t.trim().split(' ');
      return e.replace(
        t,
        n
          .map((e, t) => {
            if (e.endsWith(',')) {
              return e;
            }
            return e + (n.length - 1 === t ? '' : ',');
          })
          .join(''),
      );
    });
  }
  if (/var\([^)]+\)/.test(e)) {
    e = e.replace(/var\(([^)]+)\)/g, (e: string, t: string) => e.replace(t, t.replace(/\s/g, '_')));
  }
  if (e.endsWith('!important')) {
    return [e.replace(/\s*!important/, '').trim(), '!'];
  }
  return [e.trim(), ''];
}
function qp(e: string) {
  return e.startsWith('var(--');
}
const Gp = /-webkit-|-moz-|-ms-|-o-/g;
const Zp = /linear-gradient\(\s*to([\w\s]+),?([-\w()#%\s.]+)?,([-\w()#%\s.]+)?,?([-\w#%\s.]+)?\)$/;
const Kp = /linear-gradient\(\s*([^,]*),?([-\w()#%\s.]+)?,([-\w()#%\s.]+)?,?([-\w#%\s.]+)?\)$/;
const Xp = /(radial|conic)-gradient\(([-\w()#%\s.]+)?,([-\w()#%\s.]+)?,?([-\w#%\s.]+)?\)$/;
const Yp = '__comma__';
const Qp = ['align-self', 'align-items', 'align-content'];
const Jp = [
  'animation',
  'animation-name',
  'animation-duration',
  'animation-delay',
  'animation-timing-function',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',
];
const em = ['aspect-ratio'];
const tm = ['box-shadow', 'drop-shadow'];
const nm = ['box-sizing', 'box-decoration-break', 'box-shadow', 'drop-shadow'];
function box(e: string, t: string) {
  if (!nm.includes(e)) {
    return;
  }
  const [n, r] = Vp(t);
  if (e.startsWith('box-decoration')) {
    return `${r}box-decoration-${n}`;
  }
  if (e === 'box-sizing') {
    return `${r}box-${Fp(n)}`;
  }
  if (tm.includes(e)) {
    return `${r}shadow-[${n.split(' ').join('_')}]`;
  }
}
const im = ['contrast', 'brightness', 'saturate'];
const am = ['grayscale', 'invert', 'sepia'];
const om = ['filter', 'backdrop-filter'];
function filter(e: string, t: string) {
  if (!om.includes(e)) {
    return;
  }
  const [n, r] = Vp(t);
  const [, a, o] = n.match(/([\w-]+)\((.*)\)/)! as unknown as [string, string, string];
  if (im.includes(a) || am.includes(a)) {
    const e = jp(o);
    if (Number.isNaN(e)) {
      return `${r}${a}${$p(o)}`;
    }
    return `${r}${a}${$p(jp(o))}`;
  }
  switch (a) {
    case 'drop-shadow':
      return `${r}drop-${box(a, o)}`;
    case 'hue-rotate':
      return `${r}${a}${$p(o.slice(0, -3))}`;
    default:
      return `${r}${a}${$p(o)}`;
  }
}
const lm = ['backdrop-filter'];
const cm = [
  'background-color',
  'background-attachment',
  'background-position',
  'background-size',
  'background-image',
  'background',
  'background-blend-mode',
  'background-origin',
  'background-clip',
  'background-repeat',
];
const um = '\\d*\\.?\\d+(?:px|em|rem|%|vw|vh)?';
const dm = `(${um})\\s+(${um})`;
const hm = new RegExp(`${dm}\\s*,\\s*${dm}`);
function pm(e?: string, t?: string, n?: string) {
  let r = '';
  if (t && !n) {
    n = t;
    t = '';
  }
  if (e) {
    e = e.replaceAll(Yp, ',');
    const [t, n] = e.split(' ') as [string, string?];
    if (n) {
      r += ` from${$p(t)} from${$p(n)}`;
    } else if (t) {
      r += ` from${$p(t)}`;
    }
  }
  if (t) {
    t = t.replaceAll(Yp, ',');
    const [e, n] = t.split(' ') as [string, string?];
    if (n) {
      r += ` via${$p(e)} via${$p(n)}`;
    } else if (e) {
      r += ` via${$p(e)}`;
    }
  }
  if (n) {
    n = n.replaceAll(Yp, ',');
    const [e, t] = n.split(' ') as [string, string?];
    if (t) {
      r += ` to${$p(e)} to${$p(t)}`;
    } else if (e) {
      r += ` to${$p(e)}`;
    }
  }
  return r;
}
const mm = '__transform_to_unocss__';
function fm(e: string) {
  const t: Record<string, string> = {};
  let n = 0;
  e = (e = e.replace(/(rgba?|hsla?|lab|lch|hwb|color)\(\)*\)/, (e) => {
    t[n++] = e;
    return `${mm}${n}}`;
  }))
    .split(/\)\s*,/)
    .map((e) => `${e.replace(/\s*,\s*/g, ',').replace(/\s+/g, '_')}`)
    .join('),');
  Object.keys(t).forEach((n) => {
    e = e.replace(`${mm}${n}}`, t[n]!);
  });
  return e;
}
const gm = ['border-left', 'border-top', 'border-right', 'border-bottom'];
const vm: Record<string, string> = {
  inline: 'x',
  block: 'y',
  'inline-start': 's',
  'inline-end': 'e',
  top: 't',
  right: 'r',
  bottom: 'b',
  left: 'l',
};
const ym: Record<string, string> = {
  top: 't',
  right: 'r',
  bottom: 'b',
  left: 'l',
  end: 'e',
  start: 's',
};
const bm = ['color'];
const wm = ['column-gap'];
const km = ['content', 'content-visibility'];
const xm = ['cursor'];
const Em = ['display', 'visibility', 'position'];
function _m(e: string, t: string) {
  if (!Em.includes(e)) {
    return;
  }
  const [n, r] = Vp(t);
  switch (n) {
    case 'none':
      return `${r}hidden`;
    case 'hidden':
      return `${r}invisible`;
    default:
      return `${r}${n}`;
  }
}
const Sm: Record<string, string> = {
  show: 'visible',
  hide: 'hidden',
};
const Cm = ['empty-cells'];
const Am = ['flex-basis', 'flex-shrink'];
const Tm = ['flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'flex-wrap', 'flex-direction'];
const Rm = [
  'float',
  'clear',
  'pointer-events',
  'fill',
  'order',
  'perspective',
  'columns',
  'break-inside',
  'break-before',
];
function Mm(e: string, t: string) {
  if (!Rm.includes(e)) {
    return;
  }
  const [n, r] = Vp(t);
  Np.includes(n);
  return `${r}${e}${$p(n)}`;
}
const Lm = [
  'grid',
  'grid-row',
  'grid-column',
  'grid-template-columns',
  'grid-template-rows',
  'grid-auto-flow',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-column-start',
  'grid-column-end',
  'grid-row-start',
  'grid-row-end',
];
const Im = ['isolation'];
const Om = ['justify', 'justify-content', 'justify-items', 'justify-self'];
const Nm = ['letter-spacing'];
const Pm: Record<string, string> = {
  1: 'none',
  1.25: 'tight',
  1.375: 'snug',
  1.5: 'normal',
  1.625: 'relaxed',
  2: 'loose',
};
const Fm = ['line-height'];
const zm = [
  'list-style',
  'list-style-type',
  'list-style-position',
  'list-style-image',
  'caption-side',
  'appearance',
  'touch-action',
  'table-layout',
  'caret-color',
  'backface-visibility',
  'stroke-width',
  'stroke',
  'accent',
  'accent-color',
];
function Dm(e: string, t: string) {
  if (!zm.includes(e)) {
    return;
  }
  const [n, r] = Vp(t);
  if (e === 'list-style-image' && n === 'none') {
    return `${r}${Fp(e)}-none`;
  }
  return `${r}${Fp(e)}${$p(n)}`;
}
const Hm: Record<string, string> = {
  'margin-left': 'ml',
  'margin-right': 'mr',
  'margin-top': 'mt',
  'margin-bottom': 'mb',
  'margin-inline-start': 'ms',
  'margin-inline-end': 'me',
  'padding-left': 'pl',
  'padding-right': 'pr',
  'padding-top': 'pt',
  'padding-bottom': 'pb',
  'padding-inline-start': 'ps',
  'padding-inline-end': 'pe',
};
function Bm(e: string, t: string) {
  const [n, r] = Vp(t);
  const i = Hm[e];
  if (i) {
    return `${r}${i}${$p(n)}`;
  }
  const a = n.split(' ');
  const a_length = a.length;
  switch (a_length) {
    case 1:
      return `${r}${e[0]}${$p(a[0])}`;
    case 2:
      return `${r}${e[0]}x${$p(a[1])} ${r}${e[0]}y${$p(a[0])}`;
    case 3:
      return `${r}${e[0]}x${$p(a[1])} ${r}${e[0]}t${$p(a[0])} ${r}${e[0]}b${$p(a[2])}`;
    default:
      return `${r}${e[0]}t${$p(a[0])} ${r}${e[0]}b${$p(a[2])} ${r}${e[0]}l${$p(a[3])} ${r}${e[0]}r${$p(a[1])}`;
  }
}
const $m = [
  'mask-position',
  'mask-origin',
  'mask-repeat',
  'mask-size',
  'mask-type',
  'mask-image',
  'mask-mode',
  'mask-composite',
  'mask-clip',
  'mask-type',
];
function jm(e: string, t?: string, n?: string, r?: string) {
  let i = '';
  if (n && !r) {
    r = n;
    n = '';
  }
  if (t) {
    t = t.replaceAll(Yp, ',');
    const [n, r] = t.split(' ') as [string, string?];
    if (r) {
      i += ` ${e}-from-${Dp(n) || qp(n) ? `[${n}]` : n} ${e}-from${$p(r)}`;
    } else if (n) {
      i += ` ${e}-from-${Dp(n) || qp(n) ? `[${n}]` : n}`;
    }
  }
  if (n) {
    n = n.replaceAll(Yp, ',');
    const [t, r] = n.split(' ') as [string, string?];
    if (r) {
      i += ` ${e}-via${Dp(t) || qp(t) ? `[${t}]` : t} ${e}-via${$p(r)}`;
    } else if (t) {
      i += ` ${e}-via${Dp(t) || qp(t) ? `[${t}]` : t}`;
    }
  }
  if (r) {
    r = r.replaceAll(Yp, ',');
    const [t, n] = r.split(' ') as [string, string?];
    if (n) {
      i += ` ${e}-to-${Dp(t) || qp(t) ? `[${t}]` : t} ${e}-to${$p(n)}`;
    } else if (t) {
      i += ` ${e}-to-${Dp(t) || qp(t) ? `[${t}]` : t}`;
    }
  }
  return i;
}
const Um = [
  'max-height',
  'max-width',
  'max-block-size',
  'max-inline-size',
  'min-height',
  'min-width',
  'min-block-size',
  'min-inline-size',
];
function Wm(e: string, t: string) {
  if (!Um.includes(e)) {
    return;
  }
  const [n, r] = Vp(t);
  const i = e.split('-');
  const a = Pp(n) || qp(n) ? $p(n) : $p(Fp(n));
  return `${r}${i[0]}-${i[1]![0]}${a}`;
}
const Vm = ['object-fit', 'object-position'];
const qm = ['opacity'];
const Gm = ['outline-width', 'outline-style', 'outline-offset', 'outline', 'outline-color'];
const Zm = ['overflow', 'overflow-x', 'overflow-y', 'overflow-wrap'];
const Km = ['overscroll-behavior', 'overscroll-behavior-x', 'overscroll-behavior-y'];
const Xm = ['place-content', 'place-items', 'place-self'];
const Ym: Record<string, string> = {
  vertical: 'y',
  horizontal: 'x',
};
const Qm = ['row-gap'];
const Jm = [
  'scroll-snap-type',
  'scroll-snap-stop',
  'scroll-snap-align',
  'scroll-padding',
  'scroll-padding-inline',
  'scroll-padding-block',
  'scroll-padding-inline-start',
  'scroll-padding-inline-end',
  'scroll-padding-block-start',
  'scroll-padding-block-end',
  'scroll-padding-top',
  'scroll-padding-right',
  'scroll-padding-bottom',
  'scroll-padding-left',
  'scroll-margin',
  'scroll-margin-inline',
  'scroll-margin-block',
  'scroll-margin-inline-start',
  'scroll-margin-inline-end',
  'scroll-margin-block-start',
  'scroll-margin-block-end',
  'scroll-margin-top',
  'scroll-margin-right',
  'scroll-margin-bottom',
  'scroll-margin-left',
  'scroll-behavior',
];
const ef = ['width', 'height'];
function tf(e: string, t: string) {
  if (!ef.includes(e)) {
    return;
  }
  const [n, r] = Vp(t);
  return `${r}${e[0]}${$p(n, Bp(n) ? undefined : Fp)}`;
}
const nf = [
  'text-align',
  'text-align-last',
  'text-decoration',
  'text-decoration-line',
  'text-decoration-style',
  'text-decoration-color',
  'text-decoration-thickness',
  'text-indent',
  'text-underline-offset',
  'text-transform',
  'text-wrap',
  'text-overflow',
  'text-justify',
  'text-shadow',
];
const rf = [
  'top',
  'right',
  'bottom',
  'left',
  'field-sizing',
  'forced-color-adjust',
  'hyphens',
  'gap',
  'gap-x',
  'gap-y',
];
function af(e: string, t: string) {
  if (!rf.includes(e)) {
    return;
  }
  const [n, r] = Vp(t);
  return `${r}${e}${$p(n)}`;
}
const of = ['transform', 'transform-origin', 'transform-style'];
const sf = ['transition-delay', 'transition-duration'];
const lf = [
  'transition',
  'transition-property',
  'transition-duration',
  'transition-delay',
  'transition-timing-function',
  'transition-behavior',
];
const cf = ['user-select'];
const uf = ['vertical-align'];
const df = ['white-space'];
const hf = ['will-change'];
const pf: Record<string, string> = {
  auto: 'auto',
  'scroll-position': 'scroll',
  contents: 'contents',
  transform: 'transform',
};
const mf = ['word-break', 'word-spacing', 'word-wrap', 'overflow-wrap'];
const ff = ['writing-mode'];
const gf = ['z-index'];
const vf = ['0', '10', '20', '30', '40', '50', 'auto'];
const yf: Record<string, Rule> = {
  animation: function (e: string, t: string) {
    if (!Jp.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}animate-[${Wp(n)}]`;
  },
  aspect: function (e: string, t: string) {
    if (!em.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (n === 'auto') {
      return `${r}${Fp(e)}-${n}`;
    }
    return `${r}${Fp(e)}${$p(n)}`;
  },
  backface: Dm,
  caption: Dm,
  column: function (e: string, t: string) {
    if (!wm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e === 'column-gap') {
      return `${r}gap-x${$p(n)}`;
    }
    return `${r}${e}${$p(n)}`;
  },
  columns: Mm,
  break: Mm,
  empty: function (e: string, t: string) {
    if (!Cm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (Sm[n]) {
      return `${r}table-empty-cells-${Sm[n] ?? n}`;
    }
  },
  box,
  writing: function (e: string, t: string) {
    if (!ff.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (n === 'horizontal-tb') {
      return `${r}write-normal`;
    }
    return `${r}write-${n.replace('-rl', '-right').replace('-lr', '-left')}`;
  },
  display: _m,
  float: Mm,
  clear: Mm,
  isolation: function (e: string, t: string) {
    if (!Im.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (t === 'isolate') {
      return `${r}${n}`;
    }
    return `${r}${e}-${n}`;
  },
  object: function (e: string, t: string) {
    if (!Vm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e === 'object-position') {
      return `${r}${Fp(e)}-${Up(n)}`;
    }
    return `${r}${Fp(e)}-${n}`;
  },
  overflow: function (e: string, t: string) {
    if (!Zm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e === 'overflow-wrap') {
      return `${r}wrap-${n}`;
    }
    return `${r}${e}-${n}`;
  },
  overscroll: function (e: string, t: string) {
    if (!Km.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    const [i, , o] = e.split('-');
    if (o) {
      return `${r}${i}-${o}-${n}`;
    }
    return `${r}${i}-${n}`;
  },
  position: _m,
  top: af,
  hyphens: af,
  mask: function (e: string, t: string) {
    if (!$m.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (['mask-clip', 'mask-origin', 'mask-type'].includes(e)) {
      return `${r}${e}-${Fp(n)}`;
    }
    if (['mask-mode', 'mask-composite'].includes(e)) {
      return `${r}${Fp(e)}-${Fp(n)}`;
    }
    if (['mask-position', 'mask-size'].includes(e)) {
      if (Bp(n)) {
        return `${r}${e}${$p(n)}`;
      }
      if (/\d/.test(n)) {
        return `${r}[${e}:${Wp(n)}]`;
      }
      return `${r}${Fp(e)}-${Up(n)}`;
    }
    if (e === 'mask-repeat') {
      if (n.includes('-')) {
        return `${r}mask-${n}`;
      }
      return `${r}${e}-${n}`;
    }
    if (e === 'mask-image') {
      if (Hp(n)) {
        const e = n
          .replace(/rgba?\(([^)]+)\)/g, (e: string, t: string) =>
            e.replace(t, t.replace(/\s*,\s*/g, Yp)),
          )
          .match(Zp);
        if (!e) {
          return;
        }
        const [t0, r, i, a] = e.slice(1) as [string, string?, string?, string?];
        const t = t0
          .split(' ')
          .map((e) => e[0])
          .join('');
        const o = n.startsWith('linear-gradient')
          ? 'linear'
          : n.startsWith('radial-gradient')
            ? 'radial'
            : n.startsWith('conic-gradient')
              ? 'conic'
              : '';
        if (t) {
          return `${jm(`mask-${t}`, r, i, a).trim()}`;
        }
        return jm(`mask-${o}`, r, i, a).trim();
      }
      return `${r}mask${$p(n)}`;
    }
    return `${r}${e}${$p(n)}`;
  },
  field: af,
  forced: af,
  left: af,
  right: af,
  bottom: af,
  visibility: _m,
  z: function (e: string, t: string) {
    if (!gf.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (vf.includes(n)) {
      return `${r}${e[0]}-${n}`;
    }
    return `${r}${e[0]}${$p(n, undefined, undefined, true)}`;
  },
  flex: function (e: string, t: string) {
    if (!Tm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e === 'flex-shrink' && n === '1') {
      return `${r}shrink`;
    }
    if (e === 'flex-grow') {
      if (n === '1') {
        return `${r}flex-grow`;
      }
      return `${r}flex-grow-${n}`;
    }
    if (Am.includes(e)) {
      return `${r}${zp(e)}${$p(n)}`;
    }
    if (n === '1') {
      return `${r}flex-1`;
    }
    const i = n[0];
    if (e !== 'flex' || (i !== '0' && i !== '1')) {
      return `${r}${Fp(e)}-${n.replace('column', 'col')}`;
    }
    return `${r}flex-[${Wp(n)}]`;
  },
  order: Mm,
  grid: function (e: string, t: string) {
    if (!Lm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e.startsWith('grid-template')) {
      const t = n.match(/repeat\s*\(\s*(\d+)/);
      if (t) {
        return `${r}grid-${zp(e) === 'rows' ? 'rows' : 'cols'}-${t[1]}`;
      }
      return `${r}grid-${zp(e) === 'rows' ? 'rows' : 'cols'}-${n.includes(' ') ? `[${Wp(n)}]` : n}`;
    }
    if (e === 'grid-auto-flow') {
      return `${r}grid-flow-${Up(n).replace('column', 'col')}`;
    }
    if (e.startsWith('grid-auto')) {
      const t = n.match(/minmax\s*\(\s*0\s*,\s*1fr/);
      return `${r}auto-${zp(e) === 'rows' ? 'rows' : 'cols'}-${t ? 'fr' : Fp(n)}`;
    }
    const i = n.match(/span\s+(\d)/);
    if (i) {
      return `${r}${e.slice(5).replace('column', 'col')}-span-${i[1]}`;
    }
    if (n === '1/-1') {
      return `${r}${e.slice(5).replace('column', 'col')}-span-full`;
    }
    return `${r}${e.slice(5).replace('column', 'col')}-${n}`;
  },
  gap: af,
  justify: function (e: string, t: string) {
    if (!Om.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (n.includes(' ')) {
      return `${e}-${n.split(' ').reverse().map(zp).join('-')}${r}`;
    }
    if (e === 'justify-content') {
      return `${r}justify-${zp(n)}`;
    }
    return `${r}${e}-${zp(n)}`;
  },
  align: function (e: string, t: string) {
    if (!Qp.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}${zp(e)}-${n.split(' ').reverse().map(zp).join('-')}`;
  },
  place: function (e: string, t: string) {
    if (!Xm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (n.includes(' ')) {
      return `${e}-${n.split(' ').reverse().map(zp).join('-')}${r}`;
    }
    return `${r}${e}-${zp(n)}`;
  },
  padding: Bm,
  perspective: Mm,
  margin: Bm,
  width: tf,
  min: Wm,
  max: Wm,
  height: tf,
  font: function (e: string, t: string) {
    const [n, r] = Vp(t);
    if (e === 'font-size') {
      if (['inherit', 'initial', 'revert', 'unset', 'revert-layer'].includes(n)) {
        return `${r}font-size-${n}`;
      }
      return `${r}text${$p(n)}`;
    }
    if (e === 'font-weight') {
      return `${r}font-[weight:${n}]`;
    }
    if (e === 'font-family') {
      const e = n.match(/ui-(\w{0,4})/);
      if (!e) {
        return `${r}font-[family-name:${Wp(t)}]`;
      }
      const [, a] = e;
      return `${r}font-${a}`;
    }
    switch (e) {
      case 'font-style':
        switch (n) {
          case 'normal':
            return `${r}not-italic`;
          case 'italic':
            return `${r}italic`;
          default:
            return undefined;
        }
      case 'font-variant-numeric':
        if (n === 'normal') {
          return `${r}normal-nums`;
        }
        return `${r}${n}`;
      default:
        return ((e, t) =>
          e
            .split(' ')
            .map((e) => {
              if (/^\d/.test(e)) {
                return `${t}text-[${e}]`;
              }
              return `${t}font-${e}`;
            })
            .join(' '))(n, r);
    }
  },
  letter: function (e: string, t: string) {
    if (!Nm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}tracking${$p(n)}`;
  },
  line: function (e: string, t: string) {
    if (!Fm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (Pm[n]) {
      return `${r}leading-${Pm[n]}`;
    }
    return `${r}leading${$p(n, (e) => {
      if (/\d$/.test(e)) {
        return `[${e}]`;
      }
      return e;
    })}`;
  },
  list: Dm,
  text: function (e: string, t: string) {
    if (!nf.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (Np.includes(n)) {
      return `${r}text-${n}`;
    }
    if (e === 'text-decoration-line') {
      if (n === 'none') {
        return `${r}no-underline`;
      }
      return `${r}${n}`;
    }
    if (e === 'text-transform') {
      if (n === 'none') {
        return `${r}normal-case`;
      }
      return `${r}${n}`;
    }
    if (e === 'text-decoration') {
      return n
        .split(' ')
        .map((e) => {
          if (e) {
            return `${r}${e}`;
          }
          return '';
        })
        .join(' ');
    }
    if (e.startsWith('text-decoration') || e === 'text-indent') {
      return `${r}${e.split('-')[1]}${$p(n)}`;
    }
    if (e === 'text-underline-offset') {
      return `${r}underline-offset-${n}`;
    }
    if (['inherit', 'initial', 'revert', 'unset', 'revert-layer'].includes(n)) {
      return `${r}text-align-${n}`;
    }
    return `${r}text${$p(n)}`;
  },
  vertical: function (e: string, t: string) {
    if (!uf.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}align${$p(n)}`;
  },
  white: function (e: string, t: string) {
    if (!df.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}whitespace-${n}`;
  },
  word: function (e: string, t: string) {
    if (!mf.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e.startsWith('word-spacing')) {
      return `${r}word-spacing${$p(t)}`;
    }
    if (n === 'keep-all') {
      return `${r}break-keep`;
    }
    if (n === 'break-word') {
      return `${r}break-words`;
    }
    return `${r}break-${zp(n)}`;
  },
  content: function (e: string, t: string) {
    if (!km.includes(e)) {
      return;
    }
    const [n, r] = Vp(t, false);
    if (e === 'content-visibility') {
      return `content-visibility-${n}${r}`;
    }
    const i = n.match(/^(["'])(.*?)\1$/);
    if (i) {
      return `content-['${i[2]!.replace(/\s/g, '_')}']${r}`;
    }
    return `content-[${n}]${r}`;
  },
  background: function e(t: string, n: string): string | undefined {
    if (!cm.includes(t)) {
      return;
    }
    const [r0, i] = Vp(n);
    let r = r0;
    if (t === 'background-size') {
      if (/\d/.test(r)) {
        return `${i}bg${$p(r, Wp, 'length:', true)}`;
      }
      return `${i}bg${$p(r, Up, 'length:')}`;
    }
    if (t === 'background-position') {
      /\d/.test(r);
      return `${i}bg${$p(r, Wp, 'position:')}`;
    }
    if (['background-color', 'background-attachment'].includes(t)) {
      return `${i}bg${$p(r, Wp)}`;
    }
    if (['background', 'background-image'].includes(t)) {
      const a = r;
      if (Ip.test(a) || Op.test(a) || Np.includes(a)) {
        return `${i}bg${$p(r, Up, 'position:')}`;
      }
      const n = r.replace(/rgba?\([^)]+\)/g, 'temp');
      if (/\)\s*,/.test(n)) {
        return `bg-[${fm(r)}]`;
      }
      if (r.startsWith('linear-gradient')) {
        const e = r.replace(/rgba?\(([^)]+)\)/g, (e: string, t: string) =>
          e.replace(t, t.replace(/\s*,\s*/g, Yp)),
        );
        const t = e.match(Zp);
        if (t) {
          const [e0, n, r, i] = t.slice(1) as [string, string?, string?, string?];
          const e = e0
            .split(' ')
            .map((e) => e[0])
            .join('');
          if (e) {
            return `bg-gradient-to-${e}${pm(n, r, i)}`;
          }
          return pm(n, r, i);
        }
        const n = e.match(Kp);
        if (n) {
          return `bg-gradient-linear bg-gradient-[${n[1]}${n[2] ? `,${n[2].replace(/\s+/, '_').replaceAll(Yp, ',')}` : ''},${n[3]!.replace(/\s+/, '_').replaceAll(Yp, ',')}]`;
        }
        return `bg-[${fm(r)}]`;
      }
      if (/^(?:radial|conic)-gradient/.test(r)) {
        const e = r
          .replace(/rgba?\(([^)]+)\)/g, (e: string, t: string) =>
            e.replace(t, t.replace(/\s*,\s*/g, Yp)),
          )
          .match(Xp);
        if (!e) {
          return '';
        }
        const t = e[1];
        const [n, i, a] = e.slice(2);
        return `bg-gradient-${t}${pm(n, i, a)}`;
      }
      const o = r.match(/^rgba?\([^)]+\)$/);
      if (o) {
        const e = o[0];
        r = r.replace(e, `[${e}]`);
      }
      const s = r.match(/^url\(["'\s.\-\w/@]*\)$/);
      if (s) {
        return `bg-${r.replace(s[0], `[${s[0].replace(/['"]/g, '')}]${i}`)}`;
      }
      const l = new Map();
      let c = 0;
      const u = r
        .replace(/url\([^)]+\)/g, (e) => {
          const t = `__URL__${c++}`;
          l.set(t, e);
          return t;
        })
        .replace(/rgba?\([^)]+\)/g, (e) => {
          const t = `__RGBA__${c++}`;
          l.set(t, e);
          return t;
        });
      if (u.includes('/')) {
        const [n, r] = u.split('/').map((e) => e.trim()) as [string, string];
        const a = r.split(/\s+/);
        const o = a.slice(0, 2);
        const s = a.slice(2).map((e) => {
          const t = e.match(/__URL__(\d+)/);
          if (t) {
            return l.get(`__URL__${t[1]}`);
          }
          const n = e.match(/__RGBA__(\d+)/);
          if (n) {
            return l.get(`__RGBA__${n[1]}`);
          }
          return e;
        });
        const c = o.join(' ');
        const d = e('background-position', `${n}${i ? ' !important' : ''}`);
        const h = c ? e('background-size', `${c}${i ? ' !important' : ''}`) : '';
        let p = '';
        if (s.length) {
          p = s.map((n) => e(t, `${n}${i ? ' !important' : ''}`)).join(' ');
        }
        return [d, h, p].filter(Boolean).join(' ');
      }
      if (u.includes(' ')) {
        const n = u.match(hm);
        if (n) {
          const r = u
            .replace(n[0], '')
            .trim()
            .split(' ')
            .map((e) => {
              const t = e.match(/__URL__(\d+)/);
              if (t) {
                return l.get(`__URL__${t[1]}`);
              }
              const n = e.match(/__RGBA__(\d+)/);
              if (n) {
                return l.get(`__RGBA__${n[1]}`);
              }
              return e;
            });
          let a = '';
          if (r.length) {
            a = r.map((n) => e(t, `${n}${i ? ' !important' : ''}`)).join(' ');
          }
          return [e('background-position', `${n[0]}${i ? ' !important' : ''}`), a]
            .filter(Boolean)
            .join(' ');
        }
        let r = u
          .split(/\s+/)
          .map((e) => {
            const t = e.match(/__URL__(\d+)/);
            if (t) {
              return l.get(`__URL__${t[1]}`);
            }
            const n = e.match(/__RGBA__(\d+)/);
            if (n) {
              return l.get(`__RGBA__${n[1]}`);
            }
            return e;
          })
          .map((n) => e(t, `${n}${i ? ' !important' : ''}`))
          .join(' ');
        const a = /bg-\[position:([^\]]*)\]/g;
        const o = r.match(a);
        if (o && o.length > 1) {
          const e = `bg-[position:${o.map((e) => e.replace(a, '$1')).join('_')}]`;
          r = `${r
            .replace(a, '')
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(Boolean)
            .concat([e])
            .join(' ')}`;
        }
        return r;
      }
      return `${i}bg${$p(r, Up)}`;
    }
    if (t === 'background-blend-mode') {
      return `${i}bg-blend-${r}`;
    }
    return `${i}${((e, t) => {
      if (t.endsWith('repeat')) {
        return 'bg';
      }
      return e.replace('background', 'bg');
    })(t, r)}-${((e) => {
      if (/border|content|padding-box/.test(e)) {
        return e.replace('-box', '');
      }
      if (e.startsWith('repeat-')) {
        return e.replace('repeat-', '');
      }
      return Up(e);
    })(r)}`;
  },
  border: function (e: string, t: string) {
    const [n, r] = Vp(t);
    if (e === 'border-spacing') {
      return `${r}${e}${$p(n, Wp, '', true)}`;
    }
    if (e === 'border-color') {
      return `${r}border${$p(n)}`;
    }
    const i = e.match(/border(-start|-end|-top|-bottom)?(-start|-end|-left|-right)?-radius/);
    if (i) {
      const [, t, a] = i;
      if (t && a) {
        return `${r}rounded-${ym[t.slice(1)]}${ym[a.slice(1)]}${$p(n, Wp)}`;
      }
      if (t || a) {
        return `${r}rounded-${ym[(t?.slice(1) || a?.slice(1))!]}${$p(n, Wp)}`;
      }
      return `${r}rounded${$p(n, Wp, '', true)}`;
    }
    const a = e.match(
      /border(-inline|-block|-inline-start|-inline-end|-top|-right|-bottom|-left)?-(width|color)/,
    );
    if (a) {
      if (a[1]) {
        const e = vm[a[1].slice(1)];
        return `${r}border-${e}${$p(n, Wp, 'length:')}`;
      }
      return `${r}border${$p(n, Wp, 'length:')}`;
    }
    if (gm.some((t) => e.startsWith(t))) {
      const t = e.split('-');
      if (t.slice(-1)[0] === 'radius') {
        return n
          .split(' ')
          .map(
            (e) =>
              `${r}rounded-${t
                .slice(1, -1)
                .map((e) => e[0])
                .join('')}${$p(e)}`,
          )
          .join(' ');
      }
      return n
        .split(' ')
        .filter((e) => e !== 'solid')
        .map((t) => `${r}border-${e.split('-')[1]![0]}${$p(t)}`)
        .join(' ');
    }
    if (e.startsWith('border-image')) {
      return undefined;
    }
    if (/^\d[%|(px)rem]$/.test(n) || e === 'border-collapse') {
      return `${r}border-${n}`;
    }
    if (e === 'border-width' || e === 'border-style') {
      return `${r}border${$p(n)}`;
    }
    if (e === 'border-color') {
      if (n === 'currentColor') {
        return `${r}border-current`;
      }
      return `${r}border${$p(n)}`;
    }
    return n
      .split(' ')
      .map((e) => {
        if (n === 'currentColor') {
          return `${r}border-current`;
        }
        return `${r}border${$p(e)}`;
      })
      .join(' ');
  },
  outline: function (e: string, t: string) {
    if (!Gm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e === 'outline-offset') {
      return `${r}${e}-${n}`;
    }
    return `${r}${Fp(e)}-${n}`;
  },
  opacity: function (e: string, t: string) {
    if (!qm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (t.endsWith('%')) {
      return `${r}op-${n.replace(/%/g, '')}`;
    }
    return `${r}op-${100 * Number(n)}`;
  },
  mix: function (e: string, t: string) {
    const [n, r] = Vp(t);
    return `${r}mix-blend-${n}`;
  },
  filter,
  backdrop: function (e: string, t: string) {
    if (!lm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}backdrop-${filter(e, n)}`;
  },
  table: Dm,
  transition: function (e: string, t: string) {
    if (!lf.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e === 'transition-timing-function') {
      if (n === 'linear') {
        return `${r}ease-${n}`;
      }
      return `${r}ease-[${n}]`;
    }
    if (e === 'transition') {
      return ((e, t) => {
        let n = false;
        return e
          .split(' ')
          .map((e) => {
            if (/^\d/.test(e) || /^\.\d/.test(e)) {
              if (n) {
                return `${t}delay${$p(e, undefined)}`;
              }
              return ((n = true), `${t}duration${$p(e, undefined)}`);
            }
            if (e === 'background-color') {
              return `${t}transition-colors`;
            }
            if (
              /^(?:linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/.test(e) ||
              e.startsWith('cubic-bezier') ||
              e.startsWith('steps')
            ) {
              return `${t}ease-[${e}]`;
            }
            return `${t}transition${$p(e)}`;
          })
          .join(' ');
      })(n, r);
    }
    if (e === 'transition-property') {
      if (n.includes('color')) {
        return `${r}transition-color`;
      }
      if (n === 'box-shadow') {
        return `${r}transition-shadow`;
      }
      return `${r}transition-${n}`;
    }
    if (e === 'transition-behavior') {
      return `${r}transition-${zp(n)}`;
    }
    const i = $p(n);
    if (i === `-${n}` && sf.includes(e)) {
      let t = n.trim();
      if (t.endsWith('ms')) {
        t = t.replace(/ms$/, '');
      } else if (t.endsWith('s')) {
        t = (1000 * Number.parseFloat(t.replace(/s$/, ''))).toString();
      }
      return `${r}${e.split('-')[1]}-${t}`;
    }
    return `${r}${e.split('-')[1]}${i}`;
  },
  transform: function (e: string, t: string) {
    if (!of.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e === 'transform-origin') {
      if (qp(n) || Pp(n)) {
        return `${r}origin${$p(n)}`;
      }
      return `${r}origin-${/\d/.test(n) && n.includes(' ') ? `[${Wp(n)}]` : Up(n)}`;
    }
    if (e === 'transform-style') {
      return `${r}transform-${n}`;
    }
    if (t === 'none') {
      return `${r}${e}-none`;
    }
    return n
      .replace(/\(\s*/g, '(')
      .replace(/\s*\)/g, ')')
      .replace(/\s*,\s*/g, ',')
      .split(' ')
      .map((e) => {
        const t = e.match(/([a-z]+)(3d)?([A-Z])?\((.*)\)/);
        if (!t) {
          return;
        }
        const [, i, , o, s] = t as unknown as [
          string,
          string,
          string | undefined,
          string | undefined,
          string,
        ];
        if (o) {
          const e = s.replace(/,(?![^()]*\))/g, ' ').split(' ');
          if (e.length > 1) {
            return `${r}${i}-[${o.toLowerCase()}-${e
              .map((e) => {
                if (qp(e)) {
                  return e;
                }
                return $p(i === 'scale' ? jp(e) : e);
              })
              .join('_')}]`;
          }
          return `${r}${i}-${o.toLowerCase()}${qp(e[0]!) ? `-[${e[0]!}]` : $p(i === 'scale' ? jp(e[0]!) : e[0]!)}`;
        }
        {
          const e = s.replace(/,(?![^()]*\))/g, ' ').split(' ');
          if (i === 'scale') {
            if (e.length > 1) {
              return `${r}${i}-[${e.join('_')}]`;
            }
            return `${r}${i}${qp(s) || Pp(s) ? `-[${s}]` : $p(i === 'scale' ? jp(s) : s)}`;
          }
          const [t, n] = e;
          return `${r}${i}-x${$p(t)} ${r}${i}-y${$p(n ?? t)}`;
        }
      })
      .filter(Boolean)
      .join(' ');
  },
  accent: Dm,
  appearance: Dm,
  cursor: function (e: string, t: string) {
    if (!xm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}${e}${$p(n)}`;
  },
  caret: Dm,
  pointer: Mm,
  resize: function (e: string, t: string) {
    const [n, r] = Vp(t);
    if (n === 'both') {
      return `${r}${e}`;
    }
    return `${r}${e}-${Ym[n] || n}`;
  },
  scroll: function (e: string, t: string) {
    if (!Jm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (e.startsWith('scroll-snap')) {
      if (n.includes(' ')) {
        const [e, t] = n.split(' ') as [string, string?];
        return `${r}snap-${e}${$p(t)}`;
      }
      return `${r}snap-${n}`;
    }
    if (e === 'scroll-behavior') {
      return `${r}scroll-${n}`;
    }
    const [, a, o, s] = e.match(/scroll-(margin|padding)-?(\w+)?-?(\w+)?/)! as unknown as [
      string,
      string,
      string?,
      string?,
    ];
    if (o === 'inline' && s) {
      return `${r}scroll-${a[0]}${s[0]}${$p(n)}`;
    }
    if (o) {
      return `${r}scroll-${a[0]}${o[0]}${$p(n)}`;
    }
    return `${r}scroll-${a[0]}${$p(n)}`;
  },
  touch: Dm,
  user: function (e: string, t: string) {
    if (!cf.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}${zp(e)}-${n}`;
  },
  will: function (e: string, t: string) {
    if (!hf.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    if (n in pf) {
      return `will-change-${pf[n]}${r}`;
    }
    return `${r}${e}-[${Wp(n)}]`;
  },
  fill: Mm,
  stroke: Dm,
  color: function (e: string, t: string) {
    if (!bm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}text${$p(n)}`;
  },
  row: function (e: string, t: string) {
    if (!Qm.includes(e)) {
      return;
    }
    const [n, r] = Vp(t);
    return `${r}gap-y${$p(n)}`;
  },
};
const bf = /([\w-]+)\s*:\s*([^;]+)/;
function wf(e: string, t?: boolean) {
  const r = e.replace(Gp, '').match(bf);
  if (!r) {
    return;
  }
  const [, a, o] = r as unknown as [string, string, string];
  const s = Fp(a);
  const l = yf[s]?.(a, o);
  if (l && t) {
    return l.replace(/-\[([0-9.]+)px\]/g, (e: string, t: string) => `-[${Number(t) / 16}rem]`);
  }
  return l;
}
function kf(e: Template) {
  return (t: Record<string, string>): Transformed => {
    const n = e.anyMatch || [];
    const r = e.priority || [];
    if (
      n.length > 0 &&
      !n.find(
        (e) =>
          t[e.key] &&
          (e.pattern instanceof RegExp ? e.pattern.test(t[e.key]!) : t[e.key] === e.pattern),
      )
    ) {
      return {
        transformedResult: '',
        deleteKeys: [],
      };
    }
    let a = '';
    if (n.length > 0 && r.length > 0) {
      for (const e of r) {
        const r = n.find((t) => t.key === e);
        if (
          r &&
          t[e] &&
          (r.pattern instanceof RegExp ? r.pattern.test(t[e]!) : t[e] === r.pattern)
        ) {
          a = t[e];
          break;
        }
      }
    }
    const o = {
      ...e.allMatch,
    };
    const s = Object.keys(o);
    for (const e of s) {
      const n = o[e];
      if (!(n instanceof RegExp ? n.test(t[e]!) : t[e] === n)) {
        return {
          transformedResult: '',
          deleteKeys: [],
        };
      }
    }
    const deleteKeys = [...s, ...n.map((e) => e.key)];
    return {
      transformedResult:
        typeof e.outputTemplate === 'function'
          ? e.outputTemplate(a)
          : e.outputTemplate.replace('${value}', a),
      deleteKeys,
    };
  };
}
const xf: Record<string, (t: Record<string, string>) => Transformed> = {
  'line-clamp-${number}': kf({
    allMatch: {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
    },
    anyMatch: [
      {
        key: '-webkit-line-clamp',
        pattern: /\d/,
      },
      {
        key: 'line-clamp',
        pattern: /\d/,
      },
    ],
    priority: ['line-clamp', '-webkit-line-clamp'],
    outputTemplate: (e) => `line-clamp-${e}`,
  }),
  'line-clamp-${prop}': kf({
    allMatch: {
      overflow: 'visible',
      display: 'block',
      '-webkit-box-orient': 'horizontal',
    },
    anyMatch: [
      {
        key: '-webkit-line-clamp',
        pattern: /inherit|initial|revert|unset/,
      },
      {
        key: 'line-clamp',
        pattern: /inherit|initial|revert|unset/,
      },
    ],
    priority: ['line-clamp', '-webkit-line-clamp'],
    outputTemplate: (e) => `line-clamp-${e}`,
  }),
  truncate: kf({
    allMatch: {
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      'white-space': 'nowrap',
    },
    outputTemplate: () => 'truncate',
  }),
};

/** Port of Ef (:19619): `prop: value; …` → [classes, declarations nothing matched]. */
export function toTailwind(style: string, isRem = false): [string, string[]] {
  const noTransfer: string[] = [];
  const seen = new Set<string>();
  const decls: Record<string, string> = {};
  for (const item of style.split(';').filter(Boolean)) {
    let depth = 0;
    let at = -1;
    for (let n = 0; n < item.length; n++) {
      const c = item[n];
      if (c === '[') depth++;
      else if (c === ']') depth--;
      else if (c === ':' && depth === 0) {
        at = n;
        break;
      }
    }
    if (at === -1) continue;
    const k = item.substring(0, at).trim();
    const v = item.substring(at + 1).trim();
    if (k && v) decls[k] = v;
  }
  const pre: string[] = [];
  for (const name in xf) {
    const { transformedResult, deleteKeys } = xf[name]!(decls);
    if (transformedResult && deleteKeys.length) {
      pre.push(transformedResult);
      for (const k of deleteKeys) delete decls[k];
    }
  }
  const rest = Object.entries(decls)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
  const converted = rest
    .split(';')
    .filter(Boolean)
    .reduce((acc, item) => {
      const key = item.replaceAll(Gp, '').trim();
      if (seen.has(key)) return acc;
      seen.add(key);
      const s = wf(key, isRem) || '';
      if (!s) noTransfer.push(item);
      return acc + `${s} `;
    }, '')
    .trim()
    .replace(/\s+/g, ' ');
  return [[pre.join(' '), converted].filter(Boolean).join(' '), noTransfer];
}

/** Legacy `wg` (:20991): v3 names the generator emits → their v4 names (6.24). */
export const V4_RENAMES: Record<string, string> = {
  'shadow-sm': 'shadow-xs',
  shadow: 'shadow-sm',
  'drop-shadow-sm': 'drop-shadow-xs',
  'drop-shadow': 'drop-shadow-sm',
  'blur-sm': 'blur-xs',
  blur: 'blur-sm',
  'backdrop-blur-sm': 'backdrop-blur-xs',
  'backdrop-blur': 'backdrop-blur-sm',
  'rounded-sm': 'rounded-xs',
  rounded: 'rounded-sm',
  'outline-none': 'outline-hidden',
  ring: 'ring-3',
  'flex-shrink-0': 'shrink-0',
  'flex-shrink': 'shrink',
  'flex-grow-0': 'grow-0',
  'flex-grow': 'grow',
  'overflow-ellipsis': 'text-ellipsis',
  'decoration-slice': 'box-decoration-slice',
  'decoration-clone': 'box-decoration-clone',
};

/** One lookup per class, so `shadow-sm → shadow-xs` never gets renamed a second time. */
export const toV4 = (classes: string[]): string[] => classes.map((c) => V4_RENAMES[c] ?? c);

/**
 * The panel's Tailwind view (legacy sidepanel.js:15763): the `css` map, in order, through the
 * generator, then v4 names. '' when the generator throws, as legacy.
 */
export function tailwindClasses(css: Record<string, string>): string {
  const style = Object.entries(css)
    .filter(([, v]) => v != null && v !== '')
    .map(([p, v]) => `${p}: ${v}`)
    .join('; ');
  try {
    const [classes] = toTailwind(style);
    return toV4(classes.replace(/,\s*$/, '').trim().split(' ')).join(' ');
  } catch {
    return '';
  }
}
