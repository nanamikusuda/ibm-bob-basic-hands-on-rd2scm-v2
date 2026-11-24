import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const URL_ = "file://" + path.join(root, "index.html");
const PORT = 9337;
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new","--disable-gpu",`--remote-debugging-port=${PORT}`,`--user-data-dir=/tmp/bob-px-${Date.now()}`,"about:blank"],{stdio:"ignore"});
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
let t; for(let i=0;i<50;i++){try{t=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();break}catch{await sleep(200)}}
const ws=new WebSocket(t.find(x=>x.type==="page").webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
let id=0;const p=new Map();ws.onmessage=m=>{const g=JSON.parse(m.data);if(g.id&&p.has(g.id)){p.get(g.id)(g);p.delete(g.id)}};
const send=(method,params={})=>new Promise(res=>{const i=++id;p.set(i,res);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>(await send("Runtime.evaluate",{expression:e,returnByValue:true})).result.result.value;
await send("Page.enable");
async function measure(w,h,label){
  await send("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:1,mobile:false});
  await send("Page.navigate",{url:URL_});await sleep(800);
  // 補足文・タイトル・ボタンのテキスト色を隠して背景だけをサンプリングするため、color を透明に
  const rects=JSON.parse(await ev(`(()=>{var q=s=>{var r=document.querySelector(s).getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}};return JSON.stringify({lead:q(".lead"),h1:q(".site-header h1"),btn:q("#theme-toggle")})})()`));
  await ev(`document.querySelectorAll(".site-header h1,.lead,.theme-toggle,.brand-logo").forEach(e=>{e.style.visibility="hidden"})`);
  const shot=(await send("Page.captureScreenshot",{format:"png"})).result.data;
  // PNG をページ内 canvas でデコードして画素取得
  const js=`(async()=>{var im=new Image();im.src="data:image/png;base64,${shot}";await im.decode();var c=document.createElement("canvas");c.width=im.width;c.height=im.height;var x=c.getContext("2d");x.drawImage(im,0,0);var pts=${JSON.stringify(Object.fromEntries(Object.entries(rects).map(([k,r])=>[k,[[r.x+2,r.y+r.h/2],[r.x+r.w-2,r.y+r.h/2],[r.x+r.w/2,r.y+2],[r.x+r.w/2,r.y+r.h-2]]])))};var out={};for(var k in pts){out[k]=pts[k].map(function(p){var d=x.getImageData(Math.round(p[0]),Math.round(p[1]),1,1).data;return [d[0],d[1],d[2]]})}return JSON.stringify(out)})()`;
  const r=await send("Runtime.evaluate",{expression:js,awaitPromise:true,returnByValue:true});
  const out=JSON.parse(r.result.result.value);
  const lum=([R,G,B])=>{const f=c=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4};return 0.2126*f(R)+0.7152*f(G)+0.0722*f(B)};
  const cr=(a)=>(1.05)/(lum(a)+0.05);
  console.log(label);
  for(const [k,v] of Object.entries(out)){ const worst=Math.min(...v.map(cr)); console.log(`  ${k}: 最小(白文字)コントラスト=${worst.toFixed(2)}  (${v.map(c=>"#"+c.map(n=>n.toString(16).padStart(2,"0")).join("")).join(" ")})`) }
}
await measure(900,300,"PC 900px");
await measure(375,400,"SP 375px");
ws.close();chrome.kill();
