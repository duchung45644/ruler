import { describe, expect, it } from 'vitest';
import { filterEntries, isCheatSheetKey, isPaletteKey, matchScore, orderIds } from './palette';

const key = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);

describe('palette keys', () => {
  it('Ctrl+K and Cmd+K open, plain k does not', () => {
    expect(isPaletteKey(key({ key: 'k', ctrlKey: true }))).toBe(true);
    expect(isPaletteKey(key({ key: 'K', metaKey: true }))).toBe(true);
    expect(isPaletteKey(key({ key: 'k' }))).toBe(false);
    expect(isPaletteKey(key({ key: 'k', ctrlKey: true, shiftKey: true }))).toBe(false);
  });
  it('? opens the cheat sheet', () => {
    expect(isCheatSheetKey(key({ key: '?', shiftKey: true }))).toBe(true);
    expect(isCheatSheetKey(key({ key: '?', ctrlKey: true }))).toBe(false);
  });
});

describe('orderIds', () => {
  it('puts dock order first, then the rest in registration order', () => {
    expect(orderIds(['quit', 'breakpoints', 'ruler', 'inspect'], [['inspect'], ['ruler']])).toEqual(
      ['inspect', 'ruler', 'quit', 'breakpoints'],
    );
  });
});

describe('matchScore / filterEntries', () => {
  it('ranks prefix > word start > substring > fuzzy', () => {
    expect(matchScore('Page Rulers', 'page')).toBe(3);
    expect(matchScore('Page Rulers', 'rul')).toBe(2);
    expect(matchScore('Page Rulers', 'ulers')).toBe(1);
    expect(matchScore('Page Rulers', 'prl')).toBe(0.5);
    expect(matchScore('Page Rulers', 'xyz')).toBeNull();
  });
  it('ignores case and diacritics', () => {
    expect(matchScore('Màu & phông chữ', 'MAU')).toBe(3);
    expect(matchScore('Màu & phông chữ', 'phong')).toBe(2);
  });
  it('empty query keeps everything in order', () => {
    expect(filterEntries(['b', 'a'], '  ', (s) => s)).toEqual(['b', 'a']);
  });
  it('sorts by score, stable on ties', () => {
    const labels = ['Measure area', 'Page Rulers', 'Ruler grid', 'Pause'];
    expect(filterEntries(labels, 'ru', (s) => s)).toEqual(['Ruler grid', 'Page Rulers']);
    expect(filterEntries(labels, 'a', (s) => s)).toEqual(['Measure area', 'Page Rulers', 'Pause']);
  });
});
