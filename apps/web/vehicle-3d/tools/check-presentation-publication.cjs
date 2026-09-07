const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const app = path.resolve(__dirname, '..');
const published = path.join(app, '.local/erp-publish/kaporta-360');
const output = path.join(app, '.local');
const live = process.argv.includes('--live');
const mode = live ? 'live' : 'staged';
const prefix = '/Ototr/kaporta-360/';
const origin = live ? 'https://samivolkan.github.io' : 'http://127.0.0.1:4332';
const base = origin + prefix;
const url = base + 'sunum.html';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const modulePath = html => html.match(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/)?.[1];

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const expectedHTML = fs.readFileSync(path.join(published, 'sunum.html'), 'utf8');
  const expectedModule = modulePath(expectedHTML);
  assert.ok(expectedModule, 'Staged presentation must have a compiled module reference');
  const expectedBytes = fs.readFileSync(path.resolve(published, expectedModule));
  let server, browser;
  const checks = [], errors = [], consoleErrors = [], failedResponses = [], externalRequests = [];
  const result = { mode, url, expectedModule, expectedModuleSHA256: digest(expectedBytes), checks,
    errors, consoleErrors, failedResponses, externalRequests, startedAt: new Date().toISOString() };
  const pass = name => { checks.push(name); console.log('PASS ' + name); };
  try {
    if (!live) {
      server = http.createServer((request, response) => {
        try {
          const pathname = decodeURIComponent(new URL(request.url, origin).pathname);
          if (pathname.endsWith('/favicon.ico')) { response.writeHead(204).end(); return; }
          if (!pathname.startsWith(prefix)) { response.writeHead(404).end(); return; }
          const relative = pathname.slice(prefix.length) || 'index.html';
          const file = path.resolve(published, relative);
          if (!file.startsWith(published + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
            response.writeHead(404).end(); return;
          }
          response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
          fs.createReadStream(file).pipe(response);
        } catch { response.writeHead(400).end(); }
      });
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(4332, '127.0.0.1', resolve); });
    }
    const htmlResponse = await fetch(url, { cache: 'no-store' });
    assert.equal(htmlResponse.status, 200);
    const actualModule = modulePath(await htmlResponse.text());
    assert.equal(actualModule, expectedModule, 'Published HTML must point to the final staged bundle');
    const scriptResponse = await fetch(new URL(actualModule, url), { cache: 'no-store' });
    assert.equal(scriptResponse.status, 200);
    assert.equal(digest(Buffer.from(await scriptResponse.arrayBuffer())), result.expectedModuleSHA256,
      'The served presentation module must byte-match the final staged bundle');
    pass('Canonical presentation URL serves the exact final compiled module');

    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    // This publication check uses only the public reference demo and an empty login
    // session. It never signs in, invokes a report token, or fetches private records.
    await context.route('**/*', route => {
      const requested = new URL(route.request().url());
      if (['http:', 'https:'].includes(requested.protocol) && requested.origin !== origin) {
        externalRequests.push(requested.origin + requested.pathname); return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() }); });
    const ready = async () => {
      await page.locator('#part-title').waitFor({ timeout: 30000 });
      await page.locator('[data-action=view][data-view=model]').click();
      await page.waitForFunction(() => document.querySelector('.scene-host canvas') && !document.querySelector('.scene')?.classList.contains('loading'));
      assert.equal(await page.locator('.scene-host canvas').count(), 1);
      assert.equal(await page.locator('.part-chip').count(), 23);
    };
    const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.goto(url, { waitUntil: 'domcontentloaded' }); await ready();
    assert.equal(await page.locator('script[type=module]').getAttribute('src'), expectedModule);
    assert.match(await page.locator('.pill.demo').first().textContent(), /ÖRNEK SUNUM/);
    assert.match(await page.locator('.studio-source').textContent(), /temsili bir modeldir.*Fotoğraflardan üretilmez/);
    assert.match(await page.locator('.vehicle-label').textContent(), /Opel ADAM/);
    assert.equal(await page.locator('[data-id=left_rear_door].part-chip,[data-id=right_rear_door].part-chip').count(), 0);
    pass('Public reference demo is clearly labelled and renders 23 correct selectable body parts');

    await page.locator('.tour-stop[data-id=left_front_fender]').click();
    assert.equal(await page.locator('.scene').getAttribute('data-selected'), 'left_front_fender');
    assert.equal(await page.locator('#part-title').textContent(), 'Sol ön çamurluk');
    for (const value of ['isolate', 'exploded']) {
      await page.locator('[data-action=mode][data-mode=' + value + ']').click();
      assert.equal(await page.locator('.scene').getAttribute('data-mode'), value);
      assert.equal(await page.locator('[data-action=mode][data-mode=' + value + ']').getAttribute('aria-pressed'), 'true');
    }
    await page.locator('#separation').fill('100');
    assert.equal(await page.locator('.scene').getAttribute('data-separation'), '1');
    await page.locator('#separation').fill('72');
    pass('Left fender selection, single-panel focus and full explosion controls work');

    await page.locator('[data-action=zoom-photo]').click();
    await page.waitForFunction(() => document.querySelector('dialog[open] #dialog-media img')?.naturalWidth === 1072);
    assert.match(await page.locator('#dialog-caption').textContent(), /Hasar kanıtı değildir/);
    await page.locator('[data-action=close-photo]').click();
    assert.equal(await page.locator('dialog[open]').count(), 0);
    pass('Selected panel opens its original reference photograph with a clear evidence limitation');

    await page.locator('[data-action=view][data-view=photo]').click();
    const frames = [];
    for (let i = 1; i <= 24; i++) {
      const frame = './real-car/frame-' + String(i).padStart(2, '0') + '.jpg';
      await page.locator('#photo-frame').fill(String(i));
      await page.waitForFunction(expected => {
        const image = document.querySelector('#photo-stage img');
        return image?.getAttribute('src') === expected && image.complete && image.naturalWidth === 1072 && image.naturalHeight === 586;
      }, frame);
      frames.push(await page.locator('#photo-stage img').getAttribute('src'));
    }
    assert.equal(new Set(frames).size, 24);
    pass('All 24 distinct original reference frames decode at their original dimensions');

    await page.locator('[data-action=view][data-view=model]').click();
    await page.locator('.tour-stop[data-id=left_front_door]').click();
    await page.waitForTimeout(1500); await noOverflow(); await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(output, 'presentation-publication-' + mode + '-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    // Let the camera finish its responsive reframing before judging vehicle bounds.
    await page.waitForTimeout(1500); await noOverflow();
    const label = await page.locator('#model-label').boundingBox(), stage = await page.locator('.scene').boundingBox();
    assert.ok(label && stage && label.x >= stage.x && label.x + label.width <= stage.x + stage.width,
      'Selected panel label stays horizontally within the mobile stage');
    await page.screenshot({ path: path.join(output, 'presentation-publication-' + mode + '-mobile.png'), fullPage: true });
    pass('390px layout fits the viewport and the focused model reframes with its selected label visible');

    await page.goto(base + 'pilot.html', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Ekspertize devam edin' }).waitFor();
    const presentationLink = page.getByRole('link', { name: /Parçalı 3D müşteri sunumunu incele/ });
    assert.equal(await presentationLink.getAttribute('href'), './sunum.html');
    await presentationLink.click(); await ready();
    assert.equal(new URL(page.url()).pathname, prefix + 'sunum.html');
    pass('Empty personnel login page links directly to the public customer presentation');

    assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedResponses, []); assert.deepEqual(externalRequests, []);
    pass('No runtime errors, failed assets, authentication requests or private-data requests');
    result.passed = checks.length; result.finishedAt = new Date().toISOString();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    result.failure = error.message; result.finishedAt = new Date().toISOString(); throw error;
  } finally {
    fs.writeFileSync(path.join(output, 'presentation-publication-' + mode + '.json'), JSON.stringify(result, null, 2));
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
