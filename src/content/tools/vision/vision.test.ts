import { afterEach, expect, it } from 'vitest';
import { setVision } from '.';

afterEach(() => setVision('none'));

it('filters <html> from our own <style>, leaving its style attribute alone', () => {
  const html = document.documentElement;
  html.setAttribute('style', '--brand: red');
  setVision('deuteranopia');
  expect(html.getAttribute('style')).toBe('--brand: red');
  expect(document.querySelector('pixellens-vision style')!.textContent).toMatch(
    /^html\{filter:.+ !important\}$/,
  );
  setVision('none');
  expect(document.querySelector('pixellens-vision')).toBeNull();
  html.removeAttribute('style');
});
