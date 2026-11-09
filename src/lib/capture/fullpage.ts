/** Full-page capture math and page scripts, port of unpacked/scripts/bd/capture/fullpage.js. */
export const MAX_CANVAS = 32000; // browser canvas height limit is ~32767px
export const CHUNK = 8000;
export const STITCH_MAX = 60;

type Cand<T> = { el: T; clientH: number; scrollH: number; clientW: number; overflowY: string };

/** Legacy findScroller (:22): the biggest visible element that actually scrolls vertically. */
export function pickScroller<T>(cands: Iterable<Cand<T>>): T | null {
  let best: T | null = null,
    area = 0;
  for (const c of cands) {
    if (c.clientH < 100 || c.scrollH <= c.clientH + 1) continue;
    if (c.overflowY !== 'auto' && c.overflowY !== 'scroll' && c.overflowY !== 'overlay') continue;
    const a = c.clientW * c.clientH;
    if (a > area) {
      area = a;
      best = c.el;
    }
  }
  return best;
}

/** Only look for a scroll container when the window itself (almost) doesn't scroll (:63). */
export const useScroller = (winTotal: number, ih: number): boolean => winTotal - ih < 50;

export function fullPagePlan(p: {
  winTotal: number;
  ih: number;
  iw: number;
  dpr: number;
  scroller: { scrollH: number; clientH: number } | null;
}) {
  const s = useScroller(p.winTotal, p.ih) ? p.scroller : null;
  const height = Math.round(s ? p.ih + s.scrollH - s.clientH : p.winTotal);
  return {
    width: p.iw,
    height: Math.min(height, Math.floor(MAX_CANVAS / p.dpr)),
    chunk: Math.floor(CHUNK / p.dpr),
    shift: p.ih,
  };
}

/**
 * While capturing, the page is pushed down one screen (transform on <html>) and the cover moved up by
 * the same amount: it stays where the user looks but sits above the captured area. The cover moves via
 * a CSS variable: theme.css's `:host { top: 0 !important }` would beat an inline top.
 */
export const beforeScript = (ih: number): string =>
  `(() => { const s = document.documentElement.style; window.__bdT = [s.getPropertyValue("transform"), s.getPropertyPriority("transform")]; s.setProperty("transform", "translateY(${ih}px)", "important"); const c = document.querySelector("pixellens-cover"); c && c.style.setProperty("--bd-cover-top", "-${ih}px"); })()`;

export const afterScript = (): string =>
  `(() => { const s = document.documentElement.style, t = window.__bdT || ["", ""]; s.setProperty("transform", t[0], t[1]); const c = document.querySelector("pixellens-cover"); c && c.style.setProperty("--bd-cover-top", "0px"); })()`;

export const restoreScript = (o: { x: number; y: number } | { scrollTop: number }): string =>
  'scrollTop' in o
    ? `(document.querySelector("[data-pixellens-scroll]") || {}).scrollTop = ${o.scrollTop}`
    : `scrollTo({ left: ${o.x}, top: ${o.y}, behavior: "instant" })`;

export const stitchHeight = (ih: number, VH: number, total: number, k: number): number =>
  Math.min(Math.round((ih - VH + total) * k), MAX_CANVAS);

export const stitchDone = (
  top: number,
  VH: number,
  total: number,
  Tp: number,
  k: number,
): boolean => top + VH >= total - 1 || (Tp + top + VH) * k >= MAX_CANVAS;
