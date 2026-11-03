import { browser } from '#imports';
import { i18n } from '#i18n';
import { assetFileName } from '../../../lib/element/assets';
import type { Asset } from '../../../lib/element/types';
import { sendToBackground, type ContentApi } from '../../../lib/messaging';
import { panel, toPage } from '../store.svelte';

/** Clicks that act on the page bring its tab forward first (6.21, legacy go_to_tab). */
export async function onPage<K extends keyof ContentApi>(
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]> | undefined> {
  if (panel.tabId !== null) await sendToBackground('go_to_tab', panel.tabId).catch(() => {});
  return toPage(type, ...data);
}

/** Hover highlights never switch tabs. */
export const hover = toPage;
export const clearHighlights = () => void toPage('clear_element_highlights');

/** Must run inside the click, before any await: permissions.request needs the gesture. */
export function requestDownloads(): Promise<boolean> {
  try {
    return browser.permissions.request({ permissions: ['downloads'] }).catch(() => false);
  } catch {
    return Promise.resolve(false);
  }
}

export function assetPreview(a: Asset): string {
  if (a.type === 'svg') return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(a.content)}`;
  return a.type === 'data-image' ? a.dataUrl : a.url;
}

const later = (url: string) => setTimeout(() => URL.revokeObjectURL(url), 60_000);

/** Port of the legacy asset download (6.34): blob first so the name sticks, original URL if CORS. */
export async function downloadAsset(a: Asset): Promise<void> {
  if (a.type === 'svg') {
    const url = URL.createObjectURL(new Blob([a.content], { type: 'image/svg+xml' }));
    later(url);
    await browser.downloads.download({ url, filename: i18n.t('panel.defaultSvgFilename') });
    return;
  }
  if (a.type === 'data-image') {
    const filename = assetFileName(a.dataUrl, i18n.t('panel.defaultAssetName'));
    await browser.downloads.download({ url: a.dataUrl, filename });
    return;
  }
  const filename = assetFileName(a.url, i18n.t('panel.defaultDownloadName'));
  try {
    const res = await fetch(a.url);
    if (!res.ok) throw new Error(String(res.status));
    const url = URL.createObjectURL(await res.blob());
    later(url);
    await browser.downloads.download({ url, filename });
  } catch {
    await browser.downloads.download({ url: a.url }).catch(() => {});
  }
}
