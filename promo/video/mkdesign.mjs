import { chromium } from '/home/leanmac/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({channel:'chromium'});const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:8765/');
await p.addStyleTag({content:`.hero h1{transform:translateX(18px);letter-spacing:-2px}.btn#cta{padding:12px 40px}.mock{transform:translate(-14px,10px)}.card h3{font-size:20px}.cards{gap:32px}.tag{background:#ccfbf1}`});
await p.waitForTimeout(300);await p.screenshot({path:'design.png'});await b.close();
