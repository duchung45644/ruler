import { i18n } from '#i18n';
import {
  contrastIssue,
  groupIssues,
  iconContrastIssue,
  isLargeText,
  roundRatio,
  type Instance,
  type Verdict,
} from '../../lib/a11y';
import { contrastRatio, formatColor, parseColor, type Rgba } from '../../lib/color';
import { childrenOf } from '../../lib/element/assets';
import type { Issue } from '../../lib/element/types';
import { sendToSidePanel } from '../../lib/messaging';
import { displaySelector } from '../../lib/selector';
import { backgroundOf, isTextHeavy, type LayerMemo } from '../core/contrast';
import { canHighlight } from './highlight';

const MAX_DEPTH = 100;
const hex = (c: Rgba) => formatColor(c, 'HEX');

/** Findings of the current selection, kept so off-screen ones can be re-checked. */
let instances: Instance[] = [];
let groups: Issue[] = [];
let observer: IntersectionObserver | null = null;

export const currentIssues = (): Issue[] => groups;

function localise(v: Verdict): { message: string; recommendation: string } {
  const [ratio = '', required = ''] = v.params;
  const message =
    v.messageKey === 'iconContrastMessage'
      ? i18n.t('issue.iconContrastMessage', [ratio, required])
      : i18n.t(`issue.${v.messageKey}`, [ratio, required, i18n.t(`issue.${v.size!}`)]);
  return {
    message,
    recommendation: i18n.t(`issue.${v.recommendationKey}`, [String(v.required)]),
  };
}

const opacityOf = (s: CSSStyleDeclaration) => {
  const o = parseFloat(s.opacity);
  return Number.isNaN(o) ? 1 : o;
};

/** One element's text or icon verdict; null when fine or no solid background is found. */
function check(
  el: Element,
  id: string,
  at?: { x: number; y: number },
  memo?: LayerMemo,
): Instance | null {
  const s = getComputedStyle(el);
  const icon = el.tagName.toLowerCase() === 'svg';
  const paint = icon ? (s.fill && s.fill !== 'none' ? s.fill : s.stroke) : s.color;
  const fg = paint && paint !== 'none' ? parseColor(paint) : null;
  const bg = fg && fg.a > 0 ? backgroundOf(el, at, memo) : null;
  if (!fg || !bg) return null;
  const ratio = roundRatio(contrastRatio({ ...fg, a: fg.a * opacityOf(s) }, bg));
  const base = {
    elementId: id,
    selector: displaySelector(el),
    metadata: {
      color: hex(fg),
      backgroundColor: hex(bg),
      contrastRatio: ratio,
      requiredRatio: 0,
    },
  };
  if (icon) {
    const r = el.getBoundingClientRect();
    const verdict = iconContrastIssue(ratio, Math.max(r.width, r.height));
    if (!verdict) return null;
    base.metadata.requiredRatio = verdict.required;
    return { ...base, type: 'icon-contrast', verdict, ...localise(verdict) };
  }
  const fontSize = parseFloat(s.fontSize);
  const fontWeight = parseInt(s.fontWeight, 10);
  const large = isLargeText(fontSize, fontWeight);
  const verdict = contrastIssue(ratio, large);
  if (!verdict) return null;
  return {
    ...base,
    type: 'contrast-failure',
    verdict,
    ...localise(verdict),
    metadata: {
      ...base.metadata,
      requiredRatio: verdict.required,
      fontSize,
      fontWeight,
      isLargeText: large,
    },
  };
}

interface TextNode {
  el: Element;
  color: string;
  parent: TextNode | null;
  descendants: TextNode[];
}

const mixed = (list: TextNode[]) => list.length > 1 && list.some((n) => n.color !== list[0]!.color);

/** Text-heavy elements under root with legacy's tree of text ancestors (content.js:40926). */
function textNodes(root: Element): TextNode[] {
  const all: TextNode[] = [];
  const walk = (el: Element, depth: number, parent: TextNode | null): TextNode[] => {
    if (depth > MAX_DEPTH || !canHighlight(el)) return [];
    let node: TextNode | null = null;
    if (isTextHeavy(el)) {
      node = { el, color: getComputedStyle(el).color, parent, descendants: [] };
      all.push(node);
    }
    const below = childrenOf(el).flatMap((c) => walk(c, depth + 1, node ?? parent));
    if (!node) return below;
    node.descendants = below;
    return [node, ...below];
  };
  walk(root, 0, null);
  return all;
}

/** An icon whose parts are all painted one colour (multi-colour icons are skipped, :41090). */
function singleColour(svg: Element, colour: string): boolean {
  const target = parseColor(colour);
  return [...svg.querySelectorAll('*')].every((n) => {
    const s = getComputedStyle(n);
    return [s.fill, s.stroke].every((v) => {
      const c = v && v !== 'none' ? parseColor(v) : null;
      return !c || c.a === 0 || !target || hex(c) === hex(target);
    });
  });
}

const inViewport = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom >= 0 && r.right >= 0 && r.top <= innerHeight && r.left <= innerWidth;
};

export function stopIssues(): void {
  observer?.disconnect();
  observer = null;
  instances = [];
  groups = [];
}

/**
 * Port of collectA11yIssues (content.js:40909). A text element is skipped when its own text
 * children disagree on colour, or when it shares its text ancestor's single colour (the ancestor
 * reports it). Off-screen findings are re-checked as they scroll in (watchViewportContrast).
 */
export function collectIssues(root: Element, elementId: (el: Element) => string): Issue[] {
  stopIssues();
  const offscreen = new Map<Element, string>();
  const memo: LayerMemo = new Map(); // nothing changes styles during the scan
  const add = (el: Element) => {
    const id = elementId(el);
    const found = check(el, id, undefined, memo);
    if (!found) return;
    instances.push(found);
    if (!inViewport(el)) offscreen.set(el, id);
  };
  for (const n of textNodes(root)) {
    if (mixed(n.descendants)) continue;
    if (n.parent && !mixed(n.parent.descendants) && n.parent.color === n.color) continue;
    if ((n.el as HTMLButtonElement).disabled || n.el.getAttribute('aria-disabled') === 'true')
      continue;
    add(n.el);
  }
  for (const svg of root.querySelectorAll('svg')) {
    if (!canHighlight(svg)) continue;
    const s = getComputedStyle(svg);
    const paint = s.fill && s.fill !== 'none' ? s.fill : s.stroke;
    if (paint && paint !== 'none' && singleColour(svg, paint)) add(svg);
  }
  groups = groupIssues(instances);
  if (offscreen.size) watch(offscreen);
  return groups;
}

/** Background under an off-screen element is a guess (ancestor chain): look again on screen. */
function watch(offscreen: Map<Element, string>): void {
  observer = new IntersectionObserver(
    (entries) => {
      let changed = false;
      for (const e of entries) {
        const id = offscreen.get(e.target);
        if (!e.isIntersecting || !id) continue;
        observer?.unobserve(e.target);
        const r = e.intersectionRect;
        const at =
          r.width > 0 && r.height > 0
            ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
            : undefined;
        const next = check(e.target, id, at);
        const i = instances.findIndex((x) => x.elementId === id);
        if (i < 0 || JSON.stringify(instances[i]) === JSON.stringify(next)) continue;
        if (next) instances[i] = next;
        else instances.splice(i, 1);
        changed = true;
      }
      if (!changed) return;
      groups = groupIssues(instances);
      void sendToSidePanel('update_issues', groups).catch(() => {});
    },
    { threshold: 0.01 },
  );
  for (const el of offscreen.keys()) observer.observe(el);
}
