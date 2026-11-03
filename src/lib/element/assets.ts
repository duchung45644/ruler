import type { Asset } from './types';

/** Children including an open shadow root's (legacy `ag`, content.js:20842). */
export const childrenOf = (el: Element): Element[] =>
  el.shadowRoot ? [...el.shadowRoot.children, ...el.children] : [...el.children];

/** `url(…)` arguments of a background-image, quotes stripped. */
export function cssUrls(image: string): string[] {
  const out: string[] = [];
  const re = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g;
  for (let m = re.exec(image); m; m = re.exec(image)) out.push((m[1] ?? m[2] ?? m[3] ?? '').trim());
  return out;
}

/** An `<svg>` that pulls its shapes from `<use href>` would serialise empty: legacy skips it. */
const usesSprite = (el: Element): boolean =>
  (el.tagName.toLowerCase() === 'use' &&
    (el.hasAttribute('href') || el.hasAttribute('xlink:href'))) ||
  [...el.children].some(usesSprite);

function fromUrl(raw: string, w: number, h: number): Asset | null {
  const size = { renderedWidth: w, renderedHeight: h };
  if (!raw.startsWith('data:'))
    return { type: 'background-image', url: new URL(raw, document.baseURI).href, ...size };
  try {
    if (raw.startsWith('data:image/svg+xml')) {
      const body = raw.slice(raw.indexOf(',') + 1);
      const content = raw.includes(';base64,') ? atob(body) : decodeURIComponent(body);
      const t = content.trim();
      return t.includes('<svg') && t.endsWith('</svg>') ? { type: 'svg', content, ...size } : null;
    }
    if (raw.startsWith('data:image/'))
      return {
        type: 'data-image',
        dataUrl: raw,
        fileExtension: /data:image\/([^;,]+)/.exec(raw)?.[1] ?? 'png',
        ...size,
      };
  } catch {
    return { type: 'background-image', url: raw, ...size };
  }
  return null;
}

/**
 * Port of getElementAssets (content.js:41154): `<img>` ≥ 10px, background-image urls on boxes
 * > 8px, inline `<svg>`, down to `maxDepth`; deduplicated by url / content.
 */
export function collectAssetRefs(
  root: Element,
  skip: (el: Element) => boolean = () => false,
  maxDepth = 100,
): Asset[] {
  const found: Asset[] = [];
  const walk = (el: Element, depth: number) => {
    if (skip(el)) return;
    const tag = el.tagName.toLowerCase();
    const r = el.getBoundingClientRect();
    const src =
      tag === 'img' ? (el as HTMLImageElement).currentSrc || el.getAttribute('src') : null;
    if (src && r.width >= 10 && r.height >= 10)
      found.push({
        type: 'src',
        url: new URL(src, document.baseURI).href,
        renderedWidth: r.width,
        renderedHeight: r.height,
      });
    const image = getComputedStyle(el).backgroundImage;
    if (image && image !== 'none' && r.width > 8 && r.height > 8)
      for (const u of cssUrls(image)) {
        const a = fromUrl(u, r.width, r.height);
        if (a) found.push(a);
      }
    if (tag === 'svg' && !usesSprite(el))
      found.push({
        type: 'svg',
        content: new XMLSerializer().serializeToString(el),
        renderedWidth: r.width,
        renderedHeight: r.height,
      });
    if (depth < maxDepth) for (const c of childrenOf(el)) walk(c, depth + 1);
  };
  walk(root, 0);
  const seen = new Set<string>();
  return found.filter((a) => {
    const key = a.type === 'svg' ? a.content : a.type === 'data-image' ? a.dataUrl : a.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Download name: last path segment without query; data images get `fallback.<ext>`; nothing
 * usable → `fallback` (the panel passes DEFAULT_ASSET_NAME / DEFAULT_DOWNLOAD_NAME).
 */
export function assetFileName(url: string, fallback: string): string {
  const data = /^data:image\/([a-z0-9.+-]+)/i.exec(url);
  if (data) return `${fallback}.${data[1]!.replace('svg+xml', 'svg').replace('jpeg', 'jpg')}`;
  try {
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
    return name || fallback;
  } catch {
    return fallback;
  }
}

/** Legacy asset grid constants (sidepanel.js:12694–12701). */
const MIN_RATIO = 0.66;
const MAX_RATIO = 2.5;
const clampRatio = (r: number) => Math.max(MIN_RATIO, Math.min(MAX_RATIO, r || 1));

export interface Row {
  /** Indices into the input. */
  items: number[];
  height: number;
}

/**
 * Port of `Mc` (sidepanel.js:16411): greedy justified rows of aspect-clamped tiles. A row closes
 * when it is full (3 per row, +1 per 128px above 400px) or when adding the tile overshoots the
 * width more than leaving it out undershoots. Rows are then scaled to fill `width`; the last row
 * never grows taller than `targetH`.
 */
export function justifiedRows(
  items: { w: number; h: number }[],
  width: number,
  targetH: number,
  gap: number,
): Row[] {
  const perRow = 3 + Math.max(0, Math.floor((width - 400) / 128));
  const rows: number[][] = [];
  let row: number[] = [];
  let sum = 0;
  items.forEach((it, i) => {
    const w = targetH * clampRatio(it.w / it.h);
    if (row.length) {
      const without = sum + (row.length - 1) * gap;
      const withIt = sum + w + row.length * gap;
      if (row.length >= perRow || (withIt > width && width - without < withIt - width)) {
        rows.push(row);
        row = [];
        sum = 0;
      }
    }
    row.push(i);
    sum += w;
  });
  if (row.length) rows.push(row);
  return rows.map((r, n) => {
    const ratios = r.reduce((s, i) => s + clampRatio(items[i]!.w / items[i]!.h), 0);
    const h = (width - (r.length - 1) * gap) / ratios;
    return { items: r, height: n === rows.length - 1 ? Math.min(h, targetH) : h };
  });
}
