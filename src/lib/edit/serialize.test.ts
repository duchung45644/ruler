import { expect, it } from 'vitest';
import { isPersistedEdits, isSerializedEdit } from './serialize';

it('validates stored edits', () => {
  expect(isSerializedEdit({ own: true })).toBe(false);
  const own = {
    own: true,
    recordId: 'r1',
    wrappers: [],
    scopePath: [],
    scopeAddress: null,
    selector: '.x',
    declsText: 'color: red;',
  };
  expect(isSerializedEdit(own)).toBe(true);
  expect(
    isSerializedEdit({ ...own, own: false, stylesheet: 'a.css', originalSelector: '.x', occ: 0 }),
  ).toBe(true);
  expect(isPersistedEdits({ edits: [own], updatedAt: 1 })).toBe(true);
  expect(isPersistedEdits({ edits: [{}], updatedAt: 1 })).toBe(false);
});
