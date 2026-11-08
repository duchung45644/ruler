/** Opens the options page (1.13): `open_options_page` and the action context menu (Q1). */
import { browser, i18n } from '#imports';
import type { BackgroundApi, Handlers } from '../lib/ext/messaging';

export const OPTIONS_MENU_ID = 'open_options_page';

export const openOptions = (): Promise<void> => browser.runtime.openOptionsPage();

export const optionsHandlers: Handlers<BackgroundApi> = {
  open_options_page: () => openOptions(),
};

/** Right-click on the toolbar icon; the caller has already cleared the menus. */
export function createOptionsMenu(): void {
  browser.contextMenus.create({
    id: OPTIONS_MENU_ID,
    title: i18n.t('options.pageTitle'),
    contexts: ['action'],
  });
}
