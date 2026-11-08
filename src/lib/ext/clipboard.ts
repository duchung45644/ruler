import { sendToBackground } from './messaging';

/** Image copy needs a secure context; on failure ask background for clipboardWrite and retry once. */
export async function copyImage(blob: Blob | Promise<Blob>): Promise<boolean> {
  if (!isSecureContext) return false;
  const write = () => navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  try {
    await write();
    return true;
  } catch {
    try {
      if (!(await sendToBackground('request_clipboard_permission'))) return false;
      await write();
      return true;
    } catch {
      return false;
    }
  }
}

/** Clipboard API → ask background for clipboardWrite and retry → execCommand fallback. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      if (await sendToBackground('request_clipboard_permission')) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through */
    }
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.append(ta);
  ta.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    ta.remove();
  }
}
