import { fakeBrowser } from 'wxt/testing/fake-browser';

// Module level, not beforeEach, so a test file's own stub (fullpage, persist, bridge) still wins.
// fakeBrowser has no i18n.getMessage; the UI renders keys as labels.
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
// nor runtime.onConnect, which the side panel bridge listens on
fakeBrowser.runtime.onConnect.addListener = () => {};
fakeBrowser.runtime.onConnect.removeListener = () => {};
