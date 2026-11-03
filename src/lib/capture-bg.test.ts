import { expect, it } from 'vitest';
import { chunkClips, cropBox, nextCaptureDelay } from './capture-bg';

it('nextCaptureDelay', () => {
  expect(nextCaptureDelay(1000, 1200)).toBe(350);
  expect(nextCaptureDelay(0, 5000)).toBe(0);
});

it('cropBox keeps at least 1px', () => {
  expect(cropBox({ left: 10.4, top: 0, right: 10.6, bottom: 0 })).toEqual({
    x: 10.4,
    y: 0,
    w: 1,
    h: 1,
  });
});

it('chunkClips', () => {
  const c = chunkClips(20000, 8000, 900, 1280);
  expect(c).toHaveLength(3);
  expect(c[2]).toMatchObject({ y: 16900, height: 4000, width: 1280 });
});
