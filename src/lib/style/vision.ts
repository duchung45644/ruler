export const VISION_MODES = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
  'blurred',
] as const;
export type VisionMode = (typeof VISION_MODES)[number];

/**
 * 3×3 linear-RGB matrices: Machado, Oliveira & Fernandes (2009), severity 1.0 for the
 * dichromacies; Rec. 709 luminance for achromatopsia.
 */
const MATRICES: Partial<Record<VisionMode, number[]>> = {
  protanopia: [
    0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039,
  ],
  achromatopsia: [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722],
};

/** feColorMatrix `values` (4×5, alpha untouched) of a colour mode; null for none / blurred. */
export function colorMatrix(mode: VisionMode): string | null {
  const m = MATRICES[mode];
  if (!m) return null;
  const row = (i: number) => [...m.slice(i * 3, i * 3 + 3), 0, 0].join(' ');
  return `${row(0)} ${row(1)} ${row(2)} 0 0 0 1 0`;
}

/** Blur of the "blurred vision" mode (a rough stand-in for low acuity). */
export const BLUR_PX = 3;

/** CSS `filter` value for `mode`; `id(mode)` names the SVG filter element of a colour mode. */
export function visionFilter(mode: VisionMode, id: (mode: VisionMode) => string): string {
  if (mode === 'none') return '';
  if (mode === 'blurred') return `blur(${BLUR_PX}px)`;
  return `url(#${id(mode)})`;
}
