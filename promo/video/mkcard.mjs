import { chromium } from '/home/leanmac/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({channel:'chromium'});const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:8765/');
await p.addStyleTag({content:`#c2{background:#1e293b!important;border-color:#1e293b!important}#c2 h3{color:#fff;transform:translate(14px,6px)}#c2 p{color:#cbd5e1}#c2 .ic{background:#5eead4!important}`});
await p.locator('#c2').screenshot({path:'design-card.png'});console.log(await p.locator('#c2').boundingBox());await b.close();
