import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const moduleRoot = path.resolve(here, '..', 'gm-ik');
const html = fs.readFileSync(path.join(moduleRoot, 'index.html'), 'utf8');
const bridge = fs.readFileSync(path.join(moduleRoot, 'erp-nav-integration.js'), 'utf8');
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
assert.match(html, /href="\.\.\/index\.html#dashboard"/);
assert.doesNotMatch(html, /fonts\.googleapis\.com/i);
const networkUrls = [...html.matchAll(/https?:\/\/[^'"\s;>]+/g)].map((match) => match[0]);
assert.deepEqual(networkUrls, ['https://bsjkohwbtrfwrqcyhsfz.supabase.co']);
assert.doesNotMatch(html, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
assert.doesNotMatch(html, /(service_role|SUPABASE_SERVICE_ROLE|api[_-]?key\s*=|secret\s*=)/i);
for (const name of originalNames) assert.equal(html.includes(name), false, `Orijinal örnek ad kaldı: ${name}`);

assert.match(bridge, /heading\.textContent = 'GM İK Sistemi'/);
assert.match(bridge, /İK Yönetim Merkezi/);
assert.match(bridge, /new URL\('gm-ik\/', document\.baseURI\)/);
assert.match(bridge, /MutationObserver/);
assert.match(bridge, /data-gm-hr-link/);
assert.match(erpShell, /<script src="gm-ik\/erp-nav-integration\.js\?v=20261103"><\/script>/);

console.log('PASS gm-hr: güvenli pilot işaretleri, anonim örnek veri, yalnızca ERP oturum ağı izin listesi ve menü bağı doğrulandı.');
