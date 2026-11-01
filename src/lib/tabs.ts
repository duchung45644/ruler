// Port legacy-src/background.js:5445 (De) + microsoftedge addons store
const BLOCKED = [
  /^(chrome|edge|chrome-extension):/,
  /^(https?:\/\/)?(www\.)?chrome\.google\.com\/webstore/,
  /^(https?:\/\/)?chromewebstore\.google\.com/,
  /^(https?:\/\/)?microsoftedge\.microsoft\.com\/addons/,
];

export function isInjectable(url: string | undefined): boolean {
  return !!url && /^(https?|file|ftp):/.test(url) && !BLOCKED.some((r) => r.test(url));
}
