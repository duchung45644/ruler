import { afterAll, afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import { tick } from 'svelte';
import { routeKey } from '../../core/keys';
import { startSession, stopSession } from '../../core/session';
import { state } from '../../core/state.svelte';
import { openCaptureEditor } from './editor';
import { closeCapture } from './session';

// happy-dom has no 2D canvas
const realGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = (() =>
  new Proxy({}, { get: () => () => {}, set: () => true })) as never;
afterAll(() => {
  HTMLCanvasElement.prototype.getContext = realGetContext;
});

beforeEach(() => startSession(new ContentScriptContext('content')));
afterEach(() => {
  stopSession();
  vi.restoreAllMocks();
});

const root = () => document.querySelector('pixellens-capture')!.shadowRoot!;
const undoBtn = () => root().querySelector('[aria-label="capture_undo"]') as HTMLButtonElement;
const tool = (id: string) => root().querySelector(`[data-tool="${id}"]`)!;
const key = (init: KeyboardEventInit) => routeKey(new KeyboardEvent('keydown', init));
const shot = () => Object.assign(document.createElement('canvas'), { width: 200, height: 100 });

it('opens straight from a canvas; tool keys, inputs, undo, remembered tool', async () => {
  await openCaptureEditor(shot(), true);
  await tick();
  expect(state.capturing).toBe(true);
  expect(undoBtn().disabled).toBe(true);

  key({ key: 'r' });
  await tick();
  expect(tool('rect').getAttribute('aria-pressed')).toBe('true');

  const inp = root().appendChild(document.createElement('input'));
  let ev!: KeyboardEvent;
  inp.addEventListener('keydown', (e) => (ev = e), { once: true });
  inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true, composed: true }));
  routeKey(ev);
  await tick();
  expect(tool('rect').getAttribute('aria-pressed')).toBe('true');

  // draw a pen dot -> one item, then Ctrl+Z
  key({ key: 'p' });
  await tick();
  const canvas = root().querySelector('canvas')!;
  canvas.dispatchEvent(new PointerEvent('pointerdown', { button: 0, clientX: 5, clientY: 5 }));
  canvas.dispatchEvent(new PointerEvent('pointerup', { button: 0 }));
  await tick();
  expect(undoBtn().disabled).toBe(false);
  key({ key: 'z', ctrlKey: true });
  await tick();
  expect(undoBtn().disabled).toBe(true);

  closeCapture();
  await openCaptureEditor(shot(), true);
  await tick();
  expect(tool('pen').getAttribute('aria-pressed')).toBe('true');
});
