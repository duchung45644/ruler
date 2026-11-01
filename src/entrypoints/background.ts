import { browser, defineBackground } from '#imports';

export default defineBackground(() => {
  browser.action.onClicked.addListener(({ id: tabId }) => {
    if (tabId === undefined) return;
    browser.scripting
      .executeScript({ target: { tabId }, files: ['/content-scripts/content.js'] })
      .catch(() => {}); // trang không inject được (edge://, store)
  });
});
