import { afterEach, expect, it, vi } from 'vitest';
import { pinViewportUnits } from './viewport-units';

afterEach(() => {
  vi.restoreAllMocks();
  document.head.replaceChildren();
  document.body.replaceChildren();
});

it('pins viewport-unit heights (nested in @media too) and restores the inline style', () => {
  document.head.innerHTML =
    '<style>.hero{min-height:100vh}@media (min-width:1px){.tall{height:50vh}}.plain{height:20px}</style>';
  document.body.innerHTML =
    '<div class="hero" style="color:red"></div><div class="tall"></div><div class="plain"></div><div class="inl" style="max-height:80svh"></div>';
  const [hero, tall, plain, inl] = [...document.body.children] as HTMLElement[];
  // happy-dom has no layout: the browser would report the current pixel size
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '800px',
  } as never);
  const unpin = pinViewportUnits([document]);
  expect(hero!.style.minHeight).toBe('800px');
  expect(hero!.style.getPropertyPriority('min-height')).toBe('important');
  expect(tall!.style.getPropertyPriority('height')).toBe('important');
  expect(inl!.style.getPropertyPriority('max-height')).toBe('important');
  expect(plain!.getAttribute('style')).toBeNull();
  unpin();
  expect(hero!.getAttribute('style')).toBe('color: red;');
  expect(tall!.style.height).toBe('');
  expect(inl!.style.maxHeight).toBe('80svh');
});
