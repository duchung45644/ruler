// Scripted Inspect take: real X input + screen capture. Writes OUT, OUT.start, OUT.play, OUT.cam (for compose.py)
import { chromium } from '/home/leanmac/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
import { spawn } from 'child_process'; import { createInterface } from 'readline'; import fs from 'fs';
const D=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
const OUT=process.argv[2]; const FF=process.env.FF; const W0=ms=>new Promise(r=>setTimeout(r,ms));const PACE=0.7;const W=ms=>W0(ms*PACE);
const PROF=D+'/video/profauto'; fs.rmSync(PROF,{recursive:true,force:true}); fs.mkdirSync(PROF+'/Default',{recursive:true});
fs.writeFileSync(PROF+'/Default/Preferences',JSON.stringify({extensions:{pinned_extensions:['bkgdfebicmlicjnkgbemlidlnpbnaofh']}}));
const REAL=!!process.env.REAL;const DSF=REAL?1:2;const ctx=await chromium.launchPersistentContext(PROF,{channel:'chromium',headless:false,viewport:null,env:REAL?process.env:{...process.env,DISPLAY:':2',XCURSOR_SIZE:'48',XCURSOR_THEME:'Adwaita'},ignoreDefaultArgs:['--enable-automation'],
 args:['--window-position=0,0','--window-size=1920,1080',...(REAL?['--start-maximized']:['--force-device-scale-factor=2']),'--no-first-run','--remote-debugging-port=9333',`--disable-extensions-except=${D}/shots/ext`,`--load-extension=${D}/shots/ext`]});
const sw=ctx.serviceWorkers()[0]||await ctx.waitForEvent('serviceworker');
const p=ctx.pages()[0];await p.goto('http://127.0.0.1:8765/');await sw.evaluate(()=>chrome.storage.sync.set({onboardingTourDone:true}));
await W(1000);await sw.evaluate(async()=>{const [t]=await chrome.tabs.query({url:'http://127.0.0.1:8765/*'});await chrome.scripting.executeScript({target:{tabId:t.id},files:['/content-scripts/content.js']});});
await W(1500);await p.mouse.click(1900,600);await W(400);
let xin,q=[];const X=c=>new Promise(r=>{q.push(r);xin.stdin.write(c+'\n');});
const off=()=>p.evaluate(()=>({x:screenX,y:screenY+outerHeight-innerHeight}));
// wait until the button exists and has stopped moving (dock slides in)
const dockBtn=async pre=>{let last;for(let i=0;i<40;i++){const r=await dockBtn1(pre);if(r&&last&&Math.abs(r[0]-last[0])+Math.abs(r[1]-last[1])<0.5)return r;last=r;await W0(120);}throw new Error('no dock button '+pre);};
const dockBtn1=async pre=>{const o=await off();const r=await p.evaluate(l=>{let r;const walk=n=>{for(const e of n.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);const a=e.getAttribute?.('aria-label')||'';if(!r&&e.tagName==='BUTTON'&&a.startsWith(l)){const b=e.getBoundingClientRect();if(b.width)r=[b.x+b.width/2,b.y+b.height/2];}}};walk(document);return r;},pre);return r&&[o.x+r[0],o.y+r[1]];};
const shadowText=async txt=>{for(let i=0;i<30;i++){const r=await shadowText1(txt);if(r)return r;await W0(100);}throw new Error('no button '+txt);};
const shadowText1=async txt=>{const o=await off();const r=await p.evaluate(l=>{let r;const walk=n=>{for(const e of n.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);if(!r&&e.tagName==='BUTTON'&&e.textContent.trim()===l){const b=e.getBoundingClientRect();if(b.width)r=[b.x+b.width/2,b.y+b.height/2];}}};walk(document);return r;},txt);return r&&[o.x+r[0],o.y+r[1]];};
const at=async(sel,fx=.5,fy=.5)=>{const o=await off();const b=await p.locator(sel).first().boundingBox();return [o.x+b.x+b.width*fx,o.y+b.y+b.height*fy];};
const mvs=([x,y],ms=800)=>X(`ms ${x*DSF} ${y*DSF} ${Math.round(ms*0.85)}`);const mv=([x,y],ms=800)=>X(`m ${x*DSF} ${y*DSF} ${Math.round(ms*0.85)}`);const click=()=>X('c');const key=k=>X(`k ${k}`);
const type=async s=>{for(const ch of s){if(ch==='#')await X('K Shift_L numbersign');else await key(ch);await W(75);}};
// panel via DevTools
let C,spo;
async function panel(){const list=await (await fetch('http://127.0.0.1:9333/json')).json();const ti=list.find(t=>t.url.includes('sidepanel'));
 const ws=new WebSocket(ti.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);pend[d.id]?.(d.result);};
 C=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
 const iw=await ev('innerWidth'),ih=await ev('innerHeight');const g=await p.evaluate(()=>({x:screenX+outerWidth,y:screenY+outerHeight-innerHeight,ih:innerHeight}));spo={x:g.x-iw,y:g.y+g.ih-ih};console.log('spo',spo,iw,ih,g);}
const ev=async e=>(await C('Runtime.evaluate',{expression:e,returnByValue:true})).result.value;
const pbox=async js=>{const b=await ev(`(()=>{const el=${js};if(!el)return null;el.scrollIntoView({block:'nearest'});const b=el.getBoundingClientRect();return [b.x,b.y,b.width,b.height]})()`);if(!b)throw new Error('panel el not found: '+js);return b;};
const pat=async(js,fx=.5)=>{const b=await pbox(js);return [spo.x+b[0]+b[2]*fx,spo.y+b[1]+b[3]/2];};
// value input for prop; with `after`, the first match following the `after` prop (same active rule)
const valField=(prop,after)=>`(()=>{const a=[...document.querySelectorAll('input.field')];let ok=${after?'false':'true'};for(let i=0;i<a.length-1;i++){const k=!a[i].classList.contains('ml-1')&&a[i+1].classList.contains('ml-1');if(k&&a[i].value===${JSON.stringify(after||'')})ok=true;if(ok&&k&&a[i].value===${JSON.stringify(prop)})return a[i+1];}})()`;
const shadowAll=async sel=>{const o=await off();const r=await p.evaluate(sel=>{const out=[];const walk=n=>{for(const e of n.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);}for(const e of n.querySelectorAll(sel)){const b=e.getBoundingClientRect();if(b.width)out.push([b.x+b.width/2,b.y+b.height/2]);}};walk(document);return out;},sel);return r.map(c=>[o.x+c[0],o.y+c[1]]);};
const shadowOne=async(sel,i=0)=>{for(let k=0;k<30;k++){const r=(await shadowAll(sel))[i<0?undefined:i];const all=await shadowAll(sel);const c=i<0?all[all.length+i]:all[i];if(c)return c;await W0(120);}throw new Error('missing '+sel);};
const DESIGN=D+'/video/live/design.png';
const MR=await p.locator('.mock').boundingBox();
{const h=await p.addStyleTag({content:'.mock .stats{gap:18px!important}.mock .chart span.on{height:72%!important}.mock .hd b{letter-spacing:.6px}.mock .row:last-child{padding-top:12px!important}'});
 await W0(300);await p.locator('.mock').screenshot({path:DESIGN});await h.evaluate(e=>e.remove());await W0(200);}
// record
const ff=spawn(FF,['-y','-loglevel','error','-f','x11grab','-framerate','30','-video_size',REAL?'1920x1080':'3840x2160','-draw_mouse','1','-i',REAL?':0.0':':2.0','-c:v','libx264','-preset','ultrafast','-crf','16','-pix_fmt','yuv420p',OUT]);
fs.writeFileSync(OUT+'.start',String(Date.now()/1000));await W(500);
fs.writeFileSync(OUT+'.play',String(Date.now()/1000));
xin=spawn('python3',[D+'/video/xin.py'],{env:REAL?{...process.env,CAMLOG:OUT+'.cam'}:{...process.env,CAMLOG:OUT+'.cam',DISPLAY:':2',SCALE:'2'}});createInterface({input:xin.stdout}).on('line',()=>q.shift()?.());
const T0=Date.now();const marks={};const mark=k=>marks[k]=+((Date.now()-T0)/1000+0.5).toFixed(2);
try{
await mv([1300,560],10);await W(400);
const byText=async t=>{for(let k=0;k<30;k++){const o=await off();const r=await p.evaluate(t=>{let r;const walk=n=>{for(const e of n.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);if(!r&&e.tagName==='BUTTON'&&e.textContent.includes(t)){const b=e.getBoundingClientRect();if(b.width)r=[b.x+b.width/2,b.y+b.height/2];}}};walk(document);return r;},t);if(r)return [o.x+r[0],o.y+r[1]];await W0(120);}throw new Error('no text '+t);};
mark('more');await mv(await dockBtn('More tools'),850);await W(200);await click();await W(600);
mark('overlay');await mv(await byText('Design overlay'),600);await W(200);await click();await W(900);
mark('load');{const fcP=p.waitForEvent('filechooser');const drop=(await shadowAll('button.border-dashed'))[0];await mv(drop,800);await W(200);await click();const fc=await fcP;await fc.setFiles(DESIGN);}await W(900);
mark('place');{const nums=await shadowAll('input[type="number"]');for(const [i,v] of [[0,Math.round(MR.x)],[1,Math.round(MR.y)]]){await mv(nums[i],500);await W(120);await click();await W0(250);await key('End');for(let k=0;k<7;k++)await key('BackSpace');await type(String(v));await W0(150);await W(200);}await key('Return');}await W(900);
mark('diff');await mv(await shadowOne('button[data-mode="difference"]'),700);await W(150);await click();await W(1700);
mark('onion');await mv(await shadowOne('button[data-mode="onion"]'),500);await W(150);await click();await W(1500);
mark('split');await mv(await shadowOne('input[data-overlay="split"]'),600);await W(150);await click();await W(900);
{const o=await off();const dx=await p.evaluate(()=>{let x=null;const walk=n=>{for(const e of n.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);}};return null;});
 const vw=await p.evaluate(()=>innerWidth);const pos=await p.evaluate(()=>{let v=50;return v;});
 const y=o.y+MR.y+MR.height*0.55;const x0=o.x+vw*0.5;
 mark('drag');await mv([x0,y],700);await W(250);await X('dn');await W(150);await mvs([o.x+MR.x+MR.width*0.92,y],1300);await W(300);await mvs([x0,y],1300);await W(150);await X('up');await W(1300);}
mark('end');
}catch(e){console.log('ERR',e.message);}
const cl=new Promise(r=>ff.on('close',r));ff.kill('SIGINT');await Promise.race([cl,W(3000)]);await X('q').catch(()=>{});await ctx.close();
console.log(JSON.stringify(marks));
