/** Responsive mode dock item (Q1: group 2 after breakpoints, key V). */
import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
import { registerItem } from '../core/registry.svelte';
import { onStop } from '../core/session';
import { state } from '../core/state.svelte';
import { exitResponsive, teardownShell, toggleResponsive } from './shell.svelte';

export { exitResponsive };

export function initResponsive(): void {
  registerItem({
    id: 'responsive',
    icon: MonitorSmartphone,
    label: 'dock.responsive',
    key: 'v',
    group: 'environment',
    run: () => {
      if (!state.inFrame) toggleResponsive(); // a frame forwards V to the shell
    },
    isActive: () => state.responsiveOn,
  });
  onStop(teardownShell); // stop without the async exit (context invalidated): at least clean up
}
