import { expect, it } from 'vitest';
import { frameLayout } from './frame';

it('frameLayout scales padding by dpr; no frame at 0', () => {
  expect(frameLayout(100, 50, 32, 2)).toEqual({
    width: 228,
    height: 178,
    x: 64,
    y: 64,
    radius: 16,
    shadow: 48,
  });
  expect(frameLayout(100, 50, 0, 2)).toMatchObject({ width: 100, height: 50, radius: 0 });
});
