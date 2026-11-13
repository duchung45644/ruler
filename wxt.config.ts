import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import { shadowDomCss } from './build/shadow-dom-css';

/** Edge Add-ons public key: unpacked builds get the store ID bkgdfebicmlicjnkgbemlidlnpbnaofh. */
const EDGE_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAigqbGGwV5LSV7WrmnQyrs772qGciPjHyStDHdQ4/t81aNCCJfSGsCiDld3l++PK1nRJ2VqxNG9e9eREMcDV/5ZFOK+vzCaY8mAjEqpUlgG/BYumKqOtrVZMs+TZ4BGDqdH8XXShg9SOqWRf1LtAGULIEWaT2uDtYREp/g0eyAygTL4sh8s/16FX7fesYigr0N7n+ca88fpcz+/PcUQOX7RTtmcXw2SDsl9Z0RpxY69jqA70azGFzT/Pa9+5SJClfrAQF3tZKEJ3e1UeNB6wddMy1wgqk0tzzeUTq2nmJTtg8g5PaEb2uUyXBrQHL26MJ/yY/rTPLpWHrG04Rw4MBowIDAQAB';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/i18n/module'],
  vite: () => ({ plugins: [tailwindcss()], css: { postcss: { plugins: [shadowDomCss()] } } }),
  webExt: { disabled: true }, // không tự mở Chrome; load .output/chrome-mv3-dev vào Edge một lần, WXT tự reload
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    // store packages must not carry `key` (pnpm zip sets PIXELLENS_STORE)
    ...(!process.env.PIXELLENS_STORE && { key: EDGE_PUBLIC_KEY }),
    minimum_chrome_version: '116',
    action: {
      default_title: '__MSG_extNameShort__',
      // off until turned on in a tab (background sets the indigo icon per tab)
      default_icon: { 16: 'images/icon16_off.png', 32: 'images/icon32_off.png' },
    },
    icons: {
      16: 'images/icon16.png',
      24: 'images/icon24.png',
      32: 'images/icon32.png',
      48: 'images/icon48.png',
      128: 'images/icon128.png',
    },
    permissions: [
      'scripting',
      'activeTab',
      'contextMenus',
      'storage',
      'sidePanel',
      'declarativeNetRequestWithHostAccess',
      'debugger',
    ],
    optional_permissions: ['downloads', 'clipboardWrite'],
    optional_host_permissions: ['<all_urls>'],
    web_accessible_resources: [
      {
        resources: ['content-scripts/content.css', 'fonts/*.woff2'],
        matches: ['<all_urls>'],
        use_dynamic_url: true,
      },
    ],
    commands: {
      // Ctrl+Shift+F: free in Chrome and Edge, and Vietnamese IMEs (Unikey) swallow Alt+Shift combos.
      // macOS keeps Alt+Shift+S: Cmd+Shift+F is Chrome's full-screen toolbar toggle there.
      _execute_action: { suggested_key: { default: 'Ctrl+Shift+F', mac: 'Alt+Shift+S' } },
      select_parent: {
        description: '__MSG_cmdSelectParent__',
        suggested_key: { default: 'Alt+Shift+Up', mac: 'Alt+Shift+Up' },
      },
      select_child: {
        description: '__MSG_cmdSelectChild__',
        suggested_key: { default: 'Alt+Shift+Down', mac: 'Alt+Shift+Down' },
      },
    },
  },
  hooks: {
    'build:manifestGenerated': (_wxt, manifest) => {
      if (manifest.host_permissions?.length || manifest.content_scripts?.length) {
        throw new Error(
          'PixelLens: manifest không được có host_permissions/content_scripts — inject bằng scripting.executeScript (spec §3)',
        );
      }
    },
  },
});
