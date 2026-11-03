import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createFinanceDemoServer} from './finance-demo-server.mjs';

const port=42731;
const server=await createFinanceDemoServer({port});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(`http://127.0.0.1:${port}/index.html?financeDemo=1`,{waitUntil:'networkidle'});
  await page.click('#navFinance');
  assert.match((await page.locator('#navFinance').innerText()).replace(/\s+/g,' ').trim(),/^₺ GM Finans$/);
  assert.match(await page.locator('[data-finance-environment]').innerText(),/SENTETİK DEMO · CANLI VERİ DEĞİL/);
  await page.click('[data-finance-connect]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-state]')?.textContent?.includes('SYNTHETIC TEST DATA'));
  assert.match(await page.locator('.finance-screen-stage').innerText(),/248\.000,00000000 TRY/);
  assert.match(await page.locator('.finance-screen-stage').innerText(),/Sentetik Nilüfer Bayii/);
  await page.click('[data-finance-screen="SCR-15"]');await page.click('[data-finance-approvals-refresh]');await page.waitForFunction(()=>document.querySelectorAll('[data-finance-approvals-body] tr').length===1);assert.match(await page.locator('[data-finance-approvals-body]').innerText(),/EXPENSE_APPROVAL_V1/);await page.click('[data-finance-approvals-body] [data-finance-approval-id]');await page.waitForFunction(()=>document.querySelector('[data-finance-approval-content]')?.hidden===false);assert.match(await page.locator('[data-finance-approval-detail]').innerText(),/finance-expense-approver/);assert.doesNotMatch(await page.locator('[data-finance-approval-detail]').innerText(),/subject_snapshot|evidenceRef|secret/i);
  await page.click('[data-finance-screen="SCR-16"]');await page.click('[data-finance-audit-refresh]');await page.waitForFunction(()=>document.querySelectorAll('[data-finance-audit-body] tr').length===1);assert.match(await page.locator('[data-finance-audit-body]').innerText(),/PASS_THROUGH_EXPENSE_SUBMITTED/);await page.click('[data-finance-audit-body] [data-finance-audit-correlation]');await page.waitForFunction(()=>document.querySelector('[data-finance-audit-trace-content]')?.hidden===false);assert.match(await page.locator('[data-finance-audit-trace]').innerText(),/HASH_REFERENCES_ONLY/);assert.doesNotMatch(await page.locator('[data-finance-audit-trace]').innerText(),/safe_context|payload|secret/i);
  assert.doesNotMatch(await page.locator('[data-finance-environment]').innerText(),/^LIVE/);
  console.log('PASS finance-demo-browser: GM Finans menu, explicit synthetic label, KPI, approval and audit projections verified');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
