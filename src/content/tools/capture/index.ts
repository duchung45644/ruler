import Camera from '@lucide/svelte/icons/camera';
import { registerItem } from '../../core/registry.svelte';
import { state } from '../../core/state.svelte';
import { captureElement } from './element';
import { openCaptureBar } from './session';

/** Same as key 8; also the save_screenshot message (9.39). */
export function openBar(): void {
  if (state.paused || state.capturing) return;
  const el = state.selected;
  void openCaptureBar({ element: el ? () => void captureElement(el) : undefined });
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
