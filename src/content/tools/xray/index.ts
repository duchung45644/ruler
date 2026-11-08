import ScanEye from '@lucide/svelte/icons/scan-eye';
import { shadowRoots } from '../../../lib/dom/dom';
import { getSettings, updateSettings } from '../../../lib/ext/settings';
import { xrayDepth, xraySheet } from '../../../lib/tools/xray';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';

const isOwn = (el: Element) => el.localName === 'iodob-ui';
let sheets: HTMLStyleElement[] = [];

function addSheet(parent: Node, css: string): void {
  const s = document.createElement('style');
  s.dataset.iodob = '';
  s.textContent = css;
  parent.appendChild(s);
  sheets.push(s);
}

/** 3.02, not persisted (edit mode turns it off, 3.21) (legacy createXrayStyle :41829): page DOM <style>, plus one per open shadow root. */
export function setXray(on: boolean): void {
  state.xrayOn = on;
  for (const s of sheets) s.remove();
  sheets = [];
  if (!on) return;
  addSheet(document.head, xraySheet('body', 0));
  for (const r of shadowRoots(document, isOwn)) addSheet(r, xraySheet(':host', xrayDepth(r.host)));
}

export async function initXray(): Promise<void> {
  registerItem({
    id: 'xray',
    forward: true,
    icon: ScanEye,
    label: 'dock.xray',
    key: 'x',
    run: () => {
      setXray(!state.xrayOn);
      if (!state.inFrame) void updateSettings({ xrayModeIsOn: state.xrayOn });
    },
    isActive: () => state.xrayOn,
  });
  const signal = sessionSignal();
  onStop(() => setXray(false)); // not persisted: next session restores it (1.43)
  const { xrayModeIsOn } = await getSettings();
  if (xrayModeIsOn && !signal.aborted && !state.inFrame) setXray(true);
}
