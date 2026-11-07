import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {resolveStagingToken} from './finance-staging-auth.mjs';
import {assertFinanceDataMinimized} from './finance-data-minimization.mjs';

const base = 'https://bsjkohwbtrfwrqcyhsfz.supabase.co';
const origin = 'http://127.0.0.1:42733';
const key = process.env.OTOTR_STAGING_PUBLISHABLE_KEY;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function scopeFromEnvironment(name) {
  const values = (process.env[name] || '').split(',');
  if (values.length !== 3 || !values.every(value => uuid.test(value))) {
    throw new Error(name + ' must contain legal entity, dealer account and branch UUIDs');
  }
  const [legalEntityId, dealerAccountId, branchId] = values;
  return {legalEntityId, dealerAccountId, branchId};
}

async function read(token, scope, operationId = 'getDealerFinanceSummary') {
  const fixtureDate=process.env.OTOTR_STAGING_FIXTURE_DATE;
  const response = await fetch(base + '/functions/v1/finance-read', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      apikey: key, authorization: 'Bearer ' + token, origin,
      'content-type': 'application/json', 'correlation-id': randomUUID()
    },
    body: JSON.stringify({
      operationId,
      scope,
      pathParams: {dealerAccountId: scope.dealerAccountId},
      query: operationId==='exportDealerStatement'
        ? {from:fixtureDate,to:fixtureDate,currency:'TRY',limit:10000}
        : {asOf:fixtureDate}
    })
  });
  return {status: response.status, body: await response.json().catch(() => null)};
}

async function verifyBrowser(publishRoot, branchA, branchB, financeToken, managerToken) {
  const {chromium} = await import('playwright');
  const {createFinanceDemoServer} = await import('./finance-demo-server.mjs');
  const server = await createFinanceDemoServer({port: 42733, staticRoot: publishRoot});
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    });
    for (const [label, token, scope, expectedStatus] of [
      ['Finance branch A', financeToken, branchA, 200],
      ['Finance branch B', financeToken, branchB, 200],
      ['Manager branch A', managerToken, branchA, 200],
      ['Manager branch B', managerToken, branchB, 403]
    ]) {
      const page = await browser.newPage();
      try {
        await page.addInitScript(({base, key, token, scope, origin}) => {
          if (window !== window.top || location.origin !== origin || location.pathname !== '/muhasebe-v2/') return;
          window.OTOTR_SUPABASE_CONFIG = {url: base, publishableKey: key};
          window.OTOTR_FINANCE_AUTH = {getAccessToken: () => token};
          window.OTOTR_FINANCE_CONTEXT = scope;
        }, {base, key, token, scope, origin});
        await page.goto(origin + '/muhasebe-v2/', {waitUntil: 'domcontentloaded'});
        const response = page.waitForResponse(response =>
          response.url() === base + '/functions/v1/finance-read' &&
          response.request().postDataJSON()?.operationId === 'getDealerFinanceSummary'
        );
        await page.locator('[data-finance-connect]').click();
        const summary = await response;
        assert.equal(summary.status(), expectedStatus, label + ' unexpected browser response');
        if (expectedStatus === 403) {
          assert.equal((await summary.json())?.error?.code, 'SCOPE_DENIED');
          console.log('PASS browser ' + label + ' denied');
          continue;
        }
        await page.locator('[data-finance-screen="SCR-02"]').click();
        await page.getByText('READY · BRANCH-SCOPED PROJECTION', {exact: true}).waitFor();
        assert.doesNotMatch(await page.locator('body').innerText(),/sb_secret_|service_role|access[_ ]?token|refresh[_ ]?token|customerEmail|customerPhone|objectKey|rawPayload|cardNumber|\bcvv\b/i,label+' rendered sensitive finance data');
        console.log('PASS browser ' + label);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
}

try {
  assert.ok(key?.startsWith('sb_publishable_'), 'Staging publishable key is required');
  const financeToken=await resolveStagingToken('finance',{base,publishableKey:key});
  const managerToken=await resolveStagingToken('manager',{base,publishableKey:key});
  assert.notEqual(financeToken,managerToken,'Two separate staging Auth sessions are required');
  assert.match(process.env.OTOTR_STAGING_FIXTURE_DATE || '', /^\d{4}-\d{2}-\d{2}$/);
  const branchA = scopeFromEnvironment('OTOTR_STAGING_SCOPE_A');
  const branchB = scopeFromEnvironment('OTOTR_STAGING_SCOPE_B');
  assert.equal(branchA.legalEntityId, branchB.legalEntityId, 'Branches must share a headquarters');
  assert.notEqual(branchA.branchId, branchB.branchId, 'Two distinct branches are required');

  for (const [label, token, scope] of [
    ['Finance branch A', financeToken, branchA],
    ['Finance branch B', financeToken, branchB],
    ['Manager branch A', managerToken, branchA]
  ]) {
    const result = await read(token, scope);
    assert.equal(result.status, 200, label + ' expected HTTP 200');
    assert.ok(result.body?.data?.branchId === scope.branchId, label + ' returned an unexpected branch');
    assert.ok(result.body?.data?.accrued?.grossAmount != null, label + ' returned no fixture balance');
    assertFinanceDataMinimized(result.body.data,label);
    console.log('PASS ' + label);
    const exported=await read(token,scope,'exportDealerStatement');
    assert.equal(exported.status,200,label+' export expected HTTP 200');
    assert.equal(exported.body?.data?.documentType,'OTOTR_FINANCE_DEALER_STATEMENT_EXPORT',label+' returned an unexpected export contract');
    assertFinanceDataMinimized(exported.body.data,label+' export');
    console.log('PASS '+label+' export');
  }
  const denied = await read(managerToken, branchB);
  assert.equal(denied.status, 403, 'Cross-branch request expected HTTP 403');
  assert.equal(denied.body?.error?.code, 'SCOPE_DENIED');
  console.log('PASS manager cross-branch access rejected');
  const deniedExport=await read(managerToken,branchB,'exportDealerStatement');
  assert.equal(deniedExport.status,403,'Cross-branch export expected HTTP 403');
  assert.equal(deniedExport.body?.error?.code,'SCOPE_DENIED');
  console.log('PASS manager cross-branch export rejected');
  if (process.argv[2]) await verifyBrowser(process.argv[2], branchA, branchB, financeToken, managerToken);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
