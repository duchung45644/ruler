import PanelRight from '@lucide/svelte/icons/panel-right';
import { registerItem } from '../core/registry.svelte';
import { state } from '../core/state.svelte';
import { bridge, initSidePanelBridge, toggleSidePanel } from './bridge.svelte';

export { sidePanelHandlers } from './bridge.svelte';

/** Dock button / key 0 (6.07, 1.41) plus the page ↔ panel bridge. */
export async function initSidePanel(): Promise<void> {
  if (!state.inFrame) await initSidePanelBridge(); // a responsive frame has no side panel of its own
  registerItem({
    id: 'sidepanel',
    icon: PanelRight,
    // the API does not come and go: the first session's answer holds
    label: bridge.panelApi ? 'dock.sidePanel' : 'dock.sidePanelUnsupported',
    key: 'p',
    group: 'environment',
    run: () => void toggleSidePanel(),
    isActive: () => bridge.panelOpen,
    isDisabled: () => !bridge.panelApi,
  });
}
