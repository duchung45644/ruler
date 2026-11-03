import Camera from '@lucide/svelte/icons/camera';
import { registerItem } from '../../core/registry.svelte';
import { state } from '../../core/state.svelte';
import { pickElement } from '../inspector';
import { captureElement } from './element';
import { openCaptureBar } from './session';

/** "Selected element": pick one with the inspector, then capture it. */
async function pickAndCapture(): Promise<void> {
  const el = await pickElement();
  if (el) await captureElement(el);
}

/** Same as key 8; also the save_screenshot message (9.39). */
export function openBar(): void {
  if (state.paused || state.capturing) return;
  void openCaptureBar({ element: () => void pickAndCapture() });
}

/** Capture button / key 8 (4.04, 1.39). */
export function initCapture(): void {
  registerItem({
    id: 'capture',
    icon: Camera,
    label: 'dock.capture',
    key: '8',
    group: 'utilities',
    run: openBar,
    isDisabled: () => state.capturing,
  });
}
