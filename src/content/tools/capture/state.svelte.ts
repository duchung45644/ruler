import type { SelRect } from '../../../lib/capture';
import type { MarkTool } from '../../../lib/markup';

export type EditorImage = HTMLImageElement | HTMLCanvasElement;

/** Reactive view state of the open capture UI (rendered by CaptureRoot). */
export const cap = $state({
  view: 'bar' as 'bar' | 'editor',
  snap: '',
  /** Mode bar shown until an area is drawn (4.14, like Edge). */
  modeBar: true,
  /** "Selected element" button handler (4.07), only when something is selected. */
  element: null as (() => void) | null,
  /** Released valid selection: the area bar sits next to it. */
  sel: null as SelRect | null,
  editor: {
    img: null as EditorImage | null,
    note: null as string | null,
    marking: false,
    tool: 'arrow' as MarkTool,
    color: '',
    size: 4,
    canUndo: false,
  },
});
