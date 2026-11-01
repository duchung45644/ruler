import { afterEach, expect, it } from 'vitest';
import { ownNodes } from '../../core/events';
import { items } from '../../core/registry.svelte';
import { stopSession } from '../../core/session';
import { addImage, initOverlay } from '.';

afterEach(() => stopSession());

it('registers the overlay item and stopSession leaves the page clean (Review Focus 5)', () => {
  initOverlay();
  const o = items.find((i) => i.id === 'overlay')!;
  expect([o.group, o.key, o.label]).toEqual(['designTools', 'o', 'dock.overlay']);
  addImage('data:image/png;base64,x', { width: 400, height: 300 });
  addImage('data:image/png;base64,y', { width: 400, height: 300 });
  expect(document.querySelectorAll('img[data-bo-doi]')).toHaveLength(2);
  expect(ownNodes.size).toBe(2);
  stopSession();
  expect(document.querySelectorAll('img[data-bo-doi]')).toHaveLength(0);
  expect(ownNodes.size).toBe(0);
});
