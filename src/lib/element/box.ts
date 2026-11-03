import type { BoxModel, Sides } from './types';
import type { StyleLike } from './style';

const sides = (s: StyleLike, prop: (side: string) => string): Sides => {
  const v = (side: string) => parseInt(s.getPropertyValue(prop(side)), 10) || 0;
  return { top: v('top'), right: v('right'), bottom: v('bottom'), left: v('left') };
};

/** Port of `k` (content.js:39948): whole px per side, content box = border box minus both. */
export function boxModel(style: StyleLike, rect: { width: number; height: number }): BoxModel {
  const margin = sides(style, (d) => `margin-${d}`);
  const border = sides(style, (d) => `border-${d}-width`);
  const padding = sides(style, (d) => `padding-${d}`);
  return {
    width: rect.width,
    height: rect.height,
    contentWidth: rect.width - padding.left - padding.right - border.left - border.right,
    contentHeight: rect.height - padding.top - padding.bottom - border.top - border.bottom,
    margin,
    border,
    padding,
  };
}
