import { afterEach, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

// fakeBrowser has no i18n.getMessage; the panel renders labels
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
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

it('mounts the panel in the shadow root and shows the selection', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.append(layer);
  const p = document.createElement('p');
  p.textContent = 'hi';
  document.body.append(p);
  await initInspector();
  state.selected = p;
  await new Promise((r) => setTimeout(r, 50));
  expect(shadow.textContent).toContain('inspect_copyCss');
  expect(shadow.textContent).toContain('inspect_layout');
  stopSession();
  expect(shadow.textContent).not.toContain('inspect_copyCss');
});
