import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../bayi-portal/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../bayi-portal/assets/finance-ui.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../bayi-portal/assets/finance-ui.js', import.meta.url), 'utf8');
const bridge = await readFile(new URL('../bayi-portal/assets/finance-api-bridge.mjs', import.meta.url), 'utf8');

assert.match(html, /id="financePage"/);
assert.match(html, /ADAY UI · LIVE BAĞLANTI KAPALI/);
assert.match(html, /Bu ekran demo rakam üretmez/);
assert.match(html, /data-finance-screen-nav/);
assert.match(html, /assets\/finance-ui\.css/);
assert.match(html, /assets\/finance-ui\.js/);
assert.match(html, /type="module" src="assets\/finance-api-bridge\.mjs"/);
const financeAuthBlock = html.match(/window\.OTOTRDealerFinanceAuth=Object\.freeze\(\{[\s\S]*?\n\}\);/)?.[0] || '';
assert.match(financeAuthBlock, /OTOTR_FINANCE_AUTH/);
assert.doesNotMatch(financeAuthBlock, /dealerSupabaseActiveSession|localStorage|sessionStorage|anonKey/);
assert.match(html, /data-finance-state/);
assert.match(html, /data-finance-connect disabled/);
assert.match(html, /data-finance-context-status/);
for (const hook of ['statement','statement-status','statement-refresh','statement-state','statement-table','statement-body','statement-count','statement-more']) assert.match(html, new RegExp(`data-finance-${hook}`));
for (const kpi of ['accrued', 'invoiced', 'collected', 'open']) assert.match(html, new RegExp(`data-finance-kpi="${kpi}"`));
assert.match(css, /\.finance-workspace/);
assert.match(css, /@media\(max-width:720px\)/);
assert.match(css, /\.finance-statement-table/);

const ids = [...js.matchAll(/\['(SCR-\d{2})','/g)].map(match => match[1]);
assert.equal(ids.length, 17);
assert.equal(new Set(ids).size, 17);
assert.deepEqual(ids, Array.from({ length: 17 }, (_, index) => `SCR-${String(index + 1).padStart(2, '0')}`));
assert.doesNotMatch(js, /localStorage|sessionStorage|Math\.random|ROYALTY_RATE|fetch\s*\(/);
assert.match(js, /demo veya tahmini tutar gösterilmiyor/);
assert.match(js, /selectScreen\(screens\[0\]\)/);
assert.match(js, /renderStatementPage/);
assert.match(js, /INVALID_FINANCE_STATEMENT_ITEM/);
assert.match(js, /statement\.hidden = id !== 'SCR-07'/);
assert.doesNotMatch(bridge, /localStorage|sessionStorage|service_role|sb_secret_|DEMO|Math\.random/);
assert.match(bridge, /sb_publishable_/);
assert.match(bridge, /execute\(rawScope, READ_OPERATION/);
assert.match(bridge, /STATEMENT_OPERATION/);
assert.match(bridge, /getDealerStatement/);
assert.match(bridge, /loadDealerStatement/);
assert.match(bridge, /globalThis\.OTOTRFinance/);
assert.match(bridge, /connectConfiguredScope/);
assert.match(bridge, /OTOTR_FINANCE_CONTEXT/);

console.log('PASS finance-ui-foundation: 17 ekran, explicit no-data state, no demo fallback');
