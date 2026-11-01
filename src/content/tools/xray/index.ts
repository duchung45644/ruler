import ScanEye from '@lucide/svelte/icons/scan-eye';
import { shadowRoots } from '../../../lib/dom';
import { getSettings, updateSettings } from '../../../lib/settings';
import { xrayDepth, xraySheet } from '../../../lib/xray';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';

const isOwn = (el: Element) => el.localName === 'bo-doi-ui';
let sheets: HTMLStyleElement[] = [];

function addSheet(parent: Node, css: string): void {
  const s = document.createElement('style');
  s.dataset.boDoi = '';
  s.textContent = css;
  parent.appendChild(s);
  sheets.push(s);
}

/** 3.02 (legacy createXrayStyle :41829): page DOM <style>, plus one per open shadow root. */
function apply(on: boolean): void {
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
    icon: ScanEye,
    label: 'dock.xray',
    key: '2',
    group: 'inspectTools',
    run: () => {
      apply(!state.xrayOn);
      void updateSettings({ xrayModeIsOn: state.xrayOn });
    },
    isActive: () => state.xrayOn,
  });
  const signal = sessionSignal();
  onStop(() => apply(false)); // not persisted: next session restores it (1.43)
  const { xrayModeIsOn } = await getSettings();
  if (xrayModeIsOn && !signal.aborted) apply(true);
}
