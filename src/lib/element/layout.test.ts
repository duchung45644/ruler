import { expect, it } from 'vitest';
import { elementLayout } from './layout';
import { styleOf } from './test-fixtures';

it('returns flex info, grid info with compacted tracks, else null', () => {
  expect(elementLayout(styleOf({ display: 'block' }))).toBeNull();
  expect(
    elementLayout(styleOf({ display: 'flex', 'flex-direction': 'row', gap: '4px' })),
  ).toMatchObject({ display: 'flex', flexDirection: 'row', gap: '4px' });
  expect(
    elementLayout(
      styleOf({
        display: 'grid',
        'grid-template-columns': '10px 10px 10px',
        'grid-template-rows': 'none',
      }),
    ),
  ).toMatchObject({ gridTemplateColumns: 'repeat(3, 10px)', columnCount: 3, rowCount: 2 });
});
