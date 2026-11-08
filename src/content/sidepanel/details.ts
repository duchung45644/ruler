import { renderedFont } from '../../lib/css/inspect';
import { cssRulesOf } from '../../lib/css/matched';
import { isRendered } from '../../lib/dom/dom';
import { childrenOf, collectAssetRefs } from '../../lib/element/assets';
import { boxModel } from '../../lib/element/box';
import { canvasInfo, canvasPalette, PALETTE_SAMPLE } from '../../lib/element/canvas';
import { colorsOf, elementColors } from '../../lib/element/colors';
import { parseGradients } from '../../lib/element/gradients';
import { compactTracks, elementLayout } from '../../lib/element/layout';
import { animations, transitions } from '../../lib/element/motion';
import { splitShadows } from '../../lib/element/shadow';
import { rgbify } from '../../lib/element/style';
import type {
  CssMap,
  ElementColors,
  ElementDetails,
  ElementType,
  Keyframe,
  TypographyStyle,
} from '../../lib/element/types';
import { typographyKey, typographyStyles } from '../../lib/element/typography';
import { displaySelector, fullPath } from '../../lib/dom/selector';
import { isTextHeavy } from '../core/contrast';
import { childOf } from '../tools/inspector';
import { collectIssues } from './issues';
import { skippedCrossOriginCount } from './rules';

const MAX_DEPTH = 100;
const isOwn = (el: Element) => el.tagName.toLowerCase() === 'iodob-ui';

/**
 * What each element under the selection contributed, for the panel's hover highlights
 * (legacy elementStyleMap, content.js:27140). Rebuilt on every collect.
 */
export const styleMap = new Map<Element, { colors: Set<string>; typographyKey?: string }>();

type Mark = (el: Element, patch: { colors?: string[]; typographyKey?: string }) => void;

const mark: Mark = (el, patch) => {
  let entry = styleMap.get(el);
  if (!entry) styleMap.set(el, (entry = { colors: new Set() }));
  for (const c of patch.colors ?? []) entry.colors.add(c);
  if (patch.typographyKey) entry.typographyKey = patch.typographyKey;
};
/** For one-off reads (MCP): leaves the selection's styleMap alone. */
const noMark: Mark = () => {};

/** Legacy `E` (content.js:40005). */
function elementType(el: Element): ElementType {
  const t = el.tagName.toLowerCase();
  const map: Record<string, ElementType> = {
    img: 'image',
    video: 'video',
    audio: 'audio',
    a: 'link',
  };
  if (map[t]) return map[t];
  if (t === 'button') return 'button';
  if (t === 'input' || t === 'textarea') return 'input';
  if (t === 'svg' || t === 'path') return 'svg';
  if (t === 'ul' || t === 'ol' || t === 'li') return 'list';
  if ('h1 h2 h3 h4 h5 h6 p code em strong b i u small sub sup'.split(' ').includes(t))
    return 'text';
  return 'box';
}

const INLINE = 'b i em strong u span small mark code li'.split(' ');

/** Legacy `S` (content.js:40047): text of text-heavy elements, unless it holds > 2 blocks. */
function textOf(el: Element, type: ElementType): string | undefined {
  if (!isTextHeavy(el)) return undefined;
  const text = (el as HTMLElement).innerText ?? el.textContent ?? '';
  if (type === 'text') return text;
  const blocks = [...el.children].filter((c) => !INLINE.includes(c.tagName.toLowerCase()));
  return text.trim() && blocks.length <= 2 ? text.trim() : undefined;
}

/** Port of getCanvasColors (content.js:41375): sample a 64 × 64 copy; tainted → []. */
function canvasColors(el: HTMLCanvasElement): string[] {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = PALETTE_SAMPLE;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];
    ctx.drawImage(el, 0, 0, PALETTE_SAMPLE, PALETTE_SAMPLE);
    const { data } = ctx.getImageData(0, 0, PALETTE_SAMPLE, PALETTE_SAMPLE);
    return canvasPalette(data, PALETTE_SAMPLE, PALETTE_SAMPLE);
  } catch {
    return [];
  }
}

/** getSelectionColors walk (content.js:41459): hidden subtrees are skipped whole. */
function collectColors(root: Element, mark: Mark): ElementColors {
  const parts: ElementColors[] = [];
  const walk = (el: Element, depth: number) => {
    if (depth > MAX_DEPTH || isOwn(el)) return;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return;
    const own = colorsOf(s);
    parts.push(own);
    const all = [...own.text, ...own.backgrounds, ...own.borders];
    if (all.length) mark(el, { colors: all });
    if (el instanceof HTMLCanvasElement)
      parts.push({ text: [], backgrounds: canvasColors(el), borders: [] });
    for (const c of childrenOf(el)) walk(c, depth + 1);
  };
  walk(root, 0);
  return elementColors(parts);
}

/** Rendered samples by what they depend on; selections on one page keep meeting the same styles. */
const samples = new Map<string, TypographyStyle['sample']>();

/** Port of renderTypographyVector (content.js:41708): the pangram in the page's own font. */
function typographySample(s: CSSStyleDeclaration): TypographyStyle['sample'] {
  const key = [s.fontWeight, s.fontSize, s.fontFamily, s.textTransform, s.letterSpacing].join('|');
  const loading = document.fonts?.status === 'loading';
  if (!loading && samples.has(key)) return samples.get(key);
  const out = drawSample(s);
  if (!loading) {
    if (samples.size >= 200) samples.clear();
    samples.set(key, out);
  }
  return out;
}

function drawSample(s: CSSStyleDeclaration): TypographyStyle['sample'] {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const size = Math.min(parseFloat(s.fontSize), 40);
    const px = 2 * size;
    let text = 'The quick brown fox jumps over the lazy dog';
    if (s.textTransform === 'uppercase') text = text.toUpperCase();
    else if (s.textTransform === 'lowercase') text = text.toLowerCase();
    else if (s.textTransform === 'capitalize')
      text = text.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    const font = `${s.fontWeight} ${px}px ${s.fontFamily}`;
    ctx.font = font;
    canvas.width = Math.ceil(ctx.measureText(text).width) + 16;
    canvas.height = Math.max(1.5 * px, 32);
    ctx.font = font; // resizing resets the context
    ctx.fillStyle = '#1f1f1f';
    ctx.textBaseline = 'middle';
    const y = canvas.height / 2 + 0.08 * px;
    const spacing = s.letterSpacing;
    if (spacing && spacing !== 'normal') {
      const extra = (parseFloat(spacing) / size) * px;
      let x = 8;
      for (const ch of text) {
        ctx.fillText(ch, x, y);
        x += ctx.measureText(ch).width + extra;
      }
    } else ctx.fillText(text, 8, y);
    return { dataUrl: canvas.toDataURL('image/png'), height: canvas.height / 2 };
  } catch {
    return undefined;
  }
}

/** The first `limit` elements under `root` in tree order, through open shadow roots (legacy `se(e, '*')`). */
function descendants(root: Element, limit = Infinity): Element[] {
  const out: Element[] = [];
  const walk = (el: Element) => {
    for (const c of childrenOf(el)) {
      if (out.length >= limit) return;
      if (isOwn(c)) continue;
      out.push(c);
      walk(c);
    }
  };
  walk(root);
  return out;
}

/** Same as `!!el.textContent?.trim()` without building the subtree's whole text. */
function hasText(el: Element): boolean {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (/\S/.test((n as Text).data)) return true;
  return false;
}

/** getElementTypography (content.js:41584): the first 100 rendered elements with text. */
function collectTypography(root: Element, mark: Mark): TypographyStyle[] {
  const items: { style: CSSStyleDeclaration; family: string }[] = [];
  for (const el of [root, ...descendants(root, 99)]) {
    if (!hasText(el) || !isRendered(el)) continue;
    const s = getComputedStyle(el);
    const family = renderedFont(s);
    const key = typographyKey(family, s);
    if (!key) continue;
    mark(el, { typographyKey: key });
    items.push({ style: s, family });
  }
  const styles = typographyStyles(items);
  for (const t of styles) {
    const src = items.find((i) => typographyKey(i.family, i.style) === t.typographyKey);
    if (src) t.sample = typographySample(src.style);
  }
  return styles;
}

const plain = (k: Keyframe | Record<string, unknown>): Keyframe => {
  const out: Keyframe = { offset: Number(k.offset ?? k.computedOffset ?? 0) };
  for (const [p, v] of Object.entries(k))
    if (!['offset', 'computedOffset', 'easing', 'composite'].includes(p) && v != null)
      out[p] = typeof v === 'number' ? v : String(v);
  return out;
};

/** `@keyframes name` from readable sheets (legacy `M`, content.js:40093). */
function sheetKeyframes(name: string): Keyframe[] {
  const byOffset = new Map<number, Keyframe>();
  const walk = (rules: CSSRuleList) => {
    for (const r of rules) {
      if (r instanceof CSSKeyframesRule && r.name === name) {
        for (const k of r.cssRules) {
          const kf = k as CSSKeyframeRule;
          const props: Record<string, string> = {};
          for (let i = 0; i < kf.style.length; i++) {
            const p = kf.style.item(i);
            props[p] = kf.style.getPropertyValue(p).trim();
          }
          for (const key of kf.keyText.split(',').map((s) => s.trim())) {
            const offset =
              key === 'from'
                ? 0
                : key === 'to'
                  ? 1
                  : key.endsWith('%')
                    ? parseFloat(key) / 100
                    : NaN;
            if (!Number.isNaN(offset)) byOffset.set(offset, { ...props, offset });
          }
        }
      } else if ('cssRules' in r && r.cssRules) walk(r.cssRules as CSSRuleList);
    }
  };
  for (const sheet of document.styleSheets) {
    const rules = cssRulesOf(sheet); // null: cross-origin sheet
    if (rules) walk(rules);
  }
  return [...byOffset.values()].sort((a, b) => a.offset - b.offset);
}

/** Running animation's keyframes, else the stylesheet's when those carry no properties. */
function keyframesOf(el: Element, name: string): Keyframe[] {
  let frames: Keyframe[] = [];
  try {
    const a = el.getAnimations?.().find((x) => (x as CSSAnimation).animationName === name) as
      CSSAnimation | undefined;
    frames = (a?.effect as KeyframeEffect | null)?.getKeyframes().map(plain) ?? [];
  } catch {
    // getAnimations missing or the effect is gone: fall back to the stylesheet
  }
  if (frames.every((f) => Object.keys(f).length === 1)) {
    const fromSheet = sheetKeyframes(name);
    if (fromSheet.length) return fromSheet;
  }
  return frames;
}

const ZERO = (v: string) => (v.split(' ').every((p) => p === '0px') ? undefined : v);
const COLOR_PROPS = new Set([
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
]);
/** Computed / pseudo props legacy lists (content.js:40661). */
const PSEUDO_PROPS =
  'content width height margin padding border display grid-template-columns grid-template-rows gap justify-items align-items justify-content align-content box-sizing border-radius background box-shadow filter position top right bottom left font-size font-family font-weight font-style text-align white-space line-height color letter-spacing text-decoration'.split(
    ' ',
  );

/** Unitless ratio of line-height to font-size, legacy style. */
function lineHeight(lh: string, fontSize: string): string {
  const l = parseFloat(lh);
  const f = parseFloat(fontSize);
  return !Number.isNaN(l) && f > 0 ? `${Math.round((l / f) * 100) / 100}` : lh;
}

const BG_DEFAULTS: Record<string, string> = {
  'background-color': 'rgba(0, 0, 0, 0)',
  'background-image': 'none',
  'background-repeat': 'repeat',
  'background-attachment': 'scroll',
  'background-position': '0% 0%',
  'background-size': 'auto',
  'background-origin': 'padding-box',
  'background-clip': 'border-box',
};

/** Legacy `w` (content.js:39908): the non-default background longhands joined. */
function background(s: CSSStyleDeclaration): string | undefined {
  const parts = Object.keys(BG_DEFAULTS)
    .filter((p) => p !== 'background-size')
    .map((p) => {
      const v = s.getPropertyValue(p);
      return v && v !== BG_DEFAULTS[p] ? rgbify(v) : '';
    });
  return parts.filter(Boolean).join(' ') || undefined;
}

/** The `css` map of inspectDetails (content.js:40510), defaults dropped. */
function computedCss(s: CSSStyleDeclaration): CssMap {
  const g = (p: string) => s.getPropertyValue(p);
  const display = g('display');
  const grid = display === 'grid';
  const flexOrGrid = grid || display === 'flex' || display === 'inline-flex';
  const placed = g('position') === 'absolute' || g('position') === 'fixed';
  const keep = (v: string, ...defaults: string[]) => (defaults.includes(v) ? undefined : v);
  const border = g('border');
  const deco = g('text-decoration');
  const css: Record<string, string | undefined> = {
    content: keep(g('content'), 'normal', ''),
    width: keep(g('width'), 'fit-content', 'auto'),
    height: keep(g('height'), 'fit-content', 'auto'),
    margin: ZERO(g('margin')),
    padding: ZERO(g('padding')),
    border:
      !border || border === 'none' || border.startsWith('0px none') ? undefined : rgbify(border),
    display,
    'grid-template-columns': grid ? compactTracks(g('grid-template-columns')) : undefined,
    'grid-template-rows': grid ? compactTracks(g('grid-template-rows')) : undefined,
    gap: g('row-gap') !== 'normal' ? g('gap') : undefined,
    'justify-items': grid ? keep(g('justify-items'), 'normal') : undefined,
    'align-items': flexOrGrid ? keep(g('align-items'), 'normal') : undefined,
    'justify-content': flexOrGrid ? keep(g('justify-content'), 'normal') : undefined,
    'align-content': grid ? keep(g('align-content'), 'normal') : undefined,
    'box-sizing': keep(g('box-sizing'), 'content-box'),
    'border-radius': ZERO(g('border-radius')),
    background: background(s),
    'box-shadow': keep(g('box-shadow'), 'none') && rgbify(g('box-shadow')),
    filter: keep(g('filter'), 'none'),
    'backdrop-filter': keep(g('backdrop-filter'), 'none'),
    position: keep(g('position'), 'static'),
    top: placed ? g('top') : undefined,
    right: placed ? g('right') : undefined,
    bottom: placed ? g('bottom') : undefined,
    left: placed ? g('left') : undefined,
    'font-size': g('font-size'),
    'font-family': g('font-family'),
    'font-weight': g('font-weight'),
    'font-style': keep(g('font-style'), 'normal'),
    'text-align': keep(g('text-align'), 'start'),
    'white-space': keep(g('white-space'), 'normal'),
    'line-height':
      g('line-height') !== 'normal' ? lineHeight(g('line-height'), g('font-size')) : undefined,
    color: g('color') ? rgbify(g('color')) : undefined,
    'letter-spacing': keep(g('letter-spacing'), 'normal'),
    'text-decoration': !deco || deco.startsWith('none') ? undefined : rgbify(deco),
  };
  return compact(css);
}

const compact = (m: Record<string, string | undefined>): CssMap =>
  Object.fromEntries(Object.entries(m).filter(([, v]) => v !== undefined && v !== '')) as CssMap;

/** Legacy `y` (content.js:39858): pseudo-element props that differ from the element's. */
function pseudoDiff(s: CSSStyleDeclaration, ps: CSSStyleDeclaration): CssMap {
  const out: Record<string, string | undefined> = {};
  for (const p of PSEUDO_PROPS) {
    const a = s.getPropertyValue(p);
    let b = ps.getPropertyValue(p);
    if (a === b || (COLOR_PROPS.has(p) && rgbify(a) === rgbify(b))) continue;
    if (COLOR_PROPS.has(p)) b = rgbify(b);
    else if (p === 'line-height' && b && b !== 'normal')
      b = lineHeight(b, ps.getPropertyValue('font-size'));
    out[p] = b;
  }
  return compact(out);
}

const hasContent = (c: string) => !!c && c !== 'none' && c !== '""' && c !== 'normal';

/** Parent across slots / shadow hosts (legacy `ie`, content.js:1520). */
function parentAcross(el: Element): Element | null {
  const slot = el.assignedSlot;
  if (slot) return slot.parentElement ?? ((slot.getRootNode() as ShadowRoot).host || null);
  return el.parentElement ?? ((el.getRootNode() as ShadowRoot).host || null);
}

/**
 * Port of sendElementToSidePanel's inspect branch (content.js:39602–40760): plain JSON for the
 * panel. `elementId` tags elements with data-sr-id-*. Matched rules come on demand (get_matched_rules).
 */
export function collectElementDetails(
  el: Element,
  elementId: (el: Element) => string,
): ElementDetails {
  styleMap.clear();
  const s = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const type = elementType(el);
  const parent = parentAcross(el);
  const top = !parent || parent === document.body || parent === document.documentElement;
  const child = childOf(el);
  const css = computedCss(s);
  const details: ElementDetails = {
    id: elementId(el),
    name: displaySelector(el),
    parentName: parent ? (top ? parent.tagName.toLowerCase() : displaySelector(parent)) : undefined,
    parentSelectable: !top,
    childName: child ? displaySelector(child) : undefined,
    type,
    selector: fullPath(el),
    boxModel: boxModel(s, rect),
    colors: collectColors(el, mark),
    gradients: parseGradients(s.backgroundImage ?? ''),
    textContent: textOf(el, type),
    assets: collectAssetRefs(el, isOwn, MAX_DEPTH),
    animations: animations(s, (name) => keyframesOf(el, name)),
    transitions: transitions(s),
    boxShadow: splitShadows(s.boxShadow ?? ''),
    typography: collectTypography(el, mark),
    issues: collectIssues(el, elementId),
    canvas: canvasInfo(el, parseFloat(s.width) || rect.width),
    layout: elementLayout(s),
    css,
    skippedCrossOriginCount: skippedCrossOriginCount(el),
  };
  const before = getComputedStyle(el, '::before');
  const after = getComputedStyle(el, '::after');
  if (hasContent(before.getPropertyValue('content'))) details.before = pseudoDiff(s, before);
  if (hasContent(after.getPropertyValue('content'))) details.after = pseudoDiff(s, after);
  if (details.textContent === undefined) delete details.textContent;
  return details;
}

/*
 * Single fields of collectElementDetails, for MCP commands: each computes only its piece and
 * leaves per-selection state (styleMap, issue watcher) untouched.
 */
export const typographyOf = (el: Element): TypographyStyle[] => collectTypography(el, noMark);

export function colorsAndGradientsOf(el: Element): {
  colors: ElementColors;
  gradients: ElementDetails['gradients'];
} {
  const s = getComputedStyle(el);
  return { colors: collectColors(el, noMark), gradients: parseGradients(s.backgroundImage ?? '') };
}

export const assetsOf = (el: Element): ElementDetails['assets'] =>
  collectAssetRefs(el, isOwn, MAX_DEPTH);

export function layoutOf(el: Element): {
  layout: ElementDetails['layout'];
  boxModel: ElementDetails['boxModel'];
} {
  const s = getComputedStyle(el);
  return { layout: elementLayout(s), boxModel: boxModel(s, el.getBoundingClientRect()) };
}

export const cssOf = (el: Element): CssMap => computedCss(getComputedStyle(el));
