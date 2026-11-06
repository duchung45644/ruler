import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import { shadowDomCss } from './build/shadow-dom-css';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/i18n/module'],
  vite: () => ({ plugins: [tailwindcss()], css: { postcss: { plugins: [shadowDomCss()] } } }),
  webExt: { disabled: true }, // không tự mở Chrome; load .output/chrome-mv3-dev vào Edge một lần, WXT tự reload
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    minimum_chrome_version: '116',
    action: { default_title: '__MSG_extNameShort__' },
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
      'declarativeContent',
      'sidePanel',
      'declarativeNetRequestWithHostAccess',
      'debugger',
    ],
    optional_permissions: ['downloads', 'clipboardWrite'],
    optional_host_permissions: ['<all_urls>'],
    web_accessible_resources: [
      {
        resources: ['content-scripts/content.css'],
        matches: ['<all_urls>'],
        use_dynamic_url: true,
      },
    ],
    commands: {
      _execute_action: { suggested_key: { default: 'Alt+Shift+S', mac: 'Alt+Shift+S' } },
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
          'iodob: manifest không được có host_permissions/content_scripts — inject bằng scripting.executeScript (spec §3)',
        );
      }
    },
  },
});
