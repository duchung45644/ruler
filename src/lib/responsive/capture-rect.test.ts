import { expect, it } from 'vitest';
import { frameRectToParent } from './capture-rect';

it('offsets by the iframe origin and scales by zoom', () => {
  expect(
    frameRectToParent({ left: 10, top: 20, right: 110, bottom: 70 }, { left: 300, top: 100 }, 0.5),
  ).toEqual({ left: 305, top: 110, right: 355, bottom: 135 });
});

it('zoom 1 is a plain offset', () => {
  expect(
    frameRectToParent({ left: 0, top: 0, right: 5, bottom: 5 }, { left: 1, top: 2 }, 1),
  ).toEqual({ left: 1, top: 2, right: 6, bottom: 7 });
});
