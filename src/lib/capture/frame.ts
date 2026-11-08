/** Background frame around a capture, like code-screenshot apps: padding, backdrop, rounded shadowed image. */
export const PADDINGS = [0, 16, 32, 64] as const;
export type Padding = (typeof PADDINGS)[number];

export const BACKDROPS = [
  { id: 'gradient', css: 'linear-gradient(135deg,#a5b4fc,#f9a8d4)', stops: ['#a5b4fc', '#f9a8d4'] },
  { id: 'sky', css: 'linear-gradient(135deg,#7dd3fc,#a7f3d0)', stops: ['#7dd3fc', '#a7f3d0'] },
  { id: 'light', css: '#f4f4f5', stops: ['#f4f4f5'] },
  { id: 'dark', css: '#27272a', stops: ['#27272a'] },
] as const;
export type BackdropId = (typeof BACKDROPS)[number]['id'];

/** Output geometry in image px; `pad` and the corner radius are CSS px scaled by `dpr`. */
export function frameLayout(w: number, h: number, pad: number, dpr: number) {
  const p = Math.round(pad * dpr);
  return {
    width: w + 2 * p,
    height: h + 2 * p,
    x: p,
    y: p,
    radius: p ? Math.round(8 * dpr) : 0,
    shadow: p ? Math.round(24 * dpr) : 0,
  };
}
