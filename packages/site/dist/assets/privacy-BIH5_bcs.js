import{B as e,D as t,E as n,F as r,J as i,L as a,R as o,T as s,X as c,d as l,i as u,k as d,n as f,q as p,r as m,t as h,x as g,z as _}from"./app-BxGTEtgW.js";import{t as v}from"./markdown-SxH2cWR3.js";var y=`# PixelLens Privacy Policy

_Last updated: 2026-11-09_

PixelLens is a browser extension for inspecting and adjusting web pages. It does not collect, sell or share personal data.

## What PixelLens stores

- **Preferences** (theme, tool settings, panel layout) are stored with the browser's extension storage. If you are signed in to your browser with sync turned on, the browser syncs them between your devices. PixelLens never sees or controls that sync.
- **CSS edits you choose to save** for a site are stored locally on your device only.
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
| Optional \`downloads\`, \`clipboardWrite\` | Save screenshots and assets, copy values, only when you ask |

## Contact

Questions: open an issue on the project's repository, or email the developer at the address shown on the store listing.
`,b=d(`<!> <main class="mx-auto max-w-3xl px-4 py-16 sm:px-6"><p class="text-sm text-indigo-300"> </p> <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl"> </h1> <article class="doc mt-8"></article></main> <!>`,1);function x(s,d){i(d,!1);let m=v(y);l();var x=b(),S=o(x);h(S,{});var C=e(S,2),w=a(C),T=_(w,!0),E=e(w,2),D=_(E,!0),O=e(E,2);g(O,()=>m.html,!0),c(O),c(C);var k=e(C,2);f(k,{}),r(e=>{n(T,e),n(D,m.title)},[()=>u().nav.privacy]),t(s,x),p()}document.documentElement.lang=m.code,s(x,{target:document.getElementById(`app`)});