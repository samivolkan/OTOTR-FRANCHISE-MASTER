import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createFinanceDemoServer} from './finance-demo-server.mjs';

const publishRoot = process.argv[2];
if (!publishRoot) throw new Error('Pass the local Ototr publish checkout path');

const server = await createFinanceDemoServer({port: 0, staticRoot: publishRoot});
const base = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  const bootstrap = await readFile(new URL('../bayi-portal/assets/finance-demo-bootstrap.js', import.meta.url), 'utf8');
  await page.route(base + '/muhasebe-v2/?financeDemo=1', async route => {
    const response = await route.fetch();
    const html = await response.text();
    await route.fulfill({response, body: html.replace(
      '<script src="assets/finance-ui.js"></script>',
      '<script>' + bootstrap + '</script><script src="assets/finance-ui.js"></script>'
    )});
  });
  await page.goto(base + '/index.html#dashboard');
  await page.getByRole('button', {name: 'Muhasebe V2', exact: true}).click();
  await page.waitForURL('**/muhasebe-v2/');
  await page.goto(base + '/muhasebe-v2/?financeDemo=1', {waitUntil: 'domcontentloaded'});
  await page.getByRole('heading', {name: 'Muhasebe V2', exact: true}).waitFor();
  assert.match(await page.locator('[data-finance-environment]').innerText(), /SENTETİK DEMO/);
  await page.locator('[data-finance-connect]').click();
  await page.waitForFunction(() => document.querySelector('[data-finance-headquarters]')?.dataset.state === 'READY');
  assert.match(await page.locator('.finance-screen-stage').innerText(), /248\.000,00000000 TRY/);
  await page.locator('[data-finance-screen="SCR-08"]').click();
  assert.equal(await page.locator('[data-finance-card-checkout-submit]').isDisabled(), true);
  await page.getByRole('link', {name: 'ERP Kokpitine Dön'}).click();
  await page.waitForURL('**/index.html#dashboard');
  console.log('PASS Ototr ERP navigation, synthetic finance balances, disabled card checkout and dashboard return');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
