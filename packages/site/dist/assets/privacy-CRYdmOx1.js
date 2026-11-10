import{A as e,D as t,E as n,F as r,I as i,O as a,R as o,S as s,_ as c,b as l,g as u,h as d,i as f,j as p,k as m,l as h,m as g,n as _,r as v,t as y,v as b,x,y as S}from"./app-B6au_OjX.js";var C=`# PixelLens Privacy Policy

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
`,w=s(`<h1 class="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl"> </h1>`),T=s(`<h2 class="mt-12 text-xl font-semibold text-white"> </h2>`),E=s(`<li></li>`),D=s(`<ul class="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-zinc-400 marker:text-zinc-600"></ul>`),O=s(`<th class="px-4 py-2.5 font-medium"></th>`),k=s(`<td class="px-4 py-2.5 align-top"></td>`),A=s(`<tr></tr>`),j=s(`<div class="mt-4 overflow-x-auto rounded-xl border border-white/10"><table class="w-full text-left text-sm"><thead class="bg-white/5 text-zinc-300"><tr></tr></thead><tbody class="divide-y divide-white/5 text-zinc-400"></tbody></table></div>`),M=s(`<p class="mt-4 leading-relaxed text-zinc-400"></p>`),N=s(`<!> <main class="mx-auto max-w-3xl px-4 py-16 sm:px-6"><p class="text-sm text-indigo-300"> </p> <!></main> <!>`,1);function P(s,v){i(v,!1);function b(e){let t=[];for(let n of e.trim().split(/\n\s*\n/)){let e=n.split(`
`);e[0].startsWith(`# `)?t.push({kind:`h1`,lines:[e[0].slice(2)]}):e[0].startsWith(`## `)?t.push({kind:`h2`,lines:[e[0].slice(3)]}):e[0].startsWith(`- `)?t.push({kind:`ul`,lines:e.map(e=>e.slice(2))}):e[0].startsWith(`|`)?t.push({kind:`table`,lines:e.filter(e=>!/^\|\s*-/.test(e))}):t.push({kind:`p`,lines:[e.join(` `)]})}return t}let P=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`),F=e=>P(e).replace(/`([^`]+)`/g,`<code class="rounded bg-white/5 px-1 py-0.5 font-mono text-[0.9em] text-zinc-200">$1</code>`).replace(/\*\*([^*]+)\*\*/g,`<strong class="text-zinc-200">$1</strong>`).replace(/_([^_]+)_/g,`<em>$1</em>`),I=e=>e.split(`|`).slice(1,-1).map(e=>e.trim()),L=b(C);h();var R=N(),z=m(R);y(z,{});var B=p(z,2),V=a(B),H=e(V,!0),U=p(V,2);d(U,1,()=>L,u,(r,i)=>{var s=x(),f=m(s),h=r=>{var a=w(),o=e(a,!0);t(()=>S(o,n(i).lines[0])),l(r,a)},_=r=>{var a=T(),o=e(a,!0);t(()=>S(o,n(i).lines[0])),l(r,a)},v=e=>{var t=D();d(t,5,()=>n(i).lines,u,(e,t)=>{var r=E();g(r,()=>F(n(t)),!0),o(r),l(e,r)}),o(t),l(e,t)},y=e=>{var t=j(),r=a(t),s=a(r),c=a(s);d(c,5,()=>I(n(i).lines[0]),u,(e,t)=>{var r=O();g(r,()=>F(n(t)),!0),o(r),l(e,r)}),o(c),o(s);var f=p(s);d(f,5,()=>n(i).lines.slice(1),u,(e,t)=>{var r=A();d(r,5,()=>I(n(t)),u,(e,t)=>{var r=k();g(r,()=>F(n(t)),!0),o(r),l(e,r)}),o(r),l(e,r)}),o(f),o(r),o(t),l(e,t)},b=e=>{var t=M();g(t,()=>F(n(i).lines[0]),!0),o(t),l(e,t)};c(f,e=>{n(i).kind===`h1`?e(h):n(i).kind===`h2`?e(_,1):n(i).kind===`ul`?e(v,2):n(i).kind===`table`?e(y,3):e(b,-1)}),l(r,s)}),o(B);var W=p(B,2);_(W,{}),t(e=>S(H,e),[()=>f().nav.privacy]),l(s,R),r()}document.documentElement.lang=v.code,b(P,{target:document.getElementById(`app`)});