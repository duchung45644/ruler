import Eye from '@lucide/svelte/icons/eye';
import {
  colorMatrix,
  VISION_MODES,
  visionFilter,
  type VisionMode,
} from '../../../lib/style/vision';
import { registerItem, togglePopover } from '../../core/registry.svelte';
import { onStop } from '../../core/session';
import { state } from '../../core/state.svelte';
import VisionPopover from './VisionPopover.svelte';

const SVG = 'http://www.w3.org/2000/svg';
const filterId = (mode: VisionMode) => `pixellens-vision-${mode}`;

/**
 * Filters live in the page's light DOM (url(#id) resolves against the document), wrapped in an
 * `pixellens-` element so page scans skip it. Built with createElementNS: no innerHTML (Trusted Types).
 */
let defs: HTMLElement | null = null;
/** The page's own inline `filter` on <html>, put back exactly on off. */
let saved: { value: string; priority: string } | null = null;

function ensureDefs(): void {
  if (defs?.isConnected) return;
  defs = document.createElement('pixellens-vision');
  defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  for (const mode of VISION_MODES) {
    const values = colorMatrix(mode);
    if (!values) continue;
    const filter = document.createElementNS(SVG, 'filter');
    filter.id = filterId(mode);
    const m = document.createElementNS(SVG, 'feColorMatrix');
    m.setAttribute('type', 'matrix');
    m.setAttribute('values', values);
    filter.append(m);
    svg.append(filter);
  }
  defs.append(svg);
  document.documentElement.append(defs);
}

/**
 * Applies `mode` as a filter on <html>. Our UI host is a child of <html> (WXT anchor), so it is
 * filtered too; a filter on <body> would spare it but turns body into the containing block of
 * the page's position:fixed elements, which breaks the very layout being checked.
 */
export function setVision(mode: VisionMode): void {
  state.vision = mode;
  const html = document.documentElement.style;
  if (mode === 'none') {
    if (saved) html.setProperty('filter', saved.value, saved.priority);
    saved = null;
    defs?.remove();
    defs = null;
    return;
  }
  saved ??= {
    value: html.getPropertyValue('filter'),
    priority: html.getPropertyPriority('filter'),
  };
  if (colorMatrix(mode)) ensureDefs();
  html.setProperty('filter', visionFilter(mode, filterId), 'important');
}

export function initVision(): void {
  registerItem({
    id: 'vision',
    icon: Eye,
    label: 'dock.vision',
    key: 'y',
    popover: VisionPopover,
    run: () => togglePopover('vision'),
    runKey: () => setVision(state.vision === 'none' ? 'deuteranopia' : 'none'),
    isActive: () => state.vision !== 'none',
  });
  onStop(() => setVision('none'));
}
