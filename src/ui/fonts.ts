const geistLatin = '/fonts/geist-latin.woff2' as const;
const geistLatinExt = '/fonts/geist-latin-ext.woff2' as const;
const monoLatin = '/fonts/geistmono-latin.woff2' as const;
const monoLatinExt = '/fonts/geistmono-latin-ext.woff2' as const;

// unicode ranges: legacy-src/content.js:11134 (Hc), tag legacy-final
const EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const FONTS = [
  ['iodob Geist', geistLatinExt, EXT],
  ['iodob Geist', geistLatin, LATIN],
  ['iodob Geist Mono', monoLatinExt, EXT],
  ['iodob Geist Mono', monoLatin, LATIN],
] as const;

let loaded = false;
// FontFace API, not @font-face: WXT hoists @font-face to the page <head>
export function loadFonts(): void {
  if (loaded) return;
  loaded = true;
  for (const [family, url, unicodeRange] of FONTS) {
    document.fonts.add(
      new FontFace(family, `url("${browser.runtime.getURL(url)}")`, {
        weight: '300 700',
        unicodeRange,
        style: 'normal',
        display: 'swap',
      }),
    );
  }
}
