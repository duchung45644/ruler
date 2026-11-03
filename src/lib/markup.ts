/** Markup drawing, port of unpacked/scripts/bd/capture/editor.js. Image px. */
export const MARK_COLORS = ['#FF3B30', '#FFCC00', '#34C759', '#0A84FF', '#111111', '#FFFFFF'];
export const MARK_SIZES = [2, 4, 8];
export const MARK_TOOLS = [
  { id: 'pen', key: 'p', label: 'capture.pen' },
  { id: 'arrow', key: 'a', label: 'capture.arrow' },
  { id: 'rect', key: 'r', label: 'capture.rect' },
  { id: 'hl', key: 'h', label: 'capture.highlight' },
  { id: 'text', key: 't', label: 'capture.text' },
] as const;
export type MarkTool = (typeof MARK_TOOLS)[number]['id'];
export type Pt = [number, number];
export type MarkItem = {
  tool: MarkTool;
  color: string;
  size: number;
  k: number;
  pts: Pt[];
  text?: string;
  fs?: number;
};
type Ctx = Pick<
  CanvasRenderingContext2D,
  | 'save'
  | 'restore'
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'closePath'
  | 'stroke'
  | 'fill'
  | 'strokeRect'
  | 'fillRect'
  | 'fillText'
  | 'strokeStyle'
  | 'fillStyle'
  | 'lineWidth'
  | 'lineCap'
  | 'lineJoin'
  | 'globalAlpha'
  | 'font'
  | 'textBaseline'
>;

/** Legacy drawItem (editor.js:30); the pen draws from point `from - 1` (only the new segment). */
export function drawItem(c: Ctx, s: MarkItem, from = 1): void {
  const [a, b] = s.pts;
  if (!a) return;
  c.save();
  c.strokeStyle = c.fillStyle = s.color;
  c.lineWidth = s.size;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  if (s.tool === 'pen') {
    const p = s.pts;
    const st = p[Math.max(0, from - 1)]!;
    c.beginPath();
    c.moveTo(st[0], st[1]);
    for (let i = from; i < p.length; i++) c.lineTo(p[i]![0], p[i]![1]);
    if (p.length === 1) c.lineTo(st[0] + 0.01, st[1]); // a click leaves a dot
    c.stroke();
  } else if (s.tool === 'arrow' && b) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const head = s.size * 3 + 8 * s.k;
    // stop the shaft inside the head so its round cap doesn't poke through the tip
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0] - Math.cos(ang) * head * 0.6, b[1] - Math.sin(ang) * head * 0.6);
    c.stroke();
    c.beginPath();
    c.moveTo(b[0], b[1]);
    for (const d of [-0.45, 0.45])
      c.lineTo(b[0] - head * Math.cos(ang + d), b[1] - head * Math.sin(ang + d));
    c.closePath();
    c.fill();
  } else if ((s.tool === 'rect' || s.tool === 'hl') && b) {
    const x = Math.min(a[0], b[0]),
      y = Math.min(a[1], b[1]),
      w = Math.abs(b[0] - a[0]),
      h = Math.abs(b[1] - a[1]);
    if (s.tool === 'rect') c.strokeRect(x, y, w, h);
    else {
      c.globalAlpha = 0.35;
      c.fillRect(x, y, w, h);
    }
  } else if (s.tool === 'text' && s.text) {
    c.font = `600 ${s.fs}px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`;
    c.textBaseline = 'middle';
    c.fillText(s.text, a[0], a[1]);
  }
  c.restore();
}

/** Grab radius (CSS px) around an arrow's head or tail. */
export const ARROW_GRAB = 10;

/** Topmost arrow whose tail (end 0) or head (end 1) is within `r` image px of `p`. */
export function hitArrowEnd(items: MarkItem[], p: Pt, r: number): { i: number; end: 0 | 1 } | null {
  for (let i = items.length - 1; i >= 0; i--) {
    const s = items[i]!;
    if (s.tool !== 'arrow' || s.pts.length < 2) continue;
    for (const end of [1, 0] as const) {
      const q = s.pts[end]!;
      if (Math.hypot(q[0] - p[0], q[1] - p[1]) <= r) return { i, end };
    }
  }
  return null;
}

/** A shape needs an actual drag; plain clicks are dropped. */
export const isTooSmall = (a: Pt, z: Pt | undefined, k: number): boolean =>
  !z || Math.hypot(z[0] - a[0], z[1] - a[1]) < 4 * k;

export const textFontCss = (size: number): number => 10 + size * 3;

/** 1:1 with the page, shrunk to fit; tall full-page shots scroll instead of shrinking (4.11). */
export function editorCanvasStyle(imgW: number, imgH: number, dpr: number): string {
  const tall = imgH / imgW > 2;
  return `max-width:min(100%, ${imgW / dpr}px);max-height:${tall ? 'none' : 'calc(100vh - 100px)'}`;
}
