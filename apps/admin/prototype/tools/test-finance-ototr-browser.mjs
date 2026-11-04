import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createFinanceDemoServer} from './finance-demo-server.mjs';

const publishRoot = process.argv[2];
if (!publishRoot) throw new Error('Pass the local Ototr publish checkout path');

const server = await createFinanceDemoServer({port: 0, staticRoot: publishRoot, enableOtotrDemo: true});
const base = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  for (const path of ['/.git/HEAD', '/%2egit/HEAD', '/muhasebe-v2/%5c..%5c.git%5cHEAD']) {
    assert.equal((await fetch(base + path)).status, 404);
  }
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  const financeRequests = [];
  page.on('request', request => {
    const pathname = new URL(request.url()).pathname;
    if (/^\/(?:functions\/v1\/finance-|api\/finance\/)/.test(pathname)) {
      financeRequests.push(pathname);
    }
  });
  await page.goto(base + '/index.html#dashboard');
  await page.getByRole('button', {name: 'Muhasebe V2', exact: true}).click();
  await page.waitForURL('**/muhasebe-v2/');
  await page.waitForFunction(() => document.querySelector('[data-finance-readiness]')?.dataset.state === 'READY');
  assert.match(await page.locator('[data-finance-environment]').innerText(), /LIVE BAĞLANTI KAPALI/);
  assert.equal(await page.locator('[data-finance-connect]').isDisabled(), true);
  await page.locator('[data-finance-screen="SCR-04"]').click();
  const simulator = page.locator('[data-finance-rule-simulator]');
  await simulator.locator('[name="collectedGross"]').fill('1180,00');
  await simulator.locator('[name="ratePercent"]').fill('10');
  await simulator.locator('[name="refundGross"]').fill('590,00');
  await simulator.locator('button[type="submit"]').click();
  assert.match(await simulator.innerText(), /118\.00 TRY/);
  assert.match(await simulator.innerText(), /-59\.00 TRY/);
  assert.match(await page.locator('[data-finance-simulator-state]').innerText(), /KAYDEDİLMEDİ/);
  await page.locator('[data-finance-screen="SCR-08"]').click();
  assert.equal(await page.locator('[data-finance-card-checkout-submit]').isDisabled(), true);
  assert.deepEqual(financeRequests, []);

  await page.goto(base + '/muhasebe-v2/?financeDemo=1', {waitUntil: 'domcontentloaded'});
  await page.getByRole('heading', {name: 'Muhasebe V2', exact: true}).waitFor();
  assert.match(await page.locator('[data-finance-environment]').innerText(), /SENTETİK DEMO/);
  await page.locator('[data-finance-connect]').click();
  await page.waitForFunction(() => document.querySelector('[data-finance-headquarters]')?.dataset.state === 'READY');
  assert.match(await page.locator('.finance-screen-stage').innerText(), /248\.000,00000000 TRY/);
  assert.ok(financeRequests.includes('/functions/v1/finance-read'));
  await page.locator('[data-finance-screen="SCR-08"]').click();
  assert.equal(await page.locator('[data-finance-card-checkout-submit]').isDisabled(), true);
  await page.getByRole('link', {name: 'ERP Kokpitine Dön'}).click();
  await page.waitForURL('**/index.html#dashboard');
  console.log('PASS Ototr ERP navigation, unconfigured data isolation, synthetic finance balances, disabled card checkout and dashboard return');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
