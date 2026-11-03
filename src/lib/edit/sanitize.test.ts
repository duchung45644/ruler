import { expect, it } from 'vitest';
import { isSafeUrl, sanitizeHtml } from './sanitize';

const clean = (html: string): string => {
  const div = document.createElement('div');
  div.append(sanitizeHtml(html));
  return div.innerHTML;
};

it('drops event handlers and blocked tags', () => {
  expect(clean('<p onclick="x">a<script>1</script></p>')).toBe('<p>a</p>');
  expect(clean('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
  expect(clean('<svg><script>1</script></svg>')).not.toContain('script');
});

it('drops unsafe urls and keeps safe ones', () => {
  expect(clean('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
  expect(clean('<a href="java\tscript:alert(1)">x</a>')).toBe('<a>x</a>');
  expect(clean('<a href="https://x">x</a>')).toBe('<a href="https://x">x</a>');
  expect(clean('<img src="data:image/png;base64,AA">')).toContain('src=');
  expect(clean('<a href="data:text/html,<b>">x</a>')).toBe('<a>x</a>');
  expect(isSafeUrl('data:image/svg+xml,<svg/>')).toBe(false);
  expect(isSafeUrl('/rel?a=b:c')).toBe(true);
  expect(isSafeUrl('mailto:a@b')).toBe(true);
});

it('drops blocked attributes', () => {
  expect(clean('<iframe srcdoc="x"></iframe>')).toBe('');
  expect(clean('<button formaction="https://x">b</button>')).toBe('<button>b</button>');
  expect(clean('<div style="x">d</div>')).toBe('<div>d</div>');
});
