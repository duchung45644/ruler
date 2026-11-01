import { expect, it } from 'vitest';
import { applyField, fieldValues, hitBox, nudgeBox, resizeBox } from './measure';

const box = { l: 100, t: 100, r: 200, b: 200 };
const view = { x: 0, y: 0, width: 1000, height: 800 };
const k = (e: Partial<KeyboardEvent> & { key: string }) => ({
  shiftKey: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
  ...e,
});

it('hitBox: corners, inside, outside, scroll', () => {
  const s = { x: 0, y: 0 };
  expect(hitBox(box, 105, 95, s)).toEqual({ mode: 'resize', corner: 'tl' });
  expect(hitBox(box, 195, 205, s)).toEqual({ mode: 'resize', corner: 'br' });
  expect(hitBox(box, 150, 150, s)).toEqual({ mode: 'move' });
  expect(hitBox(box, 300, 300, s)).toBeNull();
  expect(hitBox(box, 150, 100, { x: 0, y: 50 })).toEqual(hitBox(box, 150, 150, s));
});

it('resizeBox moves the grabbed corner and normalizes', () => {
  expect(resizeBox(box, 'br', 250, 260)).toEqual({ l: 100, t: 100, r: 250, b: 260 });
  expect(resizeBox(box, 'tl', 300, 50)).toEqual({ l: 200, t: 50, r: 300, b: 200 });
});

it('nudgeBox: move, expand, shrink, ignored combos', () => {
  expect(nudgeBox(box, k({ key: 'ArrowRight', shiftKey: true }))).toEqual({
    ...box,
    l: 110,
    r: 210,
  });
  expect(nudgeBox(box, k({ key: 'ArrowLeft', ctrlKey: true }))!.l).toBe(99);
  expect(nudgeBox(box, k({ key: 'ArrowLeft', ctrlKey: true, altKey: true }))!.l).toBe(101);
  expect(nudgeBox(box, k({ key: 'ArrowLeft', altKey: true, shiftKey: true }))).toBeNull();
  expect(nudgeBox(box, k({ key: 'ArrowLeft', metaKey: true }))).toBeNull();
  expect(nudgeBox(box, k({ key: 'a' }))).toBeNull();
});

it('applyField: default box, edge distances, values', () => {
  expect(applyField(null, 'w', 300, { width: 1000, height: 800 }, view)).toEqual({
    l: 450,
    t: 350,
    r: 750,
    b: 450,
  });
  const page = { width: 1200, height: 3000 };
  expect(applyField(box, 'r', 0, page, view).r).toBe(1200);
  expect(applyField(box, 'l', 0, page, view)).toEqual({ l: 0, t: 100, r: 100, b: 200 });
  expect(fieldValues(box, page)).toEqual({ w: 100, h: 100, l: 100, t: 100, r: 1000, b: 2800 });
});
