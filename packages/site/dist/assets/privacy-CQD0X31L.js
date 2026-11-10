import {
  A as e,
  C as t,
  F as n,
  H as r,
  M as i,
  N as a,
  P as o,
  S as s,
  T as c,
  V as l,
  W as u,
  d,
  i as f,
  n as p,
  r as m,
  t as h,
  v as g,
  w as _,
} from './app-CwaYE8Do.js';
import { t as v } from './markdown-SxH2cWR3.js';
var y = `# PixelLens Privacy Policy

_Last updated: 2026-11-10_

PixelLens is a browser extension for inspecting and adjusting web pages. It does not collect, sell or share personal data.

## What PixelLens stores

- **Preferences** (theme, tool settings, panel layout) are stored with the browser's extension storage. If you are signed in to your browser with sync turned on, the browser syncs them between your devices. PixelLens never sees or controls that sync.
- **CSS edits** you make on a site (rule and inline style changes) are saved automatically for that site, locally on your device only, until you revert them.
- **The MCP token** used to connect a local AI agent is stored locally on your device only.

None of this data is sent to the developer or to any third party.

## What PixelLens does not do

- No analytics, tracking, advertising or telemetry.
- No account, no sign-in, no remote server operated by the developer.
- PixelLens does not read or send page content anywhere. Page data (element styles, colors, fonts, screenshots) is processed inside your browser and shown only to you.

## Network access

- PixelLens runs on a tab only after you turn it on for that tab.
- The optional MCP feature connects only to \`ws://127.0.0.1\` on your own computer, and only after you turn it on. It is protected by a token and the extension's origin.
- To read a page's stylesheets, PixelLens may download those same stylesheets from the site you are viewing.

## Permissions

| Permission | Why |
| --- | --- |
| \`activeTab\`, \`scripting\` | Run the toolkit on the tab where you turn it on |
| \`storage\` | Save your preferences and saved edits |
| \`sidePanel\` | Show element and page details in the side panel |
| \`contextMenus\` | Context-menu shortcuts |
| \`debugger\` | Full-page screenshots, only when you take one; detached right after |
| \`declarativeNetRequestWithHostAccess\` | Responsive mode: let the current page load inside its own preview frames on that tab |
| Optional \`<all_urls>\` | Requested only for responsive mode and reading cross-origin stylesheets |
| Optional \`downloads\`, \`clipboardWrite\` | Download images and assets from the side panel, copy values and images, only when you ask |

## Contact

Questions: open an issue on the project's repository, or email the developer at the address shown on the store listing.
`,
  b = c(
    `<!> <main class="mx-auto max-w-3xl px-4 py-16 sm:px-6"><p class="text-sm text-accent-fg"> </p> <h1 class="mt-2 text-3xl font-semibold tracking-tight text-strong sm:text-4xl"> </h1> <article class="doc mt-8"></article></main> <!>`,
    1,
  );
function x(s, c) {
  r(c, !1);
  let m = v(y);
  d();
  var x = b(),
    S = a(x);
  h(S, {});
  var C = n(S, 2),
    w = i(C),
    T = o(w, !0),
    E = n(w, 2),
    D = o(E, !0),
    O = n(E, 2);
  (g(O, () => m.html, !0), u(O), u(C));
  var k = n(C, 2);
  (p(k, {}),
    e(
      (e) => {
        (t(T, e), t(D, m.title));
      },
      [() => f().nav.privacy],
    ),
    _(s, x),
    l());
}
((document.documentElement.lang = m.code), s(x, { target: document.getElementById(`app`) }));
