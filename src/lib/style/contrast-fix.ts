import { blend, contrastRatio, type Rgba } from './color';

type Hsl = { h: number; s: number; l: number };

function toHsl({ r, g, b }: Rgba): Hsl {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

function fromHsl({ h, s, l }: Hsl): Rgba {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  const ch = (v: number) => Math.round(Math.min(255, Math.max(0, (v + m) * 255)));
  return { r: ch(r), g: ch(g), b: ch(b), a: 1 };
}

type Shown = (c: Rgba) => Rgba;

/** Closest lightness on one side (towards `end`) reaching `target`; null when even `end` can't. */
function search(hsl: Hsl, bg: Rgba, target: number, end: 0 | 1, shown: Shown): Rgba | null {
  if (contrastRatio(shown(fromHsl({ ...hsl, l: end })), bg) < target) return null;
  let near = hsl.l; // fails
  let far: number = end; // passes
  for (let i = 0; i < 24; i++) {
    const mid = (near + far) / 2;
    if (contrastRatio(shown(fromHsl({ ...hsl, l: mid })), bg) >= target) far = mid;
    else near = mid;
  }
  return fromHsl({ ...hsl, l: far });
}

/**
 * Nearest foreground to `fg` (same hue and saturation, lightness moved the least) whose contrast
 * on the opaque `bg` reaches `target`. A translucent fg is judged as painted (blended over bg);
 * the suggestion is opaque. `opacity` (the element's) still applies to the suggestion, so it is
 * judged dimmed by it. Returns fg itself (opaque) when it already passes, null when no lightness
 * can reach the target.
 */
export function suggestForeground(fg: Rgba, bg: Rgba, target: number, opacity = 1): Rgba | null {
  const shown: Shown = (c) => blend({ ...c, a: opacity }, bg);
  const painted = blend(fg, bg);
  if (contrastRatio(shown(painted), bg) >= target) return painted;
  const hsl = toHsl(painted);
  const sides = [0, 1] as const;
  const options = sides
    .map((end) => search(hsl, bg, target, end, shown))
    .filter((c): c is Rgba => !!c);
  const dist = (c: Rgba) => Math.abs(toHsl(c).l - hsl.l);
  return options.sort((a, b) => dist(a) - dist(b))[0] ?? null;
}

/** AA and AAA suggestions for text (4.5 / 7, or 3 / 4.5 when large). */
export function suggestTextFixes(
  fg: Rgba,
  bg: Rgba,
  large: boolean,
  opacity = 1,
): { aa: Rgba | null; aaa: Rgba | null } {
  return {
    aa: suggestForeground(fg, bg, large ? 3 : 4.5, opacity),
    aaa: suggestForeground(fg, bg, large ? 4.5 : 7, opacity),
  };
}
