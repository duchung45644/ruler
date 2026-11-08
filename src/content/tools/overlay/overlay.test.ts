import { afterEach, expect, it, vi } from 'vitest';
import { ownNodes } from '../../core/events';
import { items } from '../../core/registry.svelte';
import { stopSession } from '../../core/session';
import { MAX_IMAGES, addImage, initOverlay, loadFiles } from '.';

afterEach(() => stopSession());

it('registers the overlay item and stopSession leaves the page clean (Review Focus 5)', () => {
  initOverlay();
  const o = items.find((i) => i.id === 'overlay')!;
  expect([o.group, o.key, o.label]).toEqual(['designTools', 'o', 'dock.overlay']);
  addImage('data:image/png;base64,x', { width: 400, height: 300 });
  addImage('data:image/png;base64,y', { width: 400, height: 300 });
  expect(document.querySelectorAll('img[data-iodob]')).toHaveLength(2);
  expect(ownNodes.size).toBe(2);
  stopSession();
  expect(document.querySelectorAll('img[data-iodob]')).toHaveLength(0);
  expect(ownNodes.size).toBe(0);
});

it('keeps at most MAX_IMAGES images', () => {
  initOverlay();
  for (let i = 0; i < MAX_IMAGES + 3; i++)
    addImage(`data:image/png;base64,${i}`, { width: 400, height: 300 });
  expect(document.querySelectorAll('img[data-iodob]')).toHaveLength(MAX_IMAGES);
});

it('an image that finishes loading after stopSession is dropped', () => {
  const readers: { onload: (() => void) | null; result: string }[] = [];
  vi.stubGlobal(
    'FileReader',
    class {
      onload: (() => void) | null = null;
      result = 'data:image/png;base64,x';
      readAsDataURL() {
        readers.push(this);
      }
    },
  );
  initOverlay();
  items.find((i) => i.id === 'overlay')!.run();
  loadFiles([new File(['x'], 'a.png', { type: 'image/png' })]);
  stopSession();
  readers[0]!.onload!();
  vi.unstubAllGlobals();
  expect(document.querySelectorAll('img[data-iodob]')).toHaveLength(0);
  expect(ownNodes.size).toBe(0);
});

it('arrow keys do not nudge an image while capturing (3.25)', async () => {
  const { routeKey } = await import('../../core/keys');
  const { state } = await import('../../core/state.svelte');
  const { overlay } = await import('./images.svelte');
  initOverlay();
  items.find((i) => i.id === 'overlay')!.run();
  addImage('data:image/png;base64,x', { width: 400, height: 300 });
  const x = overlay.images[0]!.x;
  state.capturing = true;
  routeKey(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  state.capturing = false;
  expect(overlay.images[0]!.x).toBe(x);
});
