import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "bayi-portal", "index.html");
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

const url = "file:///" + htmlPath.replace(/\\/g, "/") + "?portal=dealer#dealer";
await page.goto(url, { waitUntil: "load" });
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("ototr-dealer-supabase-session-v1", JSON.stringify({
    access_token: "expired-local-test-token",
    refresh_token: "invalid-local-test-refresh",
    expires_at: 1,
    email: "stale-session@ototr.test",
  }));
  localStorage.setItem("ototr-dealer-supabase-sync-v1", JSON.stringify({
    lastError: "Refresh token is not valid (validation_failed)",
    lastCount: 1,
  }));
});
await page.reload({ waitUntil: "load" });
await page.waitForSelector("#page-dealer.active", { timeout: 10000 });
await page.waitForSelector("#page-dealer.active [data-dealer-live-login-form]", { timeout: 10000 });

const visibleText = await page.locator("#page-dealer.active").textContent({ timeout: 5000 });
if (/Refresh token is not valid|validation_failed/i.test(visibleText || "")) {
  throw new Error("Bayi portalinda gecersiz refresh token mesaji ham Supabase hatasi olarak gorunuyor.");
}
if (!/Canlı oturum süresi doldu|Demo oturum aç|Giriş Yap/i.test(visibleText || "")) {
  throw new Error("Bayi portali gecersiz oturumdan sonra giris ekranina donmedi.");
}

const storage = await page.evaluate(() => ({
  session: localStorage.getItem("ototr-dealer-supabase-session-v1"),
  sync: localStorage.getItem("ototr-dealer-supabase-sync-v1"),
}));

if (storage.session) {
  throw new Error("Gecersiz refresh token sonrasi bayi oturumu localStorage icinde kaldi.");
}
if (/Refresh token is not valid|validation_failed/i.test(storage.sync || "")) {
  throw new Error("Gecersiz refresh token hatasi sync state icinde temizlenmedi.");
}

if (errors.length) {
  throw new Error(`Console/page errors:\n${errors.join("\n")}`);
}

await browser.close();

console.log(JSON.stringify({
  status: "ok",
  checked: [
    "Gecersiz refresh token oturumu temizlendi",
    "Ham Supabase validation_failed mesaji ekrandan kaldirildi",
    "Bayi portali yeniden giris ekranina dondu",
  ],
}, null, 2));
