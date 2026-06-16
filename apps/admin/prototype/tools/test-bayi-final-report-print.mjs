import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const require = createRequire(import.meta.url);
const packageRoots = [
  root,
  ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : []),
];
const playwrightPath = require.resolve("playwright", { paths: packageRoots });
const { chromium } = require(playwrightPath);

const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));

if (!executablePath) {
  throw new Error("Chrome veya Edge bulunamadi. Headless test icin sistem tarayicisi gerekiyor.");
}

const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(err.message));

const url = "file:///" + htmlPath.replace(/\\/g, "/") + "#dealer";
await page.addInitScript(() => {
  localStorage.clear();
  window.__OTOTR_TEST_PRINT_COUNT__ = 0;
  window.print = () => {
    window.__OTOTR_TEST_PRINT_COUNT__ += 1;
    window.dispatchEvent(new Event("afterprint"));
  };
});

await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#page-dealer.active", { timeout: 10000 });
await page.waitForSelector("#page-dealer.active [data-dealer-prepare-report]", { timeout: 10000 });

const dealerActions = await page.locator("#page-dealer.active [data-dealer-print-wo], #page-dealer.active [data-dealer-print], #page-dealer.active [data-dealer-prepare-report]").count();
if (!dealerActions) {
  throw new Error("Bayi portalinda rapor basim aksiyonu bulunamadi.");
}

await page.locator("#page-dealer.active [data-dealer-prepare-report]").first().click();
await page.waitForFunction(() => location.hash === "#report-design", null, { timeout: 10000 });
await page.waitForSelector("#page-report-design.active .report-page, #page-report-design.active .expertise-page", {
  timeout: 10000,
});

await page.locator('#page-report-design.active button[onclick*="window.print"]').first().click();

const printCount = await page.evaluate(() => window.__OTOTR_TEST_PRINT_COUNT__ || 0);
if (printCount < 1) {
  throw new Error("Rapor basim aksiyonu window.print() cagirmadi.");
}

const activeRoute = await page.evaluate(() => location.hash);
const reportPages = await page.locator("#page-report-design.active .report-page, #page-report-design.active .expertise-page").count();

if (errors.length) {
  throw new Error(`Console/page errors:\n${errors.join("\n")}`);
}

await browser.close();

console.log(JSON.stringify({
  status: "ok",
  activeRoute,
  printCount,
  reportPages,
  checked: [
    "Bayi portali rapor bas aksiyonu",
    "Rapor tasarimi route gecisi",
    "PDF/Yazdir print cagrisi",
  ],
}, null, 2));
