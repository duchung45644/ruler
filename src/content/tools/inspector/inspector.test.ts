import { afterEach, expect, it } from 'vitest';
import { layer } from '../../core/overlay';
import { stopSession } from '../../core/session';
import { state } from '../../core/state.svelte';
import { initInspector } from '.';

afterEach(() => stopSession());

it('blocks page mousedown only while inspecting', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  host.attachShadow({ mode: 'open' }).append(layer);
  const p = document.createElement('p');
  document.body.append(p);
  let seen = 0;
  p.addEventListener('mousedown', () => seen++);
  await initInspector();
  const press = () =>
    p.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
  state.inspectOn = true;
  press();
  expect(seen).toBe(0);
  state.inspectOn = false;
  press();
  expect(seen).toBe(1);
});
