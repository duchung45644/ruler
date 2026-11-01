/**
 * Phase 2 tools, in legacy order. Each init* restores itself from getSettings() (1.43).
 * Registration order matters for addKeyHandler: overlay images before measure (1.02 / 3.15).
 */
export async function initTools(): Promise<void> {
  // initXray, initBreakpoints, initGrid, initRuler, initOverlayImages, initMeasure,
  // initFind, initEyedropper, initAudit: each later task adds its line here.
}
