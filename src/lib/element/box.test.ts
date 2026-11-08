import { expect, it } from 'vitest';
import { boxModel } from './box';
import { styleOf } from './test-fixtures';

it('reads whole px per side and derives the content box', () => {
  const b = boxModel(
    styleOf({ 'margin-top': '8px', 'padding-left': '4.6px', 'border-right-width': '1px' }),
    { width: 100, height: 20 },
  );
  expect(b.margin).toEqual({ top: 8, right: 0, bottom: 0, left: 0 });
  expect(b.padding.left).toBe(4);
  expect(b.contentWidth).toBe(95);
  expect(b.contentHeight).toBe(20);
});
