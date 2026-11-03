import { i18n } from '#i18n';
import { screenshotName } from '../../../lib/capture';
import { copyImage } from '../../../lib/clipboard';
import { sendToBackground } from '../../../lib/messaging';
import { mountUi } from '../../../ui/mount';
import { ownNodes } from '../../core/events';
import { routeKey, setCaptureKeyHandler } from '../../core/keys';
import { hideUi, onStop, sessionCtx, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import CaptureRoot from './CaptureRoot.svelte';
import { cap } from './state.svelte';

/** Capture session, port of unpacked/scripts/bd/capture/capture.js. */
let ui: { host: HTMLElement; shadow: ShadowRoot; remove(): void } | null = null;
let viewKey: ((e: KeyboardEvent) => boolean) | null = null;
let stopHooked = false;

export const frames = (): Promise<void> =>
  new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
export const loadImg = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
const toBlob = (c: HTMLCanvasElement): Promise<Blob> =>
  new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));

/** Key handler of the current view (the editor); Esc always closes first. */
export function setViewKey(fn: ((e: KeyboardEvent) => boolean) | null): void {
  viewKey = fn;
}

function onKey(e: KeyboardEvent): boolean {
  if (e.key === 'Escape') {
    closeCapture();
    return true;
  }
  return viewKey?.(e) ?? false;
}

export async function grabVisible(): Promise<string> {
  const r = await sendToBackground('capture_tab', null).catch(() => null);
  if (!r?.success) throw new Error('capture failed');
  return r.dataUrl;
}

/** Hide every extension UI (main host and capture host) while fn grabs the tab (capture.js:132). */
export async function withHiddenUi<T>(fn: () => Promise<T>): Promise<T> {
  const host = ui?.host;
  const display = host?.style.display ?? '';
  if (host) host.style.display = 'none';
  hideUi('all');
  await frames();
  try {
    return await fn();
  } finally {
    if (host) host.style.display = display;
    if (!state.capturing) hideUi(null);
  }
}

export function closeCapture(): void {
  setCaptureKeyHandler(null);
  viewKey = null;
  if (ui) {
    ownNodes.delete(ui.host);
    ui.remove();
    ui = null;
  }
  Object.assign(cap, { snap: '', modeBar: true, element: null, sel: null });
  hideUi(null);
  state.capturing = false;
}

/** Mounts the capture host showing CaptureRoot; capture state is already set. */
async function mountCapture(): Promise<boolean> {
  const signal = sessionSignal();
  const mounted = await mountUi(sessionCtx(), CaptureRoot, {}, { name: 'bo-doi-capture' });
  if (signal.aborted || !state.capturing) {
    mounted.remove();
    return false;
  }
  ui = mounted;
  ui.host.dataset.theme = state.theme;
  ownNodes.add(ui.host);
  // isolateEvents stops keydown at the shadow root, so route it from there too (like session.ts)
  ui.shadow.addEventListener('keydown', routeKey as EventListener, { signal });
  setCaptureKeyHandler(onKey);
  if (!stopHooked) {
    stopHooked = true;
    onStop(() => {
      stopHooked = false;
      closeCapture();
    });
  }
  return true;
}

/** 4.07: freeze the screen once, then area mode is on right away. */
export async function openCaptureBar(opts: { element?: () => void } = {}): Promise<void> {
  if (state.capturing) return;
  state.capturing = true;
  hideUi('all');
  await frames();
  const snap = await grabVisible().catch(() => null);
  if (!snap || !state.capturing) return closeCapture();
  Object.assign(cap, { snap, modeBar: true, element: opts.element ?? null, sel: null });
  if (!(await mountCapture())) closeCapture();
}

export async function copyCanvas(c: HTMLCanvasElement): Promise<void> {
  if (!isSecureContext) throw new Error(i18n.t('capture.copyNeedsHttps'));
  if (!(await copyImage(toBlob(c)))) throw new Error(i18n.t('capture.failed'));
}

export async function saveCanvas(c: HTMLCanvasElement): Promise<void> {
  const url = URL.createObjectURL(await toBlob(c));
  const a = document.createElement('a');
  a.href = url;
  a.download = screenshotName(location.hostname, new Date());
  document.documentElement.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Run a copy/save action and show the result on the button itself (capture.js:167). */
export async function capAction(
  set: (label: string | null, disabled: boolean) => void,
  fn: () => Promise<void>,
  doneKey: 'capture.copied' | 'capture.saved',
  close: boolean,
): Promise<void> {
  set(null, true);
  try {
    await fn();
    set(i18n.t(doneKey), true);
    if (close) setTimeout(closeCapture, 700);
    else setTimeout(() => set(null, false), 1200);
  } catch (e) {
    const msg = (e as Error)?.message;
    set(msg === i18n.t('capture.copyNeedsHttps') ? msg : i18n.t('capture.failed'), true);
    setTimeout(() => set(null, false), 1500);
  }
}
