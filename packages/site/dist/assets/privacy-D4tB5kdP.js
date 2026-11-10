import{A as e,C as t,E as n,M as r,N as i,P as a,R as o,S as s,T as c,V as l,b as u,d,i as f,j as p,k as m,n as h,r as g,t as _,v,w as y,x as b,y as x,z as S}from"./app-CVJYB17M.js";var C=`# PixelLens Privacy Policy

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
`,w=n(`<h1 class="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl"> </h1>`),T=n(`<h2 class="mt-12 text-xl font-semibold text-white"> </h2>`),E=n(`<li></li>`),D=n(`<ul class="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-zinc-400 marker:text-zinc-600"></ul>`),O=n(`<th class="px-4 py-2.5 font-medium"></th>`),k=n(`<td class="px-4 py-2.5 align-top"></td>`),A=n(`<tr></tr>`),j=n(`<div class="mt-4 overflow-x-auto rounded-xl border border-white/10"><table class="w-full text-left text-sm"><thead class="bg-white/5 text-zinc-300"><tr></tr></thead><tbody class="divide-y divide-white/5 text-zinc-400"></tbody></table></div>`),M=n(`<p class="mt-4 leading-relaxed text-zinc-400"></p>`),N=n(`<!> <main class="mx-auto max-w-3xl px-4 py-16 sm:px-6"><p class="text-sm text-indigo-300"> </p> <!></main> <!>`,1);function P(n,s){S(s,!1);function g(e){let t=[];for(let n of e.trim().split(/\n\s*\n/)){let e=n.split(`
`);e[0].startsWith(`# `)?t.push({kind:`h1`,lines:[e[0].slice(2)]}):e[0].startsWith(`## `)?t.push({kind:`h2`,lines:[e[0].slice(3)]}):e[0].startsWith(`- `)?t.push({kind:`ul`,lines:e.map(e=>e.slice(2))}):e[0].startsWith(`|`)?t.push({kind:`table`,lines:e.filter(e=>!/^\|\s*-/.test(e))}):t.push({kind:`p`,lines:[e.join(` `)]})}return t}let P=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`),F=e=>P(e).replace(/`([^`]+)`/g,`<code class="rounded bg-white/5 px-1 py-0.5 font-mono text-[0.9em] text-zinc-200">$1</code>`).replace(/\*\*([^*]+)\*\*/g,`<strong class="text-zinc-200">$1</strong>`).replace(/_([^_]+)_/g,`<em>$1</em>`),I=e=>e.split(`|`).slice(1,-1).map(e=>e.trim()),L=g(C);d();var R=N(),z=r(R);_(z,{});var B=a(z,2),V=p(B),H=i(V,!0),U=a(V,2);x(U,1,()=>L,u,(n,o)=>{var s=c(),d=r(s),f=n=>{var r=w(),a=i(r,!0);e(()=>t(a,m(o).lines[0])),y(n,r)},h=n=>{var r=T(),a=i(r,!0);e(()=>t(a,m(o).lines[0])),y(n,r)},g=e=>{var t=D();x(t,5,()=>m(o).lines,u,(e,t)=>{var n=E();v(n,()=>F(m(t)),!0),l(n),y(e,n)}),l(t),y(e,t)},_=e=>{var t=j(),n=p(t),r=p(n),i=p(r);x(i,5,()=>I(m(o).lines[0]),u,(e,t)=>{var n=O();v(n,()=>F(m(t)),!0),l(n),y(e,n)}),l(i),l(r);var s=a(r);x(s,5,()=>m(o).lines.slice(1),u,(e,t)=>{var n=A();x(n,5,()=>I(m(t)),u,(e,t)=>{var n=k();v(n,()=>F(m(t)),!0),l(n),y(e,n)}),l(n),y(e,n)}),l(s),l(n),l(t),y(e,t)},S=e=>{var t=M();v(t,()=>F(m(o).lines[0]),!0),l(t),y(e,t)};b(d,e=>{m(o).kind===`h1`?e(f):m(o).kind===`h2`?e(h,1):m(o).kind===`ul`?e(g,2):m(o).kind===`table`?e(_,3):e(S,-1)}),y(n,s)}),l(B);var W=a(B,2);h(W,{}),e(e=>t(H,e),[()=>f().nav.privacy]),y(n,R),o()}document.documentElement.lang=g.code,s(P,{target:document.getElementById(`app`)});