import { afterEach, expect, it, vi } from 'vitest';
import { items } from '../core/registry.svelte';
import { layer } from '../core/overlay';
import { stopSession } from '../core/session';
import { initTools } from '.';

afterEach(() => {
  stopSession();
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

it('registers inspectTools in legacy dock order', async () => {
  await initTools();
  const ids = items.filter((i) => i.group === 'inspectTools').map((i) => i.id);
  expect(ids).toEqual(['xray', 'grid', 'breakpoints']);
});

const flush = () => new Promise((r) => setTimeout(r, 50));

it.each([
  ['resolves', () => Promise.resolve({ sRGBHex: '#ff0000' })],
  ['is cancelled', () => Promise.reject(new DOMException('cancel', 'AbortError'))],
])('eyedropper shows the UI again when the picker %s', async (_, open) => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  host.attachShadow({ mode: 'open' }).append(layer);
  const spy = vi.fn(open);
  vi.stubGlobal(
    'EyeDropper',
    class {
      open = spy;
    },
  );
  await initTools();
  const run = items.find((i) => i.id === 'eyedropper')!.run;
  run();
  expect(host.hasAttribute('data-hidden')).toBe(true);
  run(); // busy: ignored
  await flush();
  expect(spy).toHaveBeenCalledOnce();
  expect(host.hasAttribute('data-hidden')).toBe(false);
});
