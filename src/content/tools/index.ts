import { initBreakpoints } from './breakpoints';
import './eyedropper';
import { initXray } from './xray';

/**
 * Phase 2 tools, in legacy order. Each init* restores itself from getSettings() (1.43).
 * Registration order matters for addKeyHandler: overlay images before measure (1.02 / 3.15).
 */
export async function initTools(): Promise<void> {
  // initGrid, initRuler, initOverlayImages, initMeasure, initFind, initAudit: later tasks add theirs.
  await initXray();
  await initBreakpoints();
}
