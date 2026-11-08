import type { Box } from '../../../lib/tools/measure';

/** The measured box (page coordinates); raw so the panel reruns on set, not on deep reads. */
class Measure {
  box = $state.raw<Box | null>(null);
}
export const measure = new Measure();
