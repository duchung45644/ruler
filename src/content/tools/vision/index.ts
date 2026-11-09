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
 * The filter itself goes in a `<style>` there, never the inline style of <html>: inline edits of
 * <html> (CSS variables) read and record that attribute.
 */
let defs: HTMLElement | null = null;
let sheet: HTMLStyleElement | null = null;

function ensureDefs(): HTMLStyleElement {
  if (defs?.isConnected && sheet) return sheet;
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
  sheet = document.createElement('style');
  defs.append(svg, sheet);
  document.documentElement.append(defs);
  return sheet;
}

/**
 * Applies `mode` as a filter on <html>. Our UI host is a child of <html> (WXT anchor), so it is
 * filtered too; a filter on <body> would spare it but turns body into the containing block of
 * the page's position:fixed elements, which breaks the very layout being checked.
 */
export function setVision(mode: VisionMode): void {
  state.vision = mode;
  if (mode === 'none') {
    defs?.remove();
    defs = sheet = null;
    return;
  }
  ensureDefs().textContent = `html{filter:${visionFilter(mode, filterId)} !important}`;
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
