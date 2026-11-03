import { afterEach, expect, it, vi } from 'vitest';
import { assetFileName, collectAssetRefs, cssUrls, justifiedRows } from './assets';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it('names files from the url path or the fallback', () => {
  expect(assetFileName('https://a.com/img/logo.png?v=2', 'asset')).toBe('logo.png');
  expect(assetFileName('data:image/png;base64,AAAA', 'asset')).toBe('asset.png');
  expect(assetFileName('https://a.com/', 'asset')).toBe('asset');
});

it('lays out justified rows', () => {
  expect(
    justifiedRows(
      [
        { w: 100, h: 100 },
        { w: 200, h: 100 },
      ],
      300,
      100,
      0,
    ),
  ).toEqual([{ items: [0, 1], height: 100 }]);
  expect(justifiedRows(Array(4).fill({ w: 100, h: 100 }), 300, 100, 0)).toHaveLength(2);
});

it('collects img, background urls and inline svg once each', () => {
  expect(cssUrls('url("a.png"), linear-gradient(red, blue), url(b.png)')).toEqual([
    'a.png',
    'b.png',
  ]);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 20, 20));
  document.body.innerHTML =
    '<div style="background-image:url(https://x.test/bg.png)"><img src="https://x.test/a.png"><img src="https://x.test/a.png"><svg><rect/></svg><svg><use href="#s"/></svg></div>';
  const assets = collectAssetRefs(document.body.firstElementChild!);
  expect(assets.map((a) => a.type)).toEqual(['background-image', 'src', 'svg']);
});
