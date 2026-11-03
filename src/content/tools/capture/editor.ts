import {
  MARK_COLORS,
  MARK_TOOLS,
  drawItem,
  editorCanvasStyle,
  isTooSmall,
  textFontCss,
  type MarkItem,
  type MarkTool,
  type Pt,
} from '../../../lib/markup';
import { ensureCapture, loadImg, setViewKey } from './session';
import { cap } from './state.svelte';

/** Last markup tool, remembered for the page session (4.12). */
let markTool: MarkTool = 'arrow';

/**
 * Opens the image editor (port of editor.js:24). `src` may be an already drawn canvas, which skips
 * a slow PNG round trip for big shots. `markup` opens with drawing on (from "Markup capture").
 */
export async function openCaptureEditor(
  src: string | HTMLCanvasElement,
  markup = false,
  note: string | null = null,
): Promise<void> {
  const img = typeof src === 'string' ? await loadImg(src).catch(() => null) : src;
  if (!img || !(await ensureCapture())) return;
  Object.assign(cap.editor, {
    img,
    note,
    marking: markup,
    tool: markTool,
    color: MARK_COLORS[0]!,
    size: 4,
    canUndo: false,
  });
  cap.view = 'editor';
}

export function setTool(t: MarkTool): void {
  markTool = cap.editor.tool = t;
}

/** Drawing on the editor canvas; plain DOM on the hot path. Returns undo / commitText / teardown. */
export function attachEditor(canvas: HTMLCanvasElement, ed: HTMLElement, img: CanvasImageSource) {
  const ctx = canvas.getContext('2d')!;
  const items: MarkItem[] = [];
  const ac = new AbortController();
  const { signal } = ac;
  let text: { inp: HTMLInputElement; x: number; y: number; fs: number; color: string } | null =
    null;
  const w = canvas.width,
    h = canvas.height;
  canvas.style.cssText = editorCanvasStyle(w, h, devicePixelRatio);
  const sync = () => (cap.editor.canUndo = items.length > 0);
  const paint = () => {
    ctx.drawImage(img, 0, 0);
    items.forEach((s) => drawItem(ctx, s));
  };
  const undo = () => {
    items.pop();
    paint();
    sync();
  };
  const commitText = () => {
    const t = text;
    if (!t) return;
    text = null;
    const v = t.inp.value.trim();
    t.inp.remove();
    if (!v) return;
    const it: MarkItem = {
      tool: 'text',
      color: t.color,
      size: 0,
      k: 1,
      pts: [[t.x, t.y]],
      fs: t.fs,
      text: v,
    };
    items.push(it);
    sync();
    drawItem(ctx, it);
  };
  const startText = (e: PointerEvent, b: DOMRect, k: number) => {
    const fsCss = textFontCss(cap.editor.size);
    const color = cap.editor.color;
    const inp = document.createElement('input');
    inp.className = 'txt';
    inp.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY - fsCss / 2 - 2}px;font-size:${fsCss}px;color:${color};min-width:40px;field-sizing:content;padding:0 2px;margin:0;border:0;outline:1.5px dashed var(--color-accent);background:transparent;font-weight:600;line-height:1.2;pointer-events:auto;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`;
    text = { inp, x: (e.clientX - b.left) * k, y: (e.clientY - b.top) * k, fs: fsCss * k, color };
    inp.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') commitText();
      if (ev.key === 'Escape') {
        text = null;
        inp.remove();
      }
    });
    inp.addEventListener('blur', commitText);
    ed.append(inp);
    setTimeout(() => inp.focus());
  };

  canvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!cap.editor.marking || e.button !== 0) return;
      e.preventDefault();
      if (text) return commitText(); // a click while typing just finishes the text
      const b = canvas.getBoundingClientRect();
      const k = canvas.width / b.width;
      if (cap.editor.tool === 'text') return startText(e, b, k);
      const pt = (ev: PointerEvent): Pt => [(ev.clientX - b.left) * k, (ev.clientY - b.top) * k];
      const s: MarkItem = {
        tool: cap.editor.tool,
        color: cap.editor.color,
        size: cap.editor.size * k,
        k,
        pts: [pt(e)],
      };
      items.push(s);
      sync();
      if (s.tool === 'pen') drawItem(ctx, s);
      canvas.setPointerCapture?.(e.pointerId);
      // shapes are previewed on a screen-sized layer and drawn into the image once on release:
      // repainting a full-page shot on every move is what made it lag
      const dpr = devicePixelRatio;
      const prev = s.tool === 'pen' ? null : document.createElement('canvas');
      const pctx = prev?.getContext('2d') ?? null;
      if (prev) {
        prev.width = Math.round(innerWidth * dpr);
        prev.height = Math.round(innerHeight * dpr);
        prev.style.cssText = `position:fixed;left:0;top:0;width:${innerWidth}px;height:${innerHeight}px;pointer-events:none`;
        ed.append(prev);
      }
      const drag = new AbortController();
      const opts = { signal: AbortSignal.any([signal, drag.signal]) };
      canvas.addEventListener(
        'pointermove',
        (ev) => {
          if (s.tool === 'pen') {
            s.pts.push(pt(ev));
            return drawItem(ctx, s, s.pts.length - 1); // only the new segment
          }
          s.pts[1] = pt(ev);
          if (!prev || !pctx) return;
          pctx.setTransform(1, 0, 0, 1, 0, 0);
          pctx.clearRect(0, 0, prev.width, prev.height);
          pctx.setTransform(dpr / k, 0, 0, dpr / k, b.left * dpr, b.top * dpr);
          drawItem(pctx, s);
        },
        opts,
      );
      canvas.addEventListener(
        'pointerup',
        () => {
          drag.abort();
          prev?.remove();
          if (s.tool === 'pen') return;
          if (isTooSmall(s.pts[0]!, s.pts[1], k)) {
            items.pop();
            sync();
          } else drawItem(ctx, s);
        },
        opts,
      );
    },
    { signal },
  );

  setViewKey((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      undo();
      return true;
    }
    if (!cap.editor.marking || e.ctrlKey || e.metaKey || e.altKey) return false;
    const t = MARK_TOOLS.find((x) => x.key === e.key.toLowerCase());
    if (!t) return false;
    setTool(t.id);
    return true;
  });
  paint();
  return {
    undo,
    commitText,
    destroy: () => {
      ac.abort();
      text?.inp.remove();
      setViewKey(null);
    },
  };
}
