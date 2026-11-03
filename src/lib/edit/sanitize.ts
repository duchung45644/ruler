/** HTML sanitizer for markup coming from the panel or MCP (port of content.js:14228–14281, 14454, 16375). */

export const PROTECTED_TAGS = new Set(['html', 'head', 'body']);

export const BLOCKED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'link',
  'meta',
  'base',
  'template',
  'noscript',
  'frame',
  'frameset',
  'applet',
  'portal',
  'xmp',
  'noembed',
  'noframes',
  'plaintext',
]);

export const BLOCKED_ATTRS = new Set([
  'srcdoc',
  'formaction',
  'xlink:href',
  'style',
  'background',
  'ping',
  'http-equiv',
]);

export const URL_ATTRS = new Set(['href', 'src', 'action', 'poster', 'form', 'data', 'codebase']);

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);
// svg+xml is deliberately absent: it can carry script.
const SAFE_IMAGE_TYPES = new Set([
  'png',
  'jpeg',
  'jpg',
  'gif',
  'webp',
  'avif',
  'bmp',
  'apng',
  'tiff',
  'x-icon',
  'vnd.microsoft.icon',
]);

function schemeOf(url: string): string {
  for (let i = 0; i < url.length; i++) {
    const c = url[i];
    if (c === '/' || c === '?' || c === '#') return '';
    if (c === ':') return url.slice(0, i + 1);
  }
  return '';
}

export function isSafeUrl(v: string): boolean {
  // Browsers ignore these characters inside a scheme ("java\tscript:").
  const url = v
    .replace(/[\t\n\r\f\v\0]/g, '')
    .trim()
    .toLowerCase();
  const scheme = schemeOf(url);
  if (scheme === '' || SAFE_SCHEMES.has(scheme)) return true;
  if (scheme !== 'data:') return false;
  const rest = url.slice(5);
  if (!rest.startsWith('image/')) return false;
  return SAFE_IMAGE_TYPES.has(rest.slice(6).split(/[;,]/)[0] ?? '');
}

export function sanitizeHtml(html: string, doc: Document = document): DocumentFragment {
  const frag = doc.createDocumentFragment();
  if (typeof html !== 'string') return frag;
  const body = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body;
  for (const el of [...body.querySelectorAll('*')]) {
    if (!body.contains(el)) continue;
    if (BLOCKED_TAGS.has(el.localName.toLowerCase())) {
      el.remove();
      continue;
    }
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (
        name.startsWith('on') ||
        BLOCKED_ATTRS.has(name) ||
        (URL_ATTRS.has(name) && !isSafeUrl(attr.value))
      )
        el.removeAttribute(attr.name);
    }
  }
  for (const node of [...body.childNodes]) frag.appendChild(doc.importNode(node, true));
  return frag;
}
