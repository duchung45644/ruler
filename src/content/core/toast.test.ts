import { afterEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { mountLayer } from './overlay';
import { showToast } from './toast';

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

it('keeps a single toast and removes it after the timeout', () => {
  vi.useFakeTimers();
  const shadow = document.body.appendChild(document.createElement('div')).attachShadow({
    mode: 'open',
  });
  const detach = mountLayer(shadow);
  showToast('one');
  showToast('two');
  flushSync();
  const toasts = shadow.querySelectorAll('[data-toast]');
  expect(toasts).toHaveLength(1);
  expect(toasts[0]!.textContent?.trim()).toBe('two');
  vi.advanceTimersByTime(5000);
  expect(shadow.querySelectorAll('[data-toast]')).toHaveLength(0);
  detach();
});
