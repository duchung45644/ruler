import { initAudit } from './audit';
import { initBreakpoints } from './breakpoints';
import { initCapture } from './capture';
import { initEyedropper } from './eyedropper';
import { initFind } from './find';
import { initGrid } from './grid';
import { initMeasure } from './measure';
import { initOverlay } from './overlay';
import { initRuler } from './ruler';
import { initSidePanel } from '../sidepanel';
import { initEdit } from '../edit';
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
  initFind(); // utilities: after eyedropper (legacy dock order)
  initCapture(); // utilities: after find
  initOverlay(); // designTools: before measure so its arrow keys win (legacy load order)
  await initMeasure();
  initAudit(); // designTools: after measure (legacy dock order)
  await initSidePanel();
  initEdit(); // after the bridge: edit mode reuses its element ids
}
