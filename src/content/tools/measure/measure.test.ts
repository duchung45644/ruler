import { afterEach, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
// fakeBrowser has no i18n.getMessage; the panel renders labels
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
import { flushSync } from 'svelte';
import { items } from '../../core/registry.svelte';
import { routeKey } from '../../core/keys';
import { layer } from '../../core/overlay';
import { sessionSignal, stopSession } from '../../core/session';
import { installDragGuard } from '../../core/drag';
import { initTools } from '..';
import { currentBox } from '.';

afterEach(() => {
  stopSession();
  document.body.replaceChildren();
});

const ev = (type: string, x: number, y: number) =>
  new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true });

it('draws, moves, ignores arrows typed in the panel, clears on Esc and on toggle off', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.append(layer);
  shadow.addEventListener('keydown', routeKey as EventListener);
  window.addEventListener('keydown', routeKey, { signal: sessionSignal() });
  installDragGuard(sessionSignal());
  await initTools();
  const item = items.find((i) => i.id === 'measure')!;
  expect(item.group).toBe('designTools');
  item.run();
  flushSync();
  const w = shadow.querySelector<HTMLInputElement>('input[type=number]');
  expect(w).not.toBeNull();

  document.body.dispatchEvent(ev('pointerdown', 100, 100));
  window.dispatchEvent(ev('pointermove', 200, 150));
  document.body.dispatchEvent(ev('pointerup', 200, 150));
  expect(currentBox()).toEqual({ l: 100, t: 100, r: 200, b: 150 });

  w!.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }),
  );
  expect(currentBox()).toEqual({ l: 100, t: 100, r: 200, b: 150 });
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  expect(currentBox()!.l).toBe(99);

  await new Promise((r) => setTimeout(r, 60));
  document.body.dispatchEvent(ev('pointerdown', 150, 120)); // inside: move
  window.dispatchEvent(ev('pointermove', 160, 130));
  document.body.dispatchEvent(ev('pointerup', 160, 130));
  expect(currentBox()).toEqual({ l: 109, t: 110, r: 209, b: 160 });

  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(currentBox()).toBeNull();

  await new Promise((r) => setTimeout(r, 60));
  document.body.dispatchEvent(ev('pointerdown', 10, 10));
  document.body.dispatchEvent(ev('pointerup', 11, 11)); // under 2×2: dropped
  expect(currentBox()).toBeNull();

  await new Promise((r) => setTimeout(r, 60));
  document.body.dispatchEvent(ev('pointerdown', 10, 10));
  document.body.dispatchEvent(ev('pointerup', 50, 50));
  item.run(); // off: panel closed, box cleared
  flushSync();
  expect(currentBox()).toBeNull();
  expect(shadow.querySelector('input[type=number]')).toBeNull();
});
