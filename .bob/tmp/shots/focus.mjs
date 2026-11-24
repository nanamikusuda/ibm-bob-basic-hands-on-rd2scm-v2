import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const URL_ = "file://" + path.join(root, "index.html");
const PORT = 9335;
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new","--disable-gpu",`--remote-debugging-port=${PORT}`,`--user-data-dir=/tmp/bob-f-${Date.now()}`,"about:blank"],{stdio:"ignore"});
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
let t; for(let i=0;i<50;i++){try{t=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();break}catch{await sleep(200)}}
const ws=new WebSocket(t.find(x=>x.type==="page").webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
let id=0;const p=new Map();ws.onmessage=m=>{const g=JSON.parse(m.data);if(g.id&&p.has(g.id)){p.get(g.id)(g);p.delete(g.id)}};
const send=(method,params={})=>new Promise(res=>{const i=++id;p.set(i,res);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>(await send("Runtime.evaluate",{expression:e,returnByValue:true})).result.result.value;
const key=async(k,code,vk)=>{for(const type of["keyDown","keyUp"])await send("Input.dispatchKeyEvent",{type,key:k,code,windowsVirtualKeyCode:vk})};
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride",{width:900,height:300,deviceScaleFactor:1,mobile:false});
await send("Page.navigate",{url:URL_});await sleep(800);
const active=()=>ev(`(()=>{var a=document.activeElement;var s=getComputedStyle(a);return a.tagName+"."+a.className+" outline="+s.outlineStyle+" "+s.outlineWidth+" "+s.outlineColor})()`);
await key("Tab","Tab",9); console.log("Tab1:",await active());
fs.writeFileSync("focus-logo.png",Buffer.from((await send("Page.captureScreenshot",{format:"png"})).result.data,"base64"));
await key("Tab","Tab",9); console.log("Tab2:",await active());
fs.writeFileSync("focus-toggle.png",Buffer.from((await send("Page.captureScreenshot",{format:"png"})).result.data,"base64"));
await key("Enter","Enter",13); console.log("Enterで切替後 pressed=",await ev(`document.getElementById("theme-toggle").getAttribute("aria-pressed")`),"data-theme=",await ev(`document.documentElement.getAttribute("data-theme")`));
await key(" ","Space",32); console.log("Spaceで切替後 pressed=",await ev(`document.getElementById("theme-toggle").getAttribute("aria-pressed")`),"data-theme=",await ev(`document.documentElement.getAttribute("data-theme")`));
await key("Tab","Tab",9);await key("Tab","Tab",9); console.log("Tab4(検索ボックス):",await active());
// ダークでのフォーカス
await ev(`document.documentElement.setAttribute("data-theme","dark")`);
await ev(`document.querySelector(".category-btn").focus()`);
// focus-visible を発火させるためキー操作
await key("Tab","Tab",9); console.log("dark カテゴリ btn2:",await active());
await key("Tab","Tab",9);await key("Tab","Tab",9);await key("Tab","Tab",9);await key("Tab","Tab",9); console.log("dark faq-question:",await active());
fs.writeFileSync("focus-dark.png",Buffer.from((await send("Page.captureScreenshot",{format:"png"})).result.data,"base64"));
ws.close();chrome.kill();
