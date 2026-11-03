import { detectAll } from '../lib/tech/signatures';

/** Run by run_tech_detection in the page's MAIN world; the result is executeScript's value. */
export default defineUnlistedScript(() => detectAll(window));
