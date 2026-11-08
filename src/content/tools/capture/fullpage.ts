import { i18n } from '#i18n';
import {
  afterScript,
  beforeScript,
  fullPagePlan,
  pickScroller,
  restoreScript,
  STITCH_MAX,
  stitchDone,
  stitchHeight,
  useScroller,
} from '../../../lib/capture/fullpage';
import { shadowRoots } from '../../../lib/dom/dom';
import { sendToBackground } from '../../../lib/ext/messaging';
import { pinViewportUnits } from '../../../lib/dom/viewport-units';
import { mountUi } from '../../../ui/mount';
import { ownNodes } from '../../core/events';
import { onStop, sessionCtx, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import Cover from './Cover.svelte';
import { openCaptureEditor } from './editor';
import { closeCapture, frames, grabVisible, loadImg, sleep, withHiddenUi } from './session';

/** Full-page capture, port of unpacked/scripts/bd/capture/fullpage.js. */
const winTotal = () =>
  Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0);

function findScroller(): HTMLElement | null {
  if (!useScroller(winTotal(), innerHeight)) return null;
  const all = document.body ? [document.body, ...document.body.getElementsByTagName('*')] : [];
  return pickScroller(
    (all as HTMLElement[]).map((el) => ({
      el,
      clientH: el.clientHeight,
      scrollH: el.scrollHeight,
      clientW: el.clientWidth,
      get overflowY() {
        return getComputedStyle(el).overflowY;
      },
    })),
  );
}

/** Fixed/sticky elements would repeat in every slice; hidden after the first one (:10). */
function hideFixed(): [HTMLElement, string, string][] {
  const out: [HTMLElement, string, string][] = [];
  for (const el of document.body?.getElementsByTagName('*') ?? []) {
    const pos = getComputedStyle(el).position;
    if (pos !== 'fixed' && pos !== 'sticky') continue;
    const s = (el as HTMLElement).style;
    out.push([
      el as HTMLElement,
      s.getPropertyValue('visibility'),
      s.getPropertyPriority('visibility'),
    ]);
    s.setProperty('visibility', 'hidden', 'important');
  }
  return out;
}

/** Cover kept up so the page jumping underneath is never seen. Pixel size: vh changes while enlarged. */
async function showCover(snap: string): Promise<() => void> {
  const ui = await mountUi(sessionCtx(), Cover as never, { snap }, { name: 'iodob-cover' });
  ui.host.dataset.theme = state.theme;
  ui.host.style.setProperty('--bd-cover-w', `${innerWidth}px`);
  ui.host.style.setProperty('--bd-cover-h', `${innerHeight}px`);
  ownNodes.add(ui.host);
  let done = false;
  const remove = () => {
    if (done) return;
    done = true;
    ownNodes.delete(ui.host);
    ui.remove();
  };
  onStop(remove);
  return remove;
}

async function stack(parts: string[]): Promise<HTMLCanvasElement> {
  const imgs = await Promise.all(parts.map(loadImg));
  const c = document.createElement('canvas');
  c.width = imgs[0]!.width;
  c.height = imgs.reduce((n, i) => n + i.height, 0);
  const cx = c.getContext('2d')!;
  imgs.reduce((y, i) => (cx.drawImage(i, 0, y), y + i.height), 0);
  return c;
}

/** Fast path (:60): the background renders the whole page at once via the debugger. */
async function fullPageViaDebugger(): Promise<HTMLCanvasElement> {
  const el = findScroller();
  const x0 = scrollX,
    y0 = scrollY,
    s0 = el?.scrollTop ?? 0;
  el?.setAttribute('data-iodob-scroll', '');
  const ih = innerHeight;
  // the viewport grows to the page height below: keep 100vh heroes at one screen
  const unpin = pinViewportUnits([
    document,
    ...shadowRoots(document, (e) => e.localName.startsWith('iodob')),
  ]);
  const plan = fullPagePlan({
    winTotal: winTotal(),
    ih,
    iw: innerWidth,
    dpr: devicePixelRatio,
    scroller: el ? { scrollH: el.scrollHeight, clientH: el.clientHeight } : null,
  });
  try {
    const r = await sendToBackground('full_capture', {
      ...plan,
      dpr: devicePixelRatio,
      before: beforeScript(ih),
      after: afterScript(),
      restore: restoreScript(el ? { scrollTop: s0 } : { x: x0, y: y0 }),
    }).catch((e: Error) => ({ ok: false as const, error: e.message }));
    if (!r?.ok) throw new Error(r?.error || 'debugger capture failed');
    return await stack(r.parts);
  } finally {
    unpin();
    // backup in case the background could not restore it
    if (el) {
      el.scrollTop = s0;
      el.removeAttribute('data-iodob-scroll');
    } else scrollTo({ left: x0, top: y0, behavior: 'instant' });
  }
}

/** Fallback (:127): scroll and stitch viewport shots of the window or the main scroll container. */
async function stitchFullPage(): Promise<HTMLCanvasElement | null> {
  const x0 = scrollX,
    y0 = scrollY;
  const el = findScroller();
  const r = el?.getBoundingClientRect();
  const L = el && r ? r.left + el.clientLeft : 0,
    Tp = el && r ? r.top + el.clientTop : 0;
  const VW = el ? el.clientWidth : innerWidth,
    VH = el ? el.clientHeight : innerHeight;
  const total = el ? el.scrollHeight : winTotal();
  const s0 = el ? el.scrollTop : y0;
  const getY = () => (el ? el.scrollTop : scrollY);
  const setY = (y: number) =>
    el
      ? el.scrollTo({ top: y, behavior: 'instant' })
      : scrollTo({ left: x0, top: y, behavior: 'instant' });
  const signal = sessionSignal();
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let hidden: [HTMLElement, string, string][] = [];
  let last: HTMLImageElement | null = null;
  let k = 1;
  return withHiddenUi(async () => {
    try {
      for (let y = 0, i = 0; i < STITCH_MAX && !signal.aborted; i++) {
        setY(y);
        await frames();
        if (i) await sleep(550); // ~2 captures/s; also lets lazy images load
        const img = (last = await loadImg(await grabVisible()));
        k = img.width / innerWidth;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = stitchHeight(innerHeight, VH, total, k);
          ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
        const top = getY(); // the browser clamps the last scroll, so draw where it really is
        const sx = Math.round(L * k),
          sy = Math.round(Tp * k),
          sw = Math.round(VW * k),
          sh = Math.round(VH * k);
        ctx!.drawImage(img, sx, sy, sw, sh, sx, Math.round((Tp + top) * k), sw, sh);
        if (i === 0 && !el) hidden = hideFixed();
        if (stitchDone(top, VH, total, Tp, k)) break;
        y = top + VH;
      }
      // whatever sits below the scroll container (status bar etc.) goes under the stitched content
      const below = innerHeight - Tp - VH;
      if (el && below > 0 && last && ctx) {
        const bh = Math.round(below * k);
        ctx.drawImage(
          last,
          0,
          Math.round((Tp + VH) * k),
          last.width,
          bh,
          0,
          Math.round((Tp + total) * k),
          last.width,
          bh,
        );
      }
    } finally {
      hidden.forEach(([e, v, p]) => e.style.setProperty('visibility', v, p));
      setY(s0);
    }
    return canvas;
  }).catch(() => null);
}

/** 4.10, port of captureFullPage (:102). The capture session stays "capturing" throughout. */
export async function captureFullPage(snap: string): Promise<void> {
  const signal = sessionSignal();
  state.capturing = true;
  const removeCover = await showCover(snap);
  if (signal.aborted) return removeCover();
  let note: string | null = null;
  const fast = await withHiddenUi(fullPageViaDebugger).catch((e: Error) => {
    // say why, so a slow scroll-and-stitch is never a mystery (most often: DevTools is open on this tab)
    note = i18n.t('capture.fastFailed', [e.message]);
    return null;
  });
  if (signal.aborted) return removeCover();
  if (fast) {
    await openCaptureEditor(fast, false, note); // up before the cover goes away (spec §9)
    return removeCover();
  }
  removeCover(); // stitching shoots the real screen; the cover would end up in every slice
  const c = await stitchFullPage();
  if (signal.aborted) return;
  if (c) await openCaptureEditor(c, false, note);
  else closeCapture();
}
