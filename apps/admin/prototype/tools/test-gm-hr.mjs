import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const moduleRoot = path.resolve(here, '..', 'gm-ik');
const html = fs.readFileSync(path.join(moduleRoot, 'index.html'), 'utf8');
const bridge = fs.readFileSync(path.join(moduleRoot, 'erp-nav-integration.js'), 'utf8');
const apiBridge = fs.readFileSync(path.join(moduleRoot, 'hr-api-bridge.mjs'), 'utf8');
const liveController = fs.readFileSync(path.join(moduleRoot, 'hr-live-controller.mjs'), 'utf8');
const runtimeConfig = fs.readFileSync(path.join(moduleRoot, 'hr-runtime-config.js'), 'utf8');
const erpShell = fs.readFileSync(path.resolve(moduleRoot, '..', 'index.html'), 'utf8');

const originalNames = [
  'Elif Kaya', 'Mert Aydın', 'Burak Şen', 'Hakan Öz', 'Emre Tan',
  'Cem Yıldız', 'Selin Arslan', 'Oğuz Polat', 'Deniz Koç', 'Kerem Acar',
  'Tolga Eren', 'Murat Çelik', 'Zeynep Aksoy', 'Barış Kaya', 'Ayten Er',
  'Ahmet Yılmaz', 'Selma Demir', 'Kemal Arı', 'Hasan Er', 'Veli Can'
];

assert.match(html, /<title>OTOTR GM İK Sistemi · Güvenli Pilot<\/title>/);
assert.match(html, /GÜVENLİ PİLOT · CANLI İK SİSTEMİ DEĞİLDİR/);
assert.match(html, /gerçek çalışan, sağlık, maaş, disiplin veya kimlik verisi girmeyin/i);
assert.match(html, /connect-src https:\/\/bsjkohwbtrfwrqcyhsfz\.supabase\.co wss:\/\/bsjkohwbtrfwrqcyhsfz\.supabase\.co/);
assert.match(html, /ototr-gm-ik-safe-pilot-v2/);
assert.match(html, /Hukuk\/KVKK politika onayı bekliyor/);
assert.doesNotMatch(html, /Rıza geri alınana kadar/);
assert.match(html, /\["hazirlik","Canlıya hazırlık",1\]/);
assert.match(html, /V\.hazirlik=/);
assert.match(html, /id="hr-backend-status"/);
assert.match(html, /id="hr-backend-readiness"/);
assert.match(html, /hr-runtime-config\.js\?v=20261103/);
assert.match(html, /hr-live-controller\.mjs\?v=20261103/);
assert.match(html, /gerçek çalışan verisi üretim kapısında kilitlidir/i);
assert.match(html, /const scrubText=/);
assert.match(html, /scrubTree\(PGET\(\)\)/);
assert.match(html, /\^\[a-z0-9_-\]\{1,40\}\$/i);
assert.match(html, /Hata: JSON doğrulanamadı/);
assert.match(html, /href="\.\.\/index\.html#dashboard"/);
assert.doesNotMatch(html, /fonts\.googleapis\.com/i);
const networkUrls = [...html.matchAll(/https?:\/\/[^'"\s;>]+/g)].map((match) => match[0]);
assert.deepEqual(networkUrls, ['https://bsjkohwbtrfwrqcyhsfz.supabase.co']);
assert.doesNotMatch(html, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
assert.doesNotMatch(html, /(service_role|SUPABASE_SERVICE_ROLE|api[_-]?key\s*=|secret\s*=)/i);
assert.doesNotMatch(apiBridge + liveController + runtimeConfig, /(service_role|SUPABASE_SERVICE_ROLE|sb_secret_)/i);
assert.match(apiBridge, /RPC_ALLOWLIST/);
assert.match(apiBridge, /sb_publishable_/);
assert.match(apiBridge, /credentials: 'omit'/);
assert.match(liveController, /realPersonDataAllowed/);
assert.match(runtimeConfig, /publishableKey: ''/);
for (const name of originalNames) assert.equal(html.includes(name), false, `Orijinal örnek ad kaldı: ${name}`);

assert.match(bridge, /heading\.textContent = 'GM İK Sistemi'/);
assert.match(bridge, /İK Yönetim Merkezi/);
assert.match(bridge, /new URL\('gm-ik\/', document\.baseURI\)/);
assert.match(bridge, /MutationObserver/);
assert.match(bridge, /data-gm-hr-link/);
assert.match(erpShell, /<script src="gm-ik\/erp-nav-integration\.js\?v=20261103"><\/script>/);

const { HrApiBridge, readStoredAccessToken } = await import('../gm-ik/hr-api-bridge.mjs');
const stored = new Map([['sb-test-auth-token', JSON.stringify({ access_token: 'header.payload.signature' })]]);
const storage = {
  get length() { return stored.size; },
  key(index) { return [...stored.keys()][index] ?? null; },
  getItem(key) { return stored.get(key) ?? null; },
};
assert.equal(readStoredAccessToken(storage), 'header.payload.signature');

let request;
const api = new HrApiBridge({
  url: 'https://example.supabase.co/',
  publishableKey: 'sb_publishable_abcdefghijklmnopqrstuvwxyz',
  accessToken: 'header.payload.signature',
  fetchImpl: async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, json: async () => ({ realPersonDataAllowed: false }) };
  },
});
const context = await api.rpc('hr_my_context');
assert.equal(context.realPersonDataAllowed, false);
assert.equal(request.url, 'https://example.supabase.co/rest/v1/rpc/hr_my_context');
assert.equal(request.options.headers.apikey, 'sb_publishable_abcdefghijklmnopqrstuvwxyz');
assert.equal(request.options.credentials, 'omit');
await assert.rejects(() => api.rpc('hr_delete_everything'), /İzin verilmeyen/);

console.log('PASS gm-hr: güvenli pilot, anonim örnek veri, salt-okunur canlı RPC köprüsü, oturum/ağ sınırı ve ERP menü bağı doğrulandı.');
