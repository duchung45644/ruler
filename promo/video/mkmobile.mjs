import { chromium } from '/home/leanmac/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({channel:'chromium'});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.goto('http://127.0.0.1:8765/');
await p.addStyleTag({content:'.card{padding:32px!important}.cards{gap:32px!important}.stat{padding:16px!important}.card p{color:#334155!important}.card h3{color:#0f172a!important}'});
await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(300);await p.screenshot({path:'../remotion/public/scenes/agent_mobile.jpg',type:'jpeg',quality:90});await p.addStyleTag({content:'.hero{grid-template-columns:1fr!important;padding:40px 24px!important;gap:32px!important}header{padding:16px 24px!important}nav{display:none}.hero h1{font-size:40px!important}'});await p.waitForTimeout(200);await p.screenshot({path:'../remotion/public/scenes/agent_mobile_fixed.jpg',type:'jpeg',quality:90});await b.close();
