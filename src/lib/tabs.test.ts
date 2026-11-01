import { describe, expect, it } from 'vitest';
import { isInjectable } from './tabs';

describe('isInjectable', () => {
  it.each([
    ['https://a.com', true],
    ['http://localhost:5173', true],
    ['file:///C:/a.html', true],
    ['chrome://extensions', false],
    ['edge://settings', false],
    ['chrome-extension://x/y.html', false],
    ['https://chromewebstore.google.com/detail/x', false],
    ['https://chrome.google.com/webstore/x', false],
    ['https://microsoftedge.microsoft.com/addons/x', false],
    ['about:blank', false],
    [undefined, false],
  ])('%s -> %s', (url, ok) => expect(isInjectable(url)).toBe(ok));
});
