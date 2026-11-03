import { expect, it } from 'vitest';
import { type Action, History } from './history';

const action = (at = 0, coalesceKey?: string): Action => ({
  undo: () => null,
  redo: () => null,
  elementIds: [],
  coalesceKey,
  at,
});

it('keeps at most 50 steps', () => {
  const h = new History();
  for (let i = 0; i < 51; i++) h.push(action());
  for (let i = 0; i < 50; i++) expect(h.undo()).not.toBeNull();
  expect(h.state()).toEqual({ canUndo: false, canRedo: true });
});

it('clears redo on push', () => {
  const h = new History();
  h.push(action());
  h.undo();
  expect(h.state().canRedo).toBe(true);
  h.push(action());
  expect(h.state()).toEqual({ canUndo: true, canRedo: false });
});

it('coalesces within the window only', () => {
  const h = new History();
  const a = action(1000, 'cls:a');
  h.push(a);
  expect(h.coalesce('cls:a', 1600)).toBe(a);
  expect(h.coalesce('cls:a', 1601)).toBeNull();
  expect(h.coalesce('cls:b', 1100)).toBeNull();
});
