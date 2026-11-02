import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const portalRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'bayi-portal');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    const relative = normalize(pathname === '/' ? 'index.html' : pathname.slice(1));
    const target = join(portalRoot, relative);
    if (!target.startsWith(portalRoot) || !(await stat(target)).isFile()) throw new Error('NOT_FOUND');
    response.writeHead(200, {'content-type': mime[extname(target)] || 'application/octet-stream'});
    response.end(await readFile(target));
  } catch {
    response.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
    response.end('Not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const scope = Object.freeze({
  legalEntityId:'11111111-1111-4111-8111-111111111111',
  dealerAccountId:'22222222-2222-4222-8222-222222222222',
  branchId:'33333333-3333-4333-8333-333333333333',
});
const item = (id, feeCode, gross, allocated, open, status = 'OPEN', recordType = 'ACCRUAL') => ({
  recordId:id, recordType, businessDate:'2026-11-03', feeCode,
  sourceReference:`SRC-${id.slice(0, 4)}`,
  totals:{netAmount:gross,taxAmount:'0',grossAmount:gross,currency:'TRY'},
  allocatedAmount:allocated, openAmount:open, currencyCode:'TRY', status,
  paymentIds:['55555555-5555-4555-8555-555555555555'],
});

let browser;
const requests = [];
try {
  browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(({origin, scope}) => {
    window.OTOTR_SUPABASE_CONFIG = {url:origin,publishableKey:`sb_publishable_${'a'.repeat(32)}`};
    window.OTOTR_FINANCE_AUTH = {getAccessToken:() => `test-user-token-${'x'.repeat(32)}`};
    window.OTOTR_FINANCE_CONTEXT = scope;
  }, {origin, scope});
  await page.route('**/functions/v1/finance-read', async route => {
    const body = route.request().postDataJSON();
    requests.push(body);
    await new Promise(resolve => setTimeout(resolve, 75));
    if (body.operationId === 'getPayment') {
      const paymentId = body.pathParams.paymentId;
      const data = {
        payment:{paymentId,status:'PARTIALLY_ALLOCATED',paymentDate:'2026-11-03',amount:{amount:'200.00000000',currency:'TRY'},paymentMethodCode:'BANK_TRANSFER',externalReference:'BANK-2026-001'},
        allocations:[{allocationId:'66666666-6666-4666-8666-666666666666',openItemId:'77777777-7777-4777-8777-777777777777',amount:{amount:'80.00000000',currency:'TRY'},status:'ACTIVE'}],
        unallocatedAmount:{amount:'120.00000000',currency:'TRY'},version:1,
      };
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});
      return;
    }
    if (body.operationId === 'getAccrualDetail') {
      const accrualId = body.pathParams.accrualId;
      const data = {
        accrualId,sourceEventId:'88888888-8888-4888-8888-888888888888',feeRuleId:'99999999-9999-4999-8999-999999999999',status:'POSTED',
        calculation:{status:'CALCULATED',amounts:{netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'}},
        journalEntry:{journalEntryId:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',entryNumber:'JE-TEST-001',postingDate:'2026-11-03',currency:'TRY',source:{sourceType:'customer-payment.settled'},lines:[
          {accountCode:'120.01',direction:'DEBIT',amount:'120.00000000',description:'Bayi alacağı'},
          {accountCode:'600.01',direction:'CREDIT',amount:'100.00000000',description:'Royalty geliri'},
          {accountCode:'391.01',direction:'CREDIT',amount:'20.00000000',description:'Hesaplanan KDV'}
        ]}
      };
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});
      return;
    }
    if (body.operationId === 'getRoyaltyRefundTrace') {
      const reversalAccrualId=body.pathParams.reversalAccrualId;
      const data={
        refundEvent:{refundId:'12121212-1212-4212-8212-121212121212',refundedGrossAmount:'590.00000000',currency:'TRY'},
        originalCollection:{collectionId:'13131313-1313-4313-8313-131313131313',collectedGrossAmount:'1180.00000000',currency:'TRY'},
        originalRoyaltyAccrual:{accrualId:'14141414-1414-4414-8414-141414141414',grossAmount:'118.00000000',currency:'TRY'},
        reversalAccrual:{accrualId:reversalAccrualId,grossAmount:'59.00000000',currency:'TRY',status:'POSTED'},
        creditOpenItem:{openItemId:'15151515-1515-4515-8515-151515151515',itemType:'CREDIT',originalAmount:'59.00000000',openAmount:'59.00000000',currency:'TRY'},
        periodProvenance:{originalPeriodId:'16161616-1616-4616-8616-161616161616',postingPeriodId:'17171717-1717-4717-8717-171717171717',refundBusinessDate:'2026-11-03'}
      };
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})}); return;
    }
    if (body.query.status === 'DISPUTED') {
      await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{code:'READ_MODEL_UNAVAILABLE',message:'Ekstre projectionı geçici olarak kullanılamıyor.'}})});
      return;
    }
    const secondPage = body.query.cursor === 'page-2';
    const filtered = body.query.status === 'OPEN';
    const data = secondPage
      ? {items:[item('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','ROYALTY','59.00000000','0','59.00000000','OPEN','REVERSAL')],nextCursor:null,hasMore:false}
      : body.query.status === 'REVERSED'
        ? {items:[],nextCursor:null,hasMore:false}
      : filtered
        ? {items:[item('cccccccc-cccc-4ccc-8ccc-cccccccccccc','ROYALTY','118.00000000','0','118.00000000')],nextCursor:null,hasMore:false}
        : {items:[item('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','ENTRY_FRANCHISE','1200.00000000','200.00000000','1000.00000000')],nextCursor:'page-2',hasMore:true};
    await route.fulfill({status:200,contentType:'application/json',headers:{'correlation-id':'44444444-4444-4444-8444-444444444444'},body:JSON.stringify({data})});
  });

  await page.goto(`${origin}/index.html`, {waitUntil:'networkidle'});
  await page.click('#navFinance');
  await page.click('[data-finance-screen="SCR-07"]');
  await assert.doesNotReject(() => page.waitForSelector('[data-finance-statement]:not([hidden])'));
  assert.equal(await page.locator('[data-finance-statement-refresh]').isEnabled(), true);
  assert.equal(await page.locator('[data-finance-statement-body] tr').count(), 0);

  await page.click('[data-finance-statement-refresh]');
  assert.equal(await page.locator('[data-finance-statement]').getAttribute('data-state'), 'LOADING');
  await page.waitForFunction(() => document.querySelectorAll('[data-finance-statement-body] tr').length === 1);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(), /ENTRY_FRANCHISE/);
  assert.equal(await page.locator('[data-finance-statement-more]').isVisible(), true);
  await page.click('[data-finance-payment-id]');
  assert.equal(await page.locator('[data-finance-payment-detail]').getAttribute('data-state'), 'LOADING');
  await page.waitForFunction(() => document.querySelector('[data-finance-payment-detail]')?.dataset.state === 'READY');
  assert.match(await page.locator('[data-finance-payment-detail]').innerText(), /200,00000000 TRY/);
  assert.match(await page.locator('[data-finance-payment-detail]').innerText(), /120,00000000 TRY/);
  assert.match(await page.locator('[data-finance-payment-allocations]').innerText(), /80,00000000 TRY/);
  assert.equal(requests.at(-1).operationId, 'getPayment');
  await page.click('[data-finance-payment-close]');
  assert.equal(await page.locator('[data-finance-payment-detail]').isVisible(), false);
  await page.click('[data-finance-accrual-id]');
  assert.equal(await page.locator('[data-finance-accrual-detail]').getAttribute('data-state'), 'LOADING');
  await page.waitForFunction(() => document.querySelector('[data-finance-accrual-detail]')?.dataset.state === 'READY');
  assert.match(await page.locator('[data-finance-accrual-detail]').innerText(), /120,00000000 TRY/);
  assert.match(await page.locator('[data-finance-accrual-lines]').innerText(), /Royalty geliri/);
  assert.equal(requests.at(-1).operationId, 'getAccrualDetail');
  await page.click('[data-finance-accrual-close]');
  assert.equal(await page.locator('[data-finance-accrual-detail]').isVisible(), false);

  await page.click('[data-finance-statement-more]');
  await page.waitForFunction(() => document.querySelectorAll('[data-finance-statement-body] tr').length === 2);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(), /Royalty iade izini aç/);
  assert.equal(await page.locator('[data-finance-statement-more]').isVisible(), false);
  await page.click('[data-finance-refund-accrual-id]');
  assert.equal(await page.locator('[data-finance-refund-detail]').getAttribute('data-state'),'LOADING');
  await page.waitForFunction(()=>document.querySelector('[data-finance-refund-detail]')?.dataset.state==='READY');
  assert.match(await page.locator('[data-finance-refund-detail]').innerText(),/590,00000000 TRY/);
  assert.match(await page.locator('[data-finance-refund-detail]').innerText(),/118,00000000 TRY/);
  assert.match(await page.locator('[data-finance-refund-detail]').innerText(),/59,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'getRoyaltyRefundTrace');
  await page.click('[data-finance-refund-close]');
  assert.equal(await page.locator('[data-finance-refund-detail]').isVisible(),false);

  await page.selectOption('[data-finance-statement-status]', 'OPEN');
  assert.equal(await page.locator('[data-finance-statement-body] tr').count(), 0);
  assert.match(await page.locator('[data-finance-statement-state]').innerText(), /Filtre değişti/);
  await page.click('[data-finance-statement-refresh]');
  await page.waitForFunction(() => document.querySelectorAll('[data-finance-statement-body] tr').length === 1);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(), /ROYALTY/);
  assert.equal(requests.at(-1).query.status, 'OPEN');
  assert.equal(requests.at(-1).scope.branchId, scope.branchId);
  assert.equal(requests.at(-1).operationId, 'getDealerStatement');

  await page.selectOption('[data-finance-statement-status]', 'REVERSED');
  await page.click('[data-finance-statement-refresh]');
  await page.waitForFunction(() => document.querySelector('[data-finance-statement]')?.dataset.state === 'EMPTY');
  assert.match(await page.locator('[data-finance-statement-state]').innerText(), /kayıt bulunamadı/i);
  assert.equal(await page.locator('[data-finance-statement-table]').isVisible(), false);

  await page.selectOption('[data-finance-statement-status]', 'DISPUTED');
  await page.click('[data-finance-statement-refresh]');
  await page.waitForFunction(() => document.querySelector('[data-finance-statement]')?.dataset.state === 'ERROR');
  assert.match(await page.locator('[data-finance-statement-state]').innerText(), /geçici olarak kullanılamıyor/i);
  assert.equal(await page.locator('[data-finance-statement-refresh]').isEnabled(), true);

  console.log('PASS finance-statement-browser: scoped statement, payment, accrual and royalty refund trace; state and cursor flows');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
