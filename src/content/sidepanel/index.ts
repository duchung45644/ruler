import PanelRight from '@lucide/svelte/icons/panel-right';
import { registerItem } from '../core/registry.svelte';
import { bridge, initSidePanelBridge, toggleSidePanel } from './bridge.svelte';

export { sidePanelHandlers } from './bridge.svelte';

/** Dock button / key 0 (6.07, 1.41) plus the page ↔ panel bridge. */
export async function initSidePanel(): Promise<void> {
  // responsive frames too: the panel talks to the frame holding the selection (Task 12)
  await initSidePanelBridge();
  registerItem({
    id: 'sidepanel',
    icon: PanelRight,
    // the API does not come and go: the first session's answer holds
    label: bridge.panelApi ? 'dock.sidePanel' : 'dock.sidePanelUnsupported',
    key: '0',
    run: () => void toggleSidePanel(),
    isActive: () => bridge.panelOpen,
    isDisabled: () => !bridge.panelApi,
  });
}
