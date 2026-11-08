import { afterEach, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { confirmDialog } from './dialog';
import { mountLayer } from './overlay';
import { state } from './state.svelte';

afterEach(() => document.body.replaceChildren());

function setup() {
  const shadow = document.body.appendChild(document.createElement('div')).attachShadow({
    mode: 'open',
  });
  return { shadow, detach: mountLayer(shadow) };
}

it('resolves false on cancel and true on Enter', async () => {
  const { shadow, detach } = setup();
  const p = confirmDialog('T', 'M');
  flushSync();
  expect(state.dialog).toBe(true);
  const [cancel] = shadow.querySelectorAll('button');
  cancel!.click();
  expect(await p).toBe(false);
  expect(state.dialog).toBe(false);

  const q = confirmDialog('T', 'M');
  flushSync();
  shadow
    .querySelector('[role=alertdialog]')!
    .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  expect(await q).toBe(true);
  detach();
});
