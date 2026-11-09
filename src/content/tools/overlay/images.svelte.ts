import {
  DEFAULT_OVERLAY_PREFS,
  type OverlayImage,
  type OverlayPrefs,
} from '../../../lib/tools/overlay-image';

/** Image settings, selection and comparison prefs the panel renders; the <img> elements stay out of the proxy. */
export const overlay = $state({
  images: [] as OverlayImage[],
  sel: -1,
  prefs: { ...DEFAULT_OVERLAY_PREFS } as OverlayPrefs,
});
