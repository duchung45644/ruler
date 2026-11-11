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
await W(1200);await p.mouse.click(1900,600);await W(300);
let xin,q=[];const X=c=>new Promise(r=>{q.push(r);xin.stdin.write(c+'\n');});
const off=()=>p.evaluate(()=>({x:screenX,y:screenY+outerHeight-innerHeight}));
// wait until the button exists and has stopped moving (dock slides in)
const dockBtn=async pre=>{let last;for(let i=0;i<40;i++){const r=await dockBtn1(pre);if(r&&last&&Math.abs(r[0]-last[0])+Math.abs(r[1]-last[1])<0.5)return r;last=r;await W0(120);}throw new Error('no dock button '+pre);};
const dockBtn1=async pre=>{const o=await off();const r=await p.evaluate(l=>{let r;const walk=n=>{for(const e of n.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);const a=e.getAttribute?.('aria-label')||'';if(!r&&e.tagName==='BUTTON'&&a.startsWith(l)){const b=e.getBoundingClientRect();if(b.width)r=[b.x+b.width/2,b.y+b.height/2];}}};walk(document);return r;},pre);return r&&[o.x+r[0],o.y+r[1]];};
const shadowText=async txt=>{for(let i=0;i<30;i++){const r=await shadowText1(txt);if(r)return r;await W0(100);}throw new Error('no button '+txt);};
const shadowText1=async txt=>{const o=await off();const r=await p.evaluate(l=>{let r;const walk=n=>{for(const e of n.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);if(!r&&e.tagName==='BUTTON'&&e.textContent.trim()===l){const b=e.getBoundingClientRect();if(b.width)r=[b.x+b.width/2,b.y+b.height/2];}}};walk(document);return r;},txt);return r&&[o.x+r[0],o.y+r[1]];};
const at=async(sel,fx=.5,fy=.5)=>{const o=await off();const b=await p.locator(sel).first().boundingBox();return [o.x+b.x+b.width*fx,o.y+b.y+b.height*fy];};
const mv=([x,y],ms=800)=>X(`m ${x*DSF} ${y*DSF} ${Math.round(ms*0.85)}`);const click=()=>X('c');const key=k=>X(`k ${k}`);
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
// record
const ff=spawn(FF,['-y','-loglevel','error','-f','x11grab','-framerate','30','-video_size',REAL?'1920x1080':'3840x2160','-draw_mouse','1','-i',REAL?':0.0':':2.0','-c:v','libx264','-preset','ultrafast','-crf','16','-pix_fmt','yuv420p',OUT]);
fs.writeFileSync(OUT+'.start',String(Date.now()/1000));await W(500);
fs.writeFileSync(OUT+'.play',String(Date.now()/1000));
xin=spawn('python3',[D+'/video/xin.py'],{env:REAL?{...process.env,CAMLOG:OUT+'.cam'}:{...process.env,CAMLOG:OUT+'.cam',DISPLAY:':2',SCALE:'2'}});createInterface({input:xin.stdout}).on('line',()=>q.shift()?.());
const T0=Date.now();const marks={};const mark=k=>marks[k]=+((Date.now()-T0)/1000+0.5).toFixed(2);
try{
await mv([1300,520],10);await W(700);
mark('icon');await mv([1772,63],850);await W(200);await click();await W(1100);
mark('inspect');await mv(await dockBtn('Inspect'),850);await W(200);await click();await W(600);
mark('title');await mv(await at('.hero h1',.3,.3),900);await W0(900);await key('space');mark('pin');await W0(600);
const cp=await shadowText('Copy CSS');await mv(cp,700);await W(200);await click();mark('copy');await W(1000);await mv(await dockBtn('Close'),600);await W(200);await click();mark('unpin');await W(500);
mark('select');await mv(await at('.mock .stat b',.5,.55),800);await W(500);await click();await W(500);
mark('distance');await mv(await at('.mock .stat:nth-child(2) b',.5,.55),700);await W(1500);
mark('panel');await mv(await dockBtn('Toggle Side Panel'),900);await W(200);await click();await W(1800);await panel();
mark('parent');await mv(await pat(`document.querySelector('button[title^="Select Parent"]')`),900);await W(200);await click();await W(1100);
mark('child');await mv(await pat(`document.querySelector('button[data-child]')`),700);await W(200);await click();await W(1000);
const cssHdr=`[...document.querySelectorAll('button,summary')].find(e=>e.textContent.trim()==='CSS')`;
if(!(await ev(`!!${valField('color')}`))){await mv(await pat(cssHdr,.2),700);await W(150);await click();await W(700);}
mark('color');await mv(await pat(valField('color','font-size'),.15),800);await W(150);await click();await W(150);await X('K Control_L a');await W(150);await type('red');await key('Return');await W(1300);
mark('size');await mv(await pat(valField('font-size'),.15),700);await W(150);await click();await W(150);await X('K Control_L a');await W(150);await type('32px');await key('Return');await W(2200);
mark('end');
}catch(e){console.log('ERR',e.message);}
const cl=new Promise(r=>ff.on('close',r));ff.kill('SIGINT');await Promise.race([cl,W(3000)]);await X('q').catch(()=>{});await ctx.close();
console.log(JSON.stringify(marks));
