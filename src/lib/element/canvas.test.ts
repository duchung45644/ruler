import { expect, it, vi } from 'vitest';
import { canvasInfo, canvasPalette } from './canvas';

const pixels = (...runs: [number, [number, number, number, number]][]) => {
  const out: number[] = [];
  for (const [n, px] of runs) for (let i = 0; i < n; i++) out.push(...px);
  return new Uint8ClampedArray(out);
};

it('drops translucent pixels and keeps colours at or above 1%', () => {
  expect(canvasPalette(pixels([100, [255, 0, 0, 255]], [1, [0, 0, 255, 50]]), 101, 1)).toEqual([
    '#FF0000',
  ]);
  expect(canvasPalette(pixels([99, [250, 2, 0, 255]], [1, [0, 0, 255, 255]]), 100, 1)).toEqual([
    '#FF0000',
    '#0000FF',
  ]);
  expect(canvasPalette(pixels([99, [255, 0, 0, 255]], [1, [240, 10, 10, 255]]), 100, 1)).toEqual([
    '#FF0000',
  ]);
});

it('is null for anything but a canvas', () => {
  expect(canvasInfo(document.createElement('div'), 10)).toBeNull();
});

it('never calls getContext on the page canvas', () => {
  const c = document.createElement('canvas');
  c.width = 200;
  const spy = vi.spyOn(c, 'getContext');
  expect(canvasInfo(c, 100)).toEqual({ contextType: null, width: 200, height: 150, pixelRatio: 2 });
  expect(spy).not.toHaveBeenCalled();
});
