import { chromium } from '/home/leanmac/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
import fs from 'fs';
export const D=''+new URL('..',import.meta.url).pathname.replace(/\/$/,'')+'';
const ext=D+'/shots/ext';
export const W=ms=>new Promise(r=>setTimeout(r,ms));
export async function launch(dsf=1){
 const ctx=await chromium.launchPersistentContext(D+'/video/prof'+Date.now(),{channel:'chromium',headless:true,viewport:null,args:['--force-device-scale-factor='+dsf,'--window-size=1440,987',`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
 const sw=ctx.serviceWorkers()[0]||await ctx.waitForEvent('serviceworker');
 const p=ctx.pages()[0]||await ctx.newPage();await p.goto('http://127.0.0.1:8765/');await W(500);
 const tabId=await sw.evaluate(async()=>{const [t]=await chrome.tabs.query({url:'http://127.0.0.1:8765/*'});await chrome.scripting.executeScript({target:{tabId:t.id},files:['/content-scripts/content.js']});return t.id;});
 await W(1200);for(let i=0;i<3;i++){const sk=p.getByText('Skip',{exact:true});if(await sk.count())await sk.first().click({force:true}).catch(()=>{});await W(300);}
 const extId=new URL(sw.url()).host;
 return {ctx,sw,p,tabId,extId};
}
export async function openPanel(ctx,extId,tabId,sw){const pp=ctx.waitForEvent('page');await sw.evaluate(u=>chrome.windows.create({url:u,type:'popup',width:400,height:900}),`chrome-extension://${extId}/sidepanel.html?tabId=${tabId}&detached=1`);const sp=await pp;await sp.waitForLoadState();const c=await ctx.newCDPSession(sp);await c.send('Emulation.setDeviceMetricsOverride',{width:400,height:900,deviceScaleFactor:2,mobile:false});sp._emu=c;await W(1500);return sp;}
let n=0;export async function shot(pg,name){await pg.screenshot({path:D+'/video/pr_'+(name||n++)+'.jpg',type:'jpeg',quality:70});}
