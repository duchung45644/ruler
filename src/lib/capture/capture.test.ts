import { describe, expect, it } from 'vitest';
import {
  cropSource,
  dragSel,
  elementCaptureRect,
  hitSel,
  isFullyVisible,
  isValidSel,
  placeSelBar,
  screenshotName,
} from './capture';

const r = { x: 100, y: 100, w: 200, h: 100 };

describe('hitSel', () => {
  it('finds corners, edges, move and misses', () => {
    expect(hitSel(null, 5, 5)).toBeNull();
    expect(hitSel(r, 100, 100)).toBe('tl');
    expect(hitSel(r, 200, 96)).toBe('t');
    expect(hitSel(r, 305, 200)).toBe('br');
    expect(hitSel(r, 200, 150)).toBe('move');
    expect(hitSel(r, 50, 50)).toBeNull();
  });
});

describe('dragSel', () => {
  it('draws a new area backwards', () => {
    expect(dragSel(null, null, 50, 50, 10, 20, 800, 600)).toEqual({ x: 10, y: 20, w: 40, h: 30 });
  });
  it('clamps a move inside the viewport', () => {
    expect(dragSel('move', r, 200, 150, 900, 150, 800, 600).x).toBe(600);
  });
  it('flips when an edge crosses the opposite one', () => {
    expect(dragSel('l', r, 100, 150, 350, 150, 800, 600)).toEqual({
      x: 300,
      y: 100,
      w: 50,
      h: 100,
    });
  });
});

it('isValidSel needs 4px each way', () => {
  expect(isValidSel({ x: 0, y: 0, w: 3, h: 50 })).toBe(false);
  expect(isValidSel(r)).toBe(true);
});

describe('placeSelBar', () => {
  it('below, above, then inside', () => {
    expect(placeSelBar(r, 240, 42, 800, 600)).toEqual({ top: 208, left: 60 });
    expect(placeSelBar({ ...r, y: 520 }, 240, 42, 800, 600).top).toBe(470);
    expect(placeSelBar({ x: 0, y: 10, w: 100, h: 585 }, 240, 42, 800, 600).top).toBe(
      10 + 585 - 42 - 8,
    );
  });
});

it('cropSource scales by image/viewport width', () => {
  expect(cropSource({ x: 10, y: 20, w: 30, h: 40 }, 1600, 800)).toEqual({
    sx: 20,
    sy: 40,
    w: 60,
    h: 80,
  });
});

it('elementCaptureRect pads 50px, clamps, scales by dpr', () => {
  expect(
    elementCaptureRect([{ left: 100, top: 100, right: 200, bottom: 150 }], 800, 600, 2),
  ).toEqual({
    left: 100,
    top: 100,
    right: 500,
    bottom: 400,
  });
  expect(elementCaptureRect([], 800, 600, 2)).toEqual({
    left: 0,
    top: 0,
    right: 1600,
    bottom: 1200,
  });
});

it('screenshotName', () => {
  expect(screenshotName('', new Date('2026-11-03T10:20:30.456Z'))).toBe(
    'screenshot-2026-11-03T10-20-30-456Z.png',
  );
});

it('isFullyVisible', () => {
  expect(isFullyVisible({ left: 0, top: 0, right: 800, bottom: 600 }, 800, 600)).toBe(true);
  expect(isFullyVisible({ left: 0, top: -1, right: 10, bottom: 10 }, 800, 600)).toBe(false);
});
