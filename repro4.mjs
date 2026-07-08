import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3000/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  defaultViewport: { width: 1280, height: 900 },
  args: ["--no-sandbox", "--disable-gpu"],
});

const p1 = await browser.newPage();
p1.on("console", (msg) => {
  const t = msg.text();
  if (t.startsWith("DBG")) console.log("  " + t);
});
await p1.goto(BASE, { waitUntil: "networkidle0" });
await sleep(1500);
await p1.evaluate(() => { document.getElementById("portfolio").scrollIntoView({ block: "start" }); });
await sleep(1500);

// Patch gsap.from to trace tween lifecycle
await p1.evaluate(() => {
  const gsap = window.gsap || (window.__gsap);
  // find gsap
  let g = null;
  for (const k of Object.keys(window)) { if (window[k] && window[k].from && window[k].to && window[k].set) { g = window[k]; } }
  if (!g) { console.log("DBG no gsap global"); return; }
  const origFrom = g.from;
  g.from = function (targets, vars, ...rest) {
    const v = { ...vars };
    v.onStart = () => console.log("DBG from onStart targets=" + (Array.isArray(targets) ? targets.length : 1));
    v.onComplete = () => console.log("DBG from COMPLETE");
    v.onInterrupt = () => console.log("DBG from INTERRUPT");
    v.onOverwrite = () => console.log("DBG from OVERWRITE");
    v.onUpdate = function () { /* noisy */ };
    console.log("DBG from() called vars=" + JSON.stringify({ opacity: v.opacity, y: v.y, stagger: v.stagger, overwrite: v.overwrite }));
    return origFrom.call(this, targets, v, ...rest);
  };
  console.log("DBG patched gsap.from");
});

await p1.reload({ waitUntil: "networkidle0" });
// re-patch after reload — but patch must run before app. Use evaluateOnNewDocument next time.
await sleep(3000);

const r = await p1.evaluate(() => {
  const cards = Array.from(document.querySelectorAll(".portfolio__grid .card:not(.card--skeleton)"));
  return cards.slice(0, 4).map((el) => Math.round(getComputedStyle(el).opacity * 100) / 100);
});
console.log("final cards:", JSON.stringify(r));
await browser.close();