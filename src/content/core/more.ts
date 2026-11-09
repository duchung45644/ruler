/** "More" dock button: a menu of the less used tools (MORE_ITEMS); their keys still work. */
import Ellipsis from '@lucide/svelte/icons/ellipsis';
import MorePopover from '../../ui/MorePopover.svelte';
import { items, MORE_ITEMS, registerItem, togglePopover } from './registry.svelte';

export function initMore(): void {
  registerItem({
    id: 'more',
    icon: Ellipsis,
    label: 'dock.more',
    key: '9',
    popover: MorePopover,
    run: () => togglePopover('more'),
    // lit while one of its tools is on (overlay, audit…), so the state stays visible
    // (pause excluded: while paused, Resume sits on the dock itself)
    isActive: () =>
      items.some((i) => i.id !== 'pause' && MORE_ITEMS.includes(i.id) && i.isActive?.()),
  });
}
