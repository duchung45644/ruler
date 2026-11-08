import { i18n } from '#i18n';
import {
  CURSORS,
  cropSource,
  dragSel,
  hitSel,
  isValidSel,
  type SelRect,
} from '../../../lib/capture/capture';
import { loadImg } from './session';

const HANDLES = ['0 0', '50% 0', '100% 0', '0 50%', '100% 50%', '0 100%', '50% 100%', '100% 100%'];
const SHADE = 'rgba(0,0,0,.45)';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, css: string, text?: string) {
  const e = document.createElement(tag);
  e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
}

/**
 * Frozen-screen area select, port of startAreaSelect (capture.js:204). Plain DOM on the hot path:
 * pointermove writes styles directly. Drag inside to move, an edge/corner to resize, outside to draw.
 */
export function startAreaSelect(
  root: HTMLElement,
  snap: string,
  signal: AbortSignal,
  onDrawn: () => void,
  onSel: (r: SelRect | null) => void,
): () => Promise<HTMLCanvasElement> {
  const frozen = el(
    'img',
    `position:fixed;left:0;top:0;pointer-events:none;width:${innerWidth}px;height:${innerHeight}px`,
  );
  frozen.src = snap;
  frozen.alt = '';
  const shade = el(
    'div',
    `position:fixed;inset:0;pointer-events:auto;cursor:crosshair;background:${SHADE}`,
  );
  shade.dataset.shade = '';
  const hint = el(
    'div',
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:8px 14px;pointer-events:none',
    i18n.t('capture.dragHint'),
  );
  hint.className =
    'rounded-panel border border-line bg-surface text-[13px] text-fg shadow-[0_8px_24px_rgba(0,0,0,.18)]';
  const sel = el(
    'div',
    `position:fixed;display:none;outline:2px dashed #fff;box-shadow:0 0 0 100vmax ${SHADE};pointer-events:none`,
  );
  sel.dataset.sel = '';
  for (const p of HANDLES) {
    const [x, y] = p.split(' ');
    sel.append(
      el(
        'div',
        `position:absolute;left:${x};top:${y};width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;background:#fff;border:1.5px solid #222`,
      ),
    );
  }
  let r: SelRect | null = null;
  let drawn = false;

  shade.addEventListener(
    'pointermove',
    (e) => {
      const h = hitSel(r, e.clientX, e.clientY);
      shade.style.cursor = h ? CURSORS[h] : 'crosshair';
    },
    { signal },
  );

  shade.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const x0 = e.clientX,
        y0 = e.clientY;
      const mode = hitSel(r, x0, y0);
      const o = r && { ...r };
      onSel(null);
      hint.remove();
      shade.setPointerCapture?.(e.pointerId);
      const drag = new AbortController();
      const opts = { signal: AbortSignal.any([signal, drag.signal]) };
      shade.addEventListener(
        'pointermove',
        (ev) => {
          r = dragSel(mode, o, x0, y0, ev.clientX, ev.clientY, innerWidth, innerHeight);
          shade.style.background = 'none';
          sel.style.display = 'block';
          Object.assign(sel.style, {
            left: `${r.x}px`,
            top: `${r.y}px`,
            width: `${r.w}px`,
            height: `${r.h}px`,
          });
          if (!drawn && isValidSel(r)) {
            drawn = true;
            onDrawn();
          }
        },
        opts,
      );
      shade.addEventListener(
        'pointerup',
        () => {
          drag.abort();
          if (!isValidSel(r)) {
            r = null;
            shade.style.background = SHADE;
            sel.style.display = 'none';
            return;
          }
          onSel({ ...r });
        },
        opts,
      );
    },
    { signal },
  );

  root.append(frozen, shade, hint, sel);

  return async () => {
    if (!r) throw new Error('no selection');
    const img = await loadImg(snap);
    const s = cropSource(r, img.width, innerWidth);
    const c = document.createElement('canvas');
    c.width = s.w;
    c.height = s.h;
    c.getContext('2d')!.drawImage(img, s.sx, s.sy, s.w, s.h, 0, 0, s.w, s.h);
    return c;
  };
}
