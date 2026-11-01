import { describe, expect, it } from 'vitest';
import { detectPageIsDark, measureColor, resolveTheme } from './theme';

describe('resolveTheme', () => {
  it('system is opposite of page, falls back to prefersDark', () => {
    expect(resolveTheme('system', true, false)).toBe('light');
    expect(resolveTheme('system', false, true)).toBe('dark');
    expect(resolveTheme('system', null, true)).toBe('dark');
    expect(resolveTheme('dark', false, false)).toBe('dark');
  });
});

describe('measureColor', () => {
  it('picks by page brightness', () => {
    expect(measureColor(true)).toBe('#a5b4fc');
    expect(measureColor(false)).toBe('#4f46e5');
  });
});

describe('detectPageIsDark', () => {
  const set = (body: string, html = '') => {
    document.body.style.backgroundColor = body;
    document.documentElement.style.backgroundColor = html;
  };
  it('dark body', () => {
    set('rgb(10, 10, 10)');
    expect(detectPageIsDark(document)).toBe(true);
  });
  it('white body', () => {
    set('rgb(255, 255, 255)');
    expect(detectPageIsDark(document)).toBe(false);
  });
  it('all transparent', () => {
    set('transparent', 'rgba(0, 0, 0, 0)');
    expect(detectPageIsDark(document)).toBe(null);
  });
});
