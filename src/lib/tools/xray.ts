export const XRAY_COLORS = [
  '#FF3F25',
  '#EF8400',
  '#CB9800',
  '#999999',
  '#A5D8FF',
  '#304CFF',
  '#339AF0',
  '#2B7FCC',
  '#1E6FB8',
  '#155FA3',
  '#0D4F8F',
];

/** Not outlined: svg internals, hidden things, head, and our own nodes. */
const EXCLUDE =
  'pixellens-ui,[data-pixellens],[data-pixellens] *,svg *,path,circle,rect,line,polygon,polyline,ellipse,g,defs,clipPath,mask,pattern,symbol,use,text,tspan,br,hr,slot,*[style*="width: 0"],*[style*="height: 0"],*[style*="width:0"],*[style*="height:0"],*[style*="display: none"],*[style*="display:none"],*[style*="visibility: hidden"],*[style*="visibility:hidden"],*[style*="opacity: 0"],*[style*="opacity:0"],head,head *,meta,link,script,style,title,base{outline:none!important;}';

/** Port of buildXraySheet (legacy-src/content.js:41863): one outline colour per nesting level. */
export function xraySheet(scope: 'body' | ':host', depth: number): string {
  const last = XRAY_COLORS.length - 1;
  let css = '';
  for (let i = last; i >= 0; i--) {
    const sel = i === last ? `${scope} *` : scope + ' > *'.repeat(i + 1);
    css += `${sel}{outline:1px solid ${XRAY_COLORS[Math.min(i + depth, last)]}!important;}`;
  }
  return css + EXCLUDE;
}

/** Port of xrayDepthOfHost: ancestors up to body, crossing shadow hosts. */
export function xrayDepth(host: Element): number {
  let n = 0;
  for (let e: Node | null = host; e && e !== document.body; n++) {
    e = e.parentElement ?? (e.parentNode instanceof ShadowRoot ? e.parentNode.host : null);
  }
  return n;
}
