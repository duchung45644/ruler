import { expect, it } from 'vitest';
import { detachBounds, panelPath, readHandoff } from './panels';

it('builds panel paths', () => {
  expect(panelPath(5)).toBe('sidepanel.html?tabId=5');
  expect(panelPath(5, true)).toBe('sidepanel.html?tabId=5&detached=1');
});

it('detachBounds: saved, then sent (rounded), then 400×800', () => {
  expect(detachBounds(null, null)).toEqual({ width: 400, height: 800 });
  expect(detachBounds(null, { width: 350.6, height: 0 })).toEqual({ width: 351, height: 800 });
  expect(detachBounds({ width: 500, height: 900, left: 10, top: NaN }, null)).toEqual({
    width: 500,
    height: 900,
  });
  expect(detachBounds({ width: 0, height: 900, left: 10, top: 20 }, { width: 300 })).toEqual({
    width: 300,
    height: 900,
    left: 10,
    top: 20,
  });
});

it('readHandoff expires after 30s', () => {
  const h = { selectedTab: 'page' as const, scrollTop: 40, at: 0 };
  expect(readHandoff(h, 30000)).toBe(h);
  expect(readHandoff(h, 30001)).toBeNull();
  expect(readHandoff(undefined, 0)).toBeNull();
});
