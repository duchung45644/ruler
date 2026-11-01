import { initBreakpoints } from './breakpoints';
import { initEyedropper } from './eyedropper';
import { initGrid } from './grid';
import { initRuler } from './ruler';
import { initXray } from './xray';

/**
 * Phase 2 tools, in legacy dock order (getControlBar, legacy-src/content.js:30105):
 * xray, grid, ruler, breakpoints (inspectTools); eyedropper, find (utilities).
 * Each init* registers its dock item and restores itself from getSettings() (1.43).
 * Registration order matters for addKeyHandler: overlay images before measure (1.02 / 3.15).
 */
export async function initTools(): Promise<void> {
  await initXray();
  await initGrid();
  await initRuler();
  await initBreakpoints();
  initEyedropper();
  // initOverlayImages, initMeasure, initFind, initAudit: later tasks
}
