import { chromium } from '/home/leanmac/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
import { mcp, TOKEN } from './mcpclient.mjs'; import fs from 'fs';
const D=new URL('..',import.meta.url).pathname.replace(/\/$/,'');const W=ms=>new Promise(r=>setTimeout(r,ms));
const PROF=D+'/video/profprobe';fs.rmSync(PROF,{recursive:true,force:true});
const ctx=await chromium.launchPersistentContext(PROF,{channel:'chromium',headless:true,args:[`--disable-extensions-except=${D}/shots/ext`,`--load-extension=${D}/shots/ext`]});
const sw=ctx.serviceWorkers()[0]||await ctx.waitForEvent('serviceworker');const p=ctx.pages()[0];await p.goto('http://127.0.0.1:8765/');await W(1500);
await sw.evaluate(()=>chrome.storage.sync.set({onboardingTourDone:true}));
await sw.evaluate(async()=>{const t=(await chrome.tabs.query({})).find(x=>(x.url||x.pendingUrl||'').includes('127.0.0.1:8765'));if(!t)throw new Error('tabs:'+JSON.stringify((await chrome.tabs.query({})).map(x=>x.url)));await chrome.scripting.executeScript({target:{tabId:t.id},files:['/content-scripts/content.js']});});
const m=await mcp();await sw.evaluate(tok=>chrome.storage.local.set({mcpToken:tok,mcpIntent:true}),TOKEN);
let tabs;for(let i=0;i<40;i++){try{tabs=await m.call('list_tabs');break;}catch(e){await W(300);}}
console.log('tabs',JSON.stringify(tabs).slice(0,200));const tabId=tabs.tabs[0].tabId;
const q=await m.call('query_selector',{tabId,selector:'.mock .stat'});console.log('q',JSON.stringify(q).slice(0,300));
const id=q.matches[0].id;
const r=await m.call('get_element_matched_rules',{tabId,elementId:id});console.log('rules',JSON.stringify(r).slice(0,900));
await m.close();await ctx.close();
