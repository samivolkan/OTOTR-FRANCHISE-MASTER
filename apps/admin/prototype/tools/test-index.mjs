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
const ignoredConsoleError = (text) => text.includes("net::ERR_CERT_COMMON_NAME_INVALID");

page.on("console", (msg) => {
  if (msg.type() === "error" && !ignoredConsoleError(msg.text())) errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(err.message));

const url = "file:///" + htmlPath.replace(/\\/g, "/");
await page.addInitScript(() => localStorage.clear());
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#page-dashboard.active");

const title = await page.title();
const navRoutes = await page.$$eval("#nav [data-nav-route]", (buttons) =>
  buttons.map((button) => button.getAttribute("data-nav-route")).filter(Boolean)
);

const requiredRoutes = [
  "dashboard",
  "franchise",
  "branches",
  "academy",
  "report-design",
  "crm",
  "finance",
  "settings",
];

for (const route of requiredRoutes) {
  if (!navRoutes.includes(route)) {
    throw new Error(`Beklenen nav route bulunamadi: ${route}`);
  }
  await page.locator(`#nav [data-nav-route="${route}"]`).click();
  const pageRoute = route.split("/")[0] === "ik" ? "hr" : route.split("/")[0];
  await page.waitForSelector(`#page-${pageRoute}.active`, { timeout: 10000 });
}

await page.locator('#nav [data-nav-route="franchise"]').click();
await page.waitForSelector("#page-franchise.active");
const leadBefore = await page.locator("#page-franchise.active .deal").count();
if (await page.locator("#openLead2").count()) {
  await page.locator("#openLead2").click();
  await page.waitForSelector("#leadModal.open");
  await page.locator('#leadModal input[name="name"]').fill("Test Franchise Adayi");
  await page.locator('#leadModal input[name="phone"]').fill("05550000000");
  await page.locator('#leadModal input[name="city"]').fill("Bursa");
  await page.locator('#leadModal textarea[name="note"]').fill("Otomatik test kaydi");
  await page.locator('#leadModal button[form="leadForm"]').click();
  await page.waitForSelector("#leadModal.open", { state: "hidden", timeout: 5000 });
}
const leadAfter = await page.locator("#page-franchise.active .deal").count();

await page.locator('#nav [data-nav-route="report-design"]').click();
await page.waitForSelector("#page-report-design.active");
await page.locator("#page-report-design.active .report-page-title h3").filter({ hasText: "Dijital Araç Karnesi" }).first().waitFor({ state: "attached" });
await page.locator("#page-report-design.active .report-page-title h3").filter({ hasText: "Arac Kabul Kontrol Noktalari" }).first().waitFor({ state: "attached" });
await page.locator("#page-report-design.active .report-page-title h3").filter({ hasText: "Conta Kacak Testi" }).first().waitFor({ state: "attached" });

await page.locator('#nav [data-nav-route="academy"]').click();
await page.waitForSelector("#page-academy.active");
await page.locator("#page-academy.active").getByText("Academy").first().waitFor();

if (errors.length) {
  throw new Error(`Console/page errors:\n${errors.join("\n")}`);
}

await browser.close();

console.log(JSON.stringify({
  title,
  navCount: navRoutes.length,
  checkedRoutes: requiredRoutes,
  leadBefore,
  leadAfter,
  status: "ok"
}, null, 2));
