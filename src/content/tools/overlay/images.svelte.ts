import type { OverlayImage } from '../../../lib/tools/overlay-image';

/** Image settings and selection the panel renders; the <img> elements stay out of the proxy. */
export const overlay = $state({ images: [] as OverlayImage[], sel: -1 });
