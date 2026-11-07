/**
 * Page and analysis commands (10.10, legacy content.js:22495–22857). Each reuses what the side
 * panel already computes; nothing is re-implemented here.
 */
import type { Issue } from '../../lib/element/types';
import { specificity } from '../../lib/css/specificity';
import { state } from '../core/state.svelte';
import {
  assetsOf,
  colorsAndGradientsOf,
  cssOf,
  layoutOf,
  typographyOf,
} from '../sidepanel/details';
import { bridge, elementId, sendElement } from '../sidepanel/bridge.svelte';
import { collectIssues } from '../sidepanel/issues';
import { detectTechnologies, getPageData } from '../sidepanel/page';
import { rulesOf } from '../sidepanel/rules';
import { pageBreakpoints } from '../tools/breakpoints';
import { buildPageInfo } from './ai-data';
import { elementOf, type Commands } from './command';

/**
 * Issues of another element replace the panel's per-selection state (highlight map,
 * issue watcher): put the selection's back.
 */
function restoreSelection(): void {
  if (state.selected && bridge.panelOpen) sendElement(state.selected);
}

const target = (id: string) => elementOf(id, 'Element not found.');

/** Custom property names declared in the page's readable rules (legacy getCustomPropertyNames). */
export function customProperties(root: Document | ShadowRoot = document): string[] {
  const out = new Set<string>();
  for (const { rule } of rulesOf(root).rules) {
    const s = rule.style;
    for (let i = 0; i < s.length; i++) if (s[i]!.startsWith('--')) out.add(s[i]!);
  }
  return [...out].sort();
}

const RANK = { warning: 0, info: 1 } as const;
const ratio = (i: Issue) => i.metadata?.contrastRatio ?? Infinity;

/** Grouped issues with counts: warnings first, then the lowest contrast first; `limit` groups. */
export function rankA11y(groups: Issue[], limit: number) {
  const ranked = groups
    .map((g) => ({ ...g, count: g.elementIds.length }))
    .sort((a, b) => (RANK[a.severity] ?? 2) - (RANK[b.severity] ?? 2) || ratio(a) - ratio(b));
  return {
    issues: ranked.slice(0, limit),
    totalGroups: ranked.length,
    totalRawIssues: ranked.reduce((n, g) => n + g.count, 0),
    truncated: ranked.length > limit,
  };
}

export const pageCommands: Commands = {
  get_page_info: () => buildPageInfo(),
  get_breakpoints: () => ({ breakpoints: pageBreakpoints() }),
  get_seo_issues: () => ({ issues: getPageData().seoIssues }),
  get_meta_tags() {
    const { title, url, ogImage, meta } = getPageData();
    return { title, url, ogImage, meta };
  },
  get_page_weight: () => ({ weight: getPageData().pageWeight }),
  get_css_custom_properties: () => ({ properties: customProperties() }),
  calculate_specificity({ selector }) {
    const s = specificity(selector);
    return { selector, specificity: s.array, score: s.score };
  },
  detect_technologies: async () => ({ technologies: await detectTechnologies() }),
  get_a11y_issues({ limit }) {
    try {
      return rankA11y(collectIssues(document.body ?? document.documentElement, elementId), limit);
    } finally {
      restoreSelection();
    }
  },
  // each per-element command computes only its own field, touching no per-selection state
  get_typography: ({ elementId: id }) => ({ typography: typographyOf(target(id)) }),
  get_colors: ({ elementId: id }) => colorsAndGradientsOf(target(id)),
  get_assets: ({ elementId: id }) => ({ assets: assetsOf(target(id)) }),
  get_layout: ({ elementId: id }) => layoutOf(target(id)),
  // the background adds `tailwind` from `css`, so the converter stays out of content.js
  get_tailwind: ({ elementId: id }) => ({ css: cssOf(target(id)) }),
};
