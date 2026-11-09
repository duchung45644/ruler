import Camera from '@lucide/svelte/icons/camera';
import { registerItem } from '../../core/registry.svelte';
import { state } from '../../core/state.svelte';
import { pickElement } from '../inspector';
import { hasFrameSelection } from '../../responsive/shell.svelte';
import { captureElement, captureFrameElement } from './element';
import { openCaptureBar } from './session';

/** "Selected element": pick one with the inspector, then capture it. */
async function pickAndCapture(): Promise<void> {
  const el = await pickElement();
  if (el) await captureElement(el);
}

/** Same as key 8; also the save_screenshot message (9.39). */
export function openBar(): void {
  // frames never run capture: their `s` key is forwarded here (Q6)
  if (state.paused || state.capturing || state.inFrame) return;
  // responsive: the selection lives in a frame; offered only when one holds it
  const element = !state.responsiveOn
    ? () => void pickAndCapture()
    : hasFrameSelection()
      ? () => void captureFrameElement()
      : undefined;
  void openCaptureBar({ element });
}

/** Capture button / key 8 (4.04, 1.39). */
export function initCapture(): void {
  registerItem({
    id: 'capture',
    icon: Camera,
    label: 'dock.capture',
    key: '8',
    run: openBar,
    isDisabled: () => state.capturing,
  });
}
