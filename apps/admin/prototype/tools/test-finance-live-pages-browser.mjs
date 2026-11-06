import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root = process.env.OTOTR_LIVE_PAGES_ROOT || 'https://samivolkan.github.io/Ototr';
const cacheKey = process.env.OTOTR_LIVE_CACHE_KEY || Date.now().toString(36);
const requireAuthenticatedErp = process.env.OTOTR_REQUIRE_AUTHENTICATED_ERP === '1';
const storageState = process.env.OTOTR_ERP_STORAGE_STATE;
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
});

try {
  const context = await browser.newContext({
    viewport: {width: 1440, height: 1000},
    ...(storageState ? {storageState} : {})
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${root}/index.html?uat=${cacheKey}#dashboard`, {waitUntil: 'domcontentloaded'});
  const financeEntry = page.getByRole('button', {name: 'Muhasebe V2', exact: true});
  const authenticatedErp = await financeEntry.isVisible({timeout: 5000}).catch(() => false);

  if (authenticatedErp) {
    await financeEntry.click();
    await page.waitForURL('**/muhasebe-v2/');
    await page.getByRole('heading', {name: 'Muhasebe V2', exact: true}).waitFor();
    assert.match(await page.locator('[data-finance-environment]').innerText(), /LIVE BAĞLANTI KAPALI/);
    console.log('PASS authenticated live ERP -> Muhasebe V2 menu transition');
  } else {
    assert.equal(requireAuthenticatedErp, false,
      'Authenticated ERP session required. Set OTOTR_ERP_STORAGE_STATE or run with an authenticated browser state.');
    console.log('AUTH_REQUIRED live ERP menu transition not executed; public module checks continue');
  }

  await page.goto(`${root}/muhasebe-v2/?uat=${cacheKey}`, {waitUntil: 'domcontentloaded'});
  await page.waitForTimeout(1500);
  if (new URL(page.url()).pathname.includes('/muhasebe-v2/')) {
    await page.getByRole('heading', {name: 'Muhasebe V2', exact: true}).waitFor();
    assert.match(await page.locator('[data-finance-environment]').innerText(), /LIVE BAĞLANTI KAPALI/);
    console.log('PASS authenticated live Muhasebe V2 shell');
  } else {
    console.log('AUTH_REQUIRED live Muhasebe V2 shell redirected to ERP sign-in');
  }

  await page.goto(`${root}/muhasebe-v2/?walkthrough=1&uat=${cacheKey}`, {waitUntil: 'domcontentloaded'});
  await page.getByRole('heading', {name: 'Muhasebe V2', exact: true}).waitFor();
  assert.match(await page.locator('[data-finance-environment]').innerText(), /LIVE BAĞLANTI KAPALI/);
  await page.getByRole('heading', {name: 'Şube tahsilatından royalty ödemesine', exact: true}).waitFor();
  const menuText = await page.locator('[data-finance-screen-nav]').innerText();
  for (const label of ['Genel Merkez Finans Özeti','Tahakkuklar','Ödeme ve Tahsis','Faturalama ve Muhasebe Export Paketleri','Bekleyen Onaylar','Audit ve Değişiklik İzi']) {
    assert.match(menuText, new RegExp(label, 'i'), `Missing finance menu: ${label}`);
  }
  for (let step = 0; step < 5; step += 1) await page.locator('[data-demo-next]').click();
  assert.match(await page.locator('[data-demo-step]').innerText(), /5 \/ 5/);
  assert.match(await page.locator('[data-demo-dealer-due]').innerText(), /₺|TRY/);
  assert.match(await page.locator('[data-demo-invoice]').innerText(), /Ödendi|Ödeme|Fatura/i);
  assert.equal(errors.length, 0, `Browser page errors: ${errors.join(' | ')}`);
  console.log('PASS live Pages Muhasebe V2 navigation, finance menus and synthetic data render');
} finally {
  await browser.close();
}
