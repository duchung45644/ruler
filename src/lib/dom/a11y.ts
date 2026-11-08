import type { Issue, Severity } from '../element/types';

/** Non-text contrast minimum (WCAG 1.4.11); icons smaller than 8px are not checked. */
export const ICON_MIN_RATIO = 3;
const ICON_MIN_SIZE = 8;

/**
 * Large-text threshold of calculateWCAGContrast (content.js:44227). Legacy compares CSS px with
 * the spec's pt values (18 / 14 bold); kept so verdicts match the old panel.
 */
export const isLargeText = (px: number, weight: number): boolean =>
  px >= 18 || (px >= 14 && weight >= 700);

export const roundRatio = (r: number): number => Math.round(100 * r) / 100;

/** What to say about one element; keys are under `issue.*`, params are already strings. */
export interface Verdict {
  severity: Severity;
  messageKey: 'contrastAaMessage' | 'contrastAaaMessage' | 'iconContrastMessage';
  recommendationKey:
    'contrastAaRecommendation' | 'contrastAaaRecommendation' | 'iconContrastRecommendation';
  /** Ratio, required ratio and, for text, the size word key. */
  params: string[];
  required: number;
  size?: 'textSizeLarge' | 'textSizeNormal';
}

/** Text verdict of collectA11yIssues (content.js:40983): below AA warns, below AAA informs. */
export function contrastIssue(ratio: number, large: boolean): Verdict | null {
  const aa = large ? 3 : 4.5;
  const aaa = large ? 4.5 : 7;
  const r = roundRatio(ratio);
  const size = large ? 'textSizeLarge' : 'textSizeNormal';
  if (r < aa)
    return {
      severity: 'warning',
      messageKey: 'contrastAaMessage',
      recommendationKey: 'contrastAaRecommendation',
      params: [String(r), String(aa)],
      required: aa,
      size,
    };
  if (r < aaa)
    return {
      severity: 'info',
      messageKey: 'contrastAaaMessage',
      recommendationKey: 'contrastAaaRecommendation',
      params: [String(r), String(aaa)],
      required: aaa,
      size,
    };
  return null;
}

/** Icon verdict (content.js:41068): an SVG of 8px+ under 3:1. */
export function iconContrastIssue(ratio: number, sizePx: number): Verdict | null {
  if (sizePx < ICON_MIN_SIZE) return null;
  const r = roundRatio(ratio);
  if (r >= ICON_MIN_RATIO) return null;
  return {
    severity: 'warning',
    messageKey: 'iconContrastMessage',
    recommendationKey: 'iconContrastRecommendation',
    params: [String(r), String(ICON_MIN_RATIO)],
    required: ICON_MIN_RATIO,
  };
}

/** One element's finding, before grouping. */
export interface Instance {
  elementId: string;
  type: Issue['type'];
  selector: string;
  verdict: Verdict;
  message: string;
  recommendation: string;
  metadata: Issue['metadata'];
}

/**
 * Legacy groupingKey (`type_selector_severity_ratio`, content.js:41020): same verdict on same
 * selector is one issue with several instances. Warnings first, then first-seen order.
 */
export function groupIssues(instances: Instance[]): Issue[] {
  const byKey = new Map<string, Issue>();
  for (const i of instances) {
    const id = `${i.type}_${i.selector}_${i.verdict.severity}_${i.metadata.contrastRatio}`;
    const hit = byKey.get(id);
    if (hit) {
      hit.elementIds.push(i.elementId);
      continue;
    }
    byKey.set(id, {
      id,
      type: i.type,
      category: 'accessibility',
      severity: i.verdict.severity,
      selector: i.selector,
      message: i.message,
      recommendation: i.recommendation,
      elementIds: [i.elementId],
      metadata: i.metadata,
    });
  }
  const rank = (s: Severity) => (s === 'warning' ? 0 : 1);
  return [...byKey.values()].sort((a, b) => rank(a.severity) - rank(b.severity));
}
