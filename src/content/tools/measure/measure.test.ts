import { afterEach, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { items } from '../../core/registry.svelte';
import { routeKey } from '../../core/keys';
import { layer } from '../../core/overlay';
import { sessionSignal, stopSession } from '../../core/session';
import { installDragGuard } from '../../core/drag';
import { initTools } from '..';
import { measure } from './box.svelte';

afterEach(() => {
  stopSession();
  document.body.replaceChildren();
});

const ev = (type: string, x: number, y: number) =>
  new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true });

it('draws, moves, ignores arrows typed in the panel, clears on Esc and on toggle off', async () => {
  const host = document.createElement('pixellens-ui');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.append(layer);
  shadow.addEventListener('keydown', routeKey as EventListener);
  window.addEventListener('keydown', routeKey, { signal: sessionSignal() });
  installDragGuard(sessionSignal());
  await initTools();
  const item = items.find((i) => i.id === 'measure')!;
  item.run();
  flushSync();
  const w = shadow.querySelector<HTMLInputElement>('input[type=number]');
  expect(w).not.toBeNull();

  document.body.dispatchEvent(ev('pointerdown', 100, 100));
  window.dispatchEvent(ev('pointermove', 200, 150));
  document.body.dispatchEvent(ev('pointerup', 200, 150));
  expect(measure.box).toEqual({ l: 100, t: 100, r: 200, b: 150 });

  w!.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }),
  );
  expect(measure.box).toEqual({ l: 100, t: 100, r: 200, b: 150 });
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  expect(measure.box!.l).toBe(99);

  await new Promise((r) => setTimeout(r, 60));
  document.body.dispatchEvent(ev('pointerdown', 150, 120)); // inside: move
  window.dispatchEvent(ev('pointermove', 160, 130));
  document.body.dispatchEvent(ev('pointerup', 160, 130));
  expect(measure.box).toEqual({ l: 109, t: 110, r: 209, b: 160 });

  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(measure.box).toBeNull();

  await new Promise((r) => setTimeout(r, 60));
  document.body.dispatchEvent(ev('pointerdown', 10, 10));
  document.body.dispatchEvent(ev('pointerup', 11, 11)); // under 2×2: dropped
  expect(measure.box).toBeNull();

  await new Promise((r) => setTimeout(r, 60));
  document.body.dispatchEvent(ev('pointerdown', 10, 10));
  document.body.dispatchEvent(ev('pointerup', 50, 50));
  item.run(); // off: panel closed, box cleared
  flushSync();
  expect(measure.box).toBeNull();
  expect(shadow.querySelector('input[type=number]')).toBeNull();
});
