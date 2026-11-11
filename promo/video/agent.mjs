// Scripted Inspect take: real X input + screen capture. Writes OUT, OUT.start, OUT.play, OUT.cam (for compose.py)
import { chromium } from '/home/leanmac/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
import { spawn } from 'child_process'; import { createInterface } from 'readline'; import fs from 'fs';import { mcp, TOKEN } from './mcpclient.mjs';
const D=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
const OUT=process.argv[2]; const FF=process.env.FF; const W0=ms=>new Promise(r=>setTimeout(r,ms));const PACE=0.7;const W=ms=>W0(ms*PACE);
const PROF=D+'/video/profauto'; fs.rmSync(PROF,{recursive:true,force:true}); fs.mkdirSync(PROF+'/Default',{recursive:true});
fs.writeFileSync(PROF+'/Default/Preferences',JSON.stringify({extensions:{pinned_extensions:['bkgdfebicmlicjnkgbemlidlnpbnaofh']}}));
const REAL=!!process.env.REAL;const XE=!!process.env.XE;const DISP=XE?':2':':0';const DSF=(REAL||XE)?1:2;const ctx=await chromium.launchPersistentContext(PROF,{channel:'chromium',headless:false,viewport:null,env:XE?{...process.env,DISPLAY:':2'}:REAL?process.env:{...process.env,DISPLAY:':2',XCURSOR_SIZE:'48',XCURSOR_THEME:'Adwaita'},ignoreDefaultArgs:['--enable-automation'],
 args:['--window-position=0,0','--window-size=1920,1080',...(XE?['--app=http://127.0.0.1:8765/','--window-position=600,0','--window-size=1320,1080']:REAL?['--window-position=600,0','--window-size=1320,1044']:['--force-device-scale-factor=2']),'--no-first-run','--remote-debugging-port=9333',`--disable-extensions-except=${D}/shots/ext`,`--load-extension=${D}/shots/ext`]});
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
const shadowAll=async sel=>{const o=await off();const r=await p.evaluate(sel=>{const out=[];const walk=n=>{for(const e of n.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);}for(const e of n.querySelectorAll(sel)){const b=e.getBoundingClientRect();if(b.width)out.push([b.x+b.width/2,b.y+b.height/2]);}};walk(document);return out;},sel);return r.map(c=>[o.x+c[0],o.y+c[1]]);};
const shadowOne=async(sel,i=0)=>{for(let k=0;k<30;k++){const r=(await shadowAll(sel))[i<0?undefined:i];const all=await shadowAll(sel);const c=i<0?all[all.length+i]:all[i];if(c)return c;await W0(120);}throw new Error('missing '+sel);};
const bgCtx=XE?await chromium.launchPersistentContext(D+'/video/profbg',{channel:'chromium',headless:false,viewport:null,env:{...process.env,DISPLAY:':2'},ignoreDefaultArgs:['--enable-automation'],args:['--app=file://'+D+'/video/backdrop.html','--window-position=0,0','--window-size=1920,1080','--no-first-run']}):null;
const chatCtx=await chromium.launchPersistentContext(D+'/video/profchat',{channel:'chromium',headless:false,viewport:null,env:XE?{...process.env,DISPLAY:':2'}:process.env,ignoreDefaultArgs:['--enable-automation'],args:['--app=file://'+D+'/video/chat.html','--window-position=0,0',XE?'--window-size=600,1080':'--window-size=600,1044','--no-first-run']});
let chat=chatCtx.pages()[0];for(let i=0;i<30&&!chat.url().includes('chat.html');i++){await W0(200);chat=chatCtx.pages().find(x=>x.url().includes('chat.html'))||chat;}
const bounds=async(c,pg,b)=>{const cs=await c.newCDPSession(pg);const {windowId}=await cs.send('Browser.getWindowForTarget');await cs.send('Browser.setWindowBounds',{windowId,bounds:{windowState:'normal'}});await cs.send('Browser.setWindowBounds',{windowId,bounds:b});};
await bounds(chatCtx,chat,XE?{left:40,top:40,width:560,height:1000}:{left:0,top:0,width:600,height:1044});await bounds(ctx,p,XE?{left:640,top:40,width:1240,height:1000}:{left:600,top:0,width:1320,height:1044});await W0(800);
const M=await mcp();await sw.evaluate(tok=>chrome.storage.local.set({mcpToken:tok,mcpIntent:true}),TOKEN);
let tabs;for(let i=0;i<50;i++){try{tabs=await M.call('list_tabs');break;}catch(e){await W0(300);}}
const tabId=tabs.tabs[0].tabId;
const rule=async(elSel,ruleSel)=>{const q=await M.call('query_selector',{tabId,selector:elSel});if(!q.matches?.length)throw new Error('no match '+elSel);const r=await M.call('get_element_matched_rules',{tabId,elementId:q.matches[0].id});const f=r.rules.find(x=>x.selector===ruleSel&&x.mediaActive);if(!f)throw new Error('no rule '+ruleSel+' in '+r.rules.map(x=>x.selector).join(' | '));return f.ruleRef;};
const R={};for(const [k,el,sel] of [['mock','.mock','.mock'],['stat','.mock .stat','.stat'],['sb','.mock .stat b','.stat b'],['hd','.hd b','.hd b'],['row','.row','.row'],['win','.mock .win','.win'],['wu','.mock .win u','.win u'],['wi','.mock .win i','.win i'],['ch','.mock .chart','.chart'],['cs','.mock .chart span','.chart span'],['pill','.mock .pill','.pill'],['si','.mock .stat i','.stat i'],['h1','.hero h1','.hero h1'],['em','.hero h1 em','.hero h1 em']])R[k]=await rule(el,sel);
await p.bringToFront();await W0(500);
// record
const ff=spawn(FF,['-y','-loglevel','error','-f','x11grab','-framerate','30','-video_size',(REAL||XE)?'1920x1080':'3840x2160','-draw_mouse','1','-i',XE?':2.0':REAL?':0.0':':2.0','-c:v','libx264','-preset','ultrafast','-crf','16','-pix_fmt','yuv420p',OUT]);
fs.writeFileSync(OUT+'.start',String(Date.now()/1000));await W(500);
fs.writeFileSync(OUT+'.play',String(Date.now()/1000));
xin=spawn('python3',[D+'/video/xin.py'],{env:XE?{...process.env,CAMLOG:OUT+'.cam',DISPLAY:':2'}:REAL?{...process.env,CAMLOG:OUT+'.cam'}:{...process.env,CAMLOG:OUT+'.cam',DISPLAY:':2',SCALE:'2'}});createInterface({input:xin.stdout}).on('line',()=>q.shift()?.());
const T0=Date.now();const marks={};const mark=k=>marks[k]=+((Date.now()-T0)/1000+0.5).toFixed(2);
try{
const C=(f,...a)=>chat.evaluate(([f,a])=>window[f](...a),[f,a]);
const ap=(ref,styles)=>M.call('apply_styles',{tabId,ruleRef:ref,styles});
await mv([1500,720],10);await W0(1200);
mark('ask1');await C('typeUser','Give the dashboard card a dark theme');await W0(300);await C('think');await W0(900);
let i=await C('tool','get_element_matched_rules','.mock');await W0(700);await C('done',i,'5 rules');await W0(300);
i=await C('tool','apply_styles','.mock, .win, .stat, .chart { surfaces }');await W0(400);await ap(R.mock,{background:'#0b1220','border-color':'#1e293b',color:'#94a3b8','box-shadow':'0 30px 60px -30px #000, 0 0 0 6px #1e293b80'});await ap(R.win,{background:'#0f172a','border-bottom-color':'#1e293b'});await ap(R.wu,{background:'#111a2e','border-color':'#1e293b',color:'#64748b'});await ap(R.wi,{background:'#334155'});await ap(R.stat,{background:'#111a2e','border-color':'#1e293b'});await ap(R.ch,{'border-bottom-color':'#1e293b'});await ap(R.cs,{background:'#1e293b'});mark('e1');await C('done',i);await W0(700);i=await C('tool','apply_styles','text + accents');await W0(400);await ap(R.hd,{color:'#f8fafc'});await ap(R.sb,{color:'#f8fafc'});await ap(R.row,{color:'#cbd5e1'});await ap(R.pill,{background:'#042f2e',color:'#5eead4'});await ap(R.si,{color:'#2dd4bf'});mark('e2');await C('done',i);await W0(800);await C('say','The card is dark now — surfaces and text adjusted.');await W0(1400);
mark('ask2');await C('typeUser','Make the headline bigger with a teal → violet gradient');await W0(300);await C('think');await W0(900);
i=await C('tool','apply_styles','.hero h1 { font-size: 66px }');await W0(400);await ap(R.h1,{'font-size':'66px'});mark('e3');await C('done',i);await W0(700);
i=await C('tool','apply_styles','.hero h1 em { background: linear-gradient(…) }');await W0(400);await ap(R.em,{background:'linear-gradient(90deg,#2dd4bf,#a78bfa)','background-clip':'text','-webkit-background-clip':'text',color:'transparent'});mark('e4');await C('done',i);await W0(800);
await C('say','Headline updated.');await W0(1200);
mark('ask3');await C('typeUser','Export my changes as CSS');await W0(300);await C('think');await W0(700);
i=await C('tool','get_my_edits','');await M.call('get_my_edits',{tabId}).catch(()=>null);await W0(600);await C('done',i,'7 rules');await W0(300);
await C('say',`Here you go:<div class="code"><i>.mock</i> { background: <u>#111827</u>; color: <u>#94a3b8</u> }
<i>.stat</i> { background: <u>#0f172a</u> }
<i>.hd b, .stat b</i> { color: <u>#f1f5f9</u> }
<i>.row</i> { color: <u>#cbd5e1</u> }
<i>.hero h1</i> { font-size: <u>66px</u> }
<i>.hero h1 em</i> {
  background: <u>linear-gradient(90deg, #2dd4bf, #a78bfa)</u>;
  background-clip: text; color: transparent;
}</div>`);await W0(3200);
mark('end');
}catch(e){console.log('ERR',e.message);}
const cl=new Promise(r=>ff.on('close',r));ff.kill('SIGINT');await Promise.race([cl,W(3000)]);await X('q').catch(()=>{});await ctx.close();await chatCtx.close().catch(()=>{});await bgCtx?.close().catch(()=>{});await M.close().catch(()=>{});
console.log(JSON.stringify(marks));
