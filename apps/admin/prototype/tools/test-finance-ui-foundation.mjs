import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../bayi-portal/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../bayi-portal/assets/finance-ui.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../bayi-portal/assets/finance-ui.js', import.meta.url), 'utf8');

assert.match(html, /id="financePage"/);
assert.match(html, /ADAY UI · LIVE BAĞLANTI KAPALI/);
assert.match(html, /Bu ekran demo rakam üretmez/);
assert.match(html, /data-finance-screen-nav/);
assert.match(html, /assets\/finance-ui\.css/);
assert.match(html, /assets\/finance-ui\.js/);
assert.match(css, /\.finance-workspace/);
assert.match(css, /@media\(max-width:720px\)/);

const ids = [...js.matchAll(/\['(SCR-\d{2})','/g)].map(match => match[1]);
assert.equal(ids.length, 17);
assert.equal(new Set(ids).size, 17);
assert.deepEqual(ids, Array.from({ length: 17 }, (_, index) => `SCR-${String(index + 1).padStart(2, '0')}`));
assert.doesNotMatch(js, /localStorage|sessionStorage|Math\.random|ROYALTY_RATE|fetch\s*\(/);
assert.match(js, /demo veya tahmini tutar gösterilmiyor/);
assert.match(js, /selectScreen\(screens\[0\]\)/);

console.log('PASS finance-ui-foundation: 17 ekran, explicit no-data state, no demo fallback');
