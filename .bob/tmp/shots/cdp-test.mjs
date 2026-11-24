import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const URL_ = "file://" + path.join(root, "index.html");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/bob-cdp-${Date.now()}`, "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break; } catch { await sleep(200); }
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else events.push(msg);
};
const send = (method, params = {}) => new Promise((res) => {
  const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
  return r.result.result.value;
};
const state = () => ev(`JSON.stringify({
  dataTheme: document.documentElement.getAttribute("data-theme"),
  pressed: document.getElementById("theme-toggle").getAttribute("aria-pressed"),
  saved: (()=>{try{return localStorage.getItem("bob-faq-theme")}catch(e){return "ERR"}})(),
  bg: getComputedStyle(document.body).backgroundColor,
  osDark: matchMedia("(prefers-color-scheme: dark)").matches
})`).then(JSON.parse);

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

let fails = 0;
const check = (name, cond, actual) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}  ${cond ? "" : JSON.stringify(actual)}`);
  if (!cond) fails++;
};
const LIGHT = "rgb(255, 255, 255)", DARK = "rgb(22, 22, 22)";

async function load(os, saved) {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: os }] });
  await send("Page.navigate", { url: "about:blank" }); await sleep(200);
  await send("Page.navigate", { url: URL_ });
  await sleep(500);
  await ev(`localStorage.clear(); ${saved ? `localStorage.setItem("bob-faq-theme", ${JSON.stringify(saved)})` : ""}`);
  await send("Page.reload"); await sleep(600);
}

// 1. OS=light, 保存なし
await load("light");
let s = await state();
check("OS=light/保存なし: ライト表示, pressed=false", s.bg === LIGHT && s.pressed === "false" && s.dataTheme === null, s);

// 2. OS=dark, 保存なし -> 自動追従
await load("dark");
s = await state();
check("OS=dark/保存なし: ダーク表示(OS追従), pressed=true", s.osDark && s.bg === DARK && s.pressed === "true" && s.dataTheme === null, s);

// 3. OS=dark, 保存=light -> 保存優先
await load("dark", "light");
s = await state();
check("OS=dark/保存=light: ライト表示(保存優先), pressed=false", s.bg === LIGHT && s.pressed === "false" && s.dataTheme === "light", s);

// 4. OS=light, 保存=dark -> 保存優先
await load("light", "dark");
s = await state();
check("OS=light/保存=dark: ダーク表示(保存優先), pressed=true", s.bg === DARK && s.pressed === "true" && s.dataTheme === "dark", s);

// 5. 不正な保存値は無視
await load("light", "foo");
s = await state();
check("不正な保存値(foo)は無視される", s.dataTheme === null && s.bg === LIGHT, s);

// 6. ボタンで切替 + 保存 + 再読み込みで維持
await load("light");
await ev(`document.getElementById("theme-toggle").click()`);
s = await state();
check("OS=light でクリック: ダークに切替・保存", s.bg === DARK && s.pressed === "true" && s.saved === "dark", s);
await sleep(1500); // file:// の localStorage 永続化は非同期のため待つ
await send("Page.reload"); await sleep(1000);
s = await state();
check("再読み込み後もダークが維持される", s.bg === DARK && s.pressed === "true" && s.saved === "dark", s);
await ev(`document.getElementById("theme-toggle").click()`);
s = await state();
check("再クリック: ライトに戻り保存", s.bg === LIGHT && s.pressed === "false" && s.saved === "light", s);

// 7. OS=dark で表示中にクリック -> ライトへ
await load("dark");
await ev(`document.getElementById("theme-toggle").click()`);
s = await state();
check("OS=dark(追従中)でクリック: ライトに切替", s.bg === LIGHT && s.pressed === "false" && s.saved === "light", s);

// 8. 保存なしでOS設定が変わったとき、表示とボタン状態が追従
await load("light");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
await sleep(300);
s = await state();
check("保存なしでOSがdarkに変化: 表示・ボタンが追従", s.bg === DARK && s.pressed === "true", s);

// 9. 既存機能(検索・絞り込み・アコーディオン・該当なし)
await load("light");
const total = () => ev(`document.getElementById("result-count").textContent`);
check("初期: 17件", (await total()) === "17 件のFAQ", await total());
await ev(`var i=document.getElementById("search-input");i.value="zzzzqqq";i.dispatchEvent(new Event("input"))`);
check("該当なし: 0件+メッセージ表示", (await total()) === "0 件のFAQ" && (await ev(`!document.getElementById("empty-message").hidden`)), await total());
await ev(`var i=document.getElementById("search-input");i.value="";i.dispatchEvent(new Event("input"))`);
await ev(`document.querySelectorAll(".category-btn")[1].click()`);
const cnt1 = await total();
check("カテゴリ絞り込み(一般): 5件", cnt1 === "5 件のFAQ", cnt1);
await ev(`document.querySelector(".faq-question").click()`);
check("アコーディオン開く", await ev(`document.querySelector(".faq-question").getAttribute("aria-expanded")==="true" && !document.querySelector(".faq-answer").hidden`));

// 10. ロゴリンク属性
const link = JSON.parse(await ev(`(()=>{var a=document.querySelector(".brand-logo");var im=a.querySelector("img");return JSON.stringify({href:a.href,target:a.target,rel:a.rel,alt:im.alt,src:im.getAttribute("src"),loaded:im.complete&&im.naturalWidth>0,h:im.getBoundingClientRect().height})})()`));
check("ロゴリンク href/target/rel/alt", link.href === "https://www.ibm.com/products/bob" && link.target === "_blank" && link.rel === "noopener noreferrer" && link.alt === "Bob(IBM Bobの製品ページへ)", link);
check("ロゴ画像が読み込まれ高さ56px", link.loaded && Math.round(link.h) === 56, link);

// 11. 横スクロール(375px)・ロゴ高さ44px
await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 700, deviceScaleFactor: 1, mobile: false });
await sleep(300);
const m = JSON.parse(await ev(`JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,h:document.querySelector(".brand-logo img").getBoundingClientRect().height})`));
check("375px: 横スクロールなし", m.sw <= m.cw, m);
check("375px: ロゴ高さ44px", Math.round(m.h) === 44, m);

// 12. 外部リクエスト・コンソールエラー
const errs = events.filter((e) => (e.method === "Runtime.exceptionThrown") || (e.method === "Log.entryAdded" && e.params.entry.level === "error"));
check("コンソールエラー/例外なし", errs.length === 0, errs.map((e) => JSON.stringify(e.params).slice(0, 200)));
const res = JSON.parse(await ev(`JSON.stringify(performance.getEntriesByType("resource").map(r=>r.name))`));
const ext = res.filter((n) => !n.startsWith("file://"));
check("ページ読み込み時の外部通信なし", ext.length === 0, ext);

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILED`);
ws.close(); chrome.kill();
process.exit(fails ? 1 : 0);
