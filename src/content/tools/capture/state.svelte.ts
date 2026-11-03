import type { SelRect } from '../../../lib/capture';

/** Reactive view state of the open capture UI (rendered by CaptureRoot). */
export const cap = $state({
  snap: '',
  /** Mode bar shown until an area is drawn (4.14, like Edge). */
  modeBar: true,
  /** "Selected element" button handler (4.07), only when something is selected. */
  element: null as (() => void) | null,
  /** Released valid selection: the area bar sits next to it. */
  sel: null as SelRect | null,
});
