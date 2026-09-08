const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const sharp = require('sharp');

const app = path.resolve(__dirname, '..');
const dist = path.join(app, 'dist-erp');
const out = path.join(app, '.local');
const live = process.argv.includes('--live');
const localOrigin = 'http://127.0.0.1:4336';
const url = live
  ? 'https://samivolkan.github.io/Ototr/kaporta-360/sunum.html'
  : localOrigin + '/kaporta-360/sunum.html';
const origin = new URL(url).origin;
const apiOrigin = 'https://photobodyqa.supabase.co';
const token = 'c'.repeat(64);
const prefix = 'photo-body-' + (live ? 'live-' : '');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.json': 'application/json', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
if (!live && !fs.existsSync(path.join(dist, 'sunum.html'))) throw Error('Build dist-erp before running photo-body browser QA.');
fs.mkdirSync(out, { recursive: true });

const server = live ? null : http.createServer((req, res) => {
  const pathname = new URL(req.url, localOrigin).pathname;
  if (pathname === '/favicon.ico') { res.writeHead(204).end(); return; }
  if (!pathname.startsWith('/kaporta-360/')) { res.writeHead(404).end(); return; }
  const file = path.resolve(dist, '.' + decodeURIComponent(pathname.replace(/^\/kaporta-360\//, '/')));
  if (!file.startsWith(dist + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

function fixture() {
  return {
    customerView: true, reportId: 'QA-PHOTO-BODY', approvedAt: '2026-09-08T12:00:00Z', approvedBy: 'QA uzmanı',
    job: { plate: 'QA 360', brand: 'TEST MARKA', model: 'Test araç', work_order_no: 'QA-ONLY' },
    session: {
      status: 'approved', profile: 'hatchback3', photo_slots: { 'ring-22': 'qa-photo' },
      findings: { left_front_door: { outcome: 'inspected', process: 'painted', defects: ['scratch'], measurements: [215, 224, 229], note: 'QA onaylı kayıt', evidenceIds: ['qa-photo'], annotations: [] } },
    },
    photos: [{ id: 'qa-photo', slot: 'ring-22', kind: 'ring', url: apiOrigin + '/storage/v1/object/sign/kaporta-360/qa/frame-22.jpg?token=qa-only' }],
  };
}

async function pixelData(buffer) {
  return sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

function redPixels({ data, info }) {
  let count = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r > 55 && r > g * 1.3 && r > b * 1.2 && r - Math.min(g, b) > 35) count++;
  }
  return count;
}

function changedPixels(a, b) {
  assert.equal(a.info.width, b.info.width);
  assert.equal(a.info.height, b.info.height);
  let count = 0;
  for (let i = 0; i < a.data.length; i += a.info.channels) {
    if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > 18) count++;
  }
  return count;
}

(async () => {
  if (server) await new Promise((resolve, reject) => { server.once('error', reject); server.listen(4336, '127.0.0.1', resolve); });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  // Observe GPU uploads in this QA context only. Requests alone cannot establish
  // that photographs were used by the 3D renderer rather than an evidence <img>.
  await context.addInitScript(() => {
    window.__qaPhotoTextureUploads = [];
    for (const type of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!type) continue;
      for (const method of ['texImage2D', 'texSubImage2D']) {
        const original = type.prototype[method];
        if (!original) continue;
        type.prototype[method] = function (...args) {
          const source = args.find(value => value instanceof HTMLImageElement);
          if (source && /\/real-car\/frame-\d{2}\.jpg$/.test(new URL(source.currentSrc || source.src, location.href).pathname)) {
            const item = { url: source.currentSrc || source.src, width: source.naturalWidth, height: source.naturalHeight };
            if (!window.__qaPhotoTextureUploads.some(row => row.url === item.url)) window.__qaPhotoTextureUploads.push(item);
          }
          return original.apply(this, args);
        };
      }
    }
  });
  const page = await context.newPage();
  const checks = [], errors = [], consoleErrors = [], unexpected = [], referenceRequests = [], metrics = {};
  let apiCalls = 0;
  page.on('pageerror', e => errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('request', r => {
    const u = new URL(r.url());
    if (['http:', 'https:'].includes(u.protocol) && u.origin !== origin && u.origin !== apiOrigin) unexpected.push(r.url());
    if (u.pathname.includes('/real-car/')) referenceRequests.push(u.pathname);
  });
  await context.route('**/runtime-config.json', route => route.fulfill({ json: { url: apiOrigin, publishableKey: 'qa-public-key' } }));
  await context.route(apiOrigin + '/**', async route => {
    const request = route.request(), u = new URL(request.url());
    if (u.pathname.endsWith('/kaporta-360-report')) {
      apiCalls++;
      assert.equal(request.method(), 'POST'); assert.equal(request.postDataJSON().token, token);
      return route.fulfill({ json: fixture() });
    }
    if (u.pathname.endsWith('/frame-22.jpg')) return route.fulfill({ path: path.join(app, 'public/real-car/frame-22.jpg'), contentType: 'image/jpeg' });
    unexpected.push(request.url()); return route.abort();
  });
  const pass = name => { checks.push(name); console.log('PASS ' + name); };
  const settle = async () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
  const screenshot = async name => page.screenshot({ path: path.join(out, prefix + name + '.png'), fullPage: true });
  const canvasPixels = async () => { await settle(); return pixelData(await page.locator('.scene-host canvas').screenshot()); };
  const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'Horizontal page overflow');
  const ready = async () => {
    await page.locator('#part-title').waitFor();
    await page.waitForFunction(() => document.querySelector('.scene-host')?.dataset.photoTextureState === 'ready');
    assert.equal(await page.locator('.scene-host canvas').count(), 1);
    await settle();
  };
  const selectPart = async id => {
    if (await page.locator('details').getAttribute('open') === null) await page.locator('summary').click();
    await page.locator('.part-chip[data-id=' + id + ']').click();
    assert.equal(await page.locator('.scene').getAttribute('data-selected'), id);
    await page.locator('summary').click();
    await settle();
  };
  try {
    await page.goto(url); await ready();
    assert.equal(await page.locator('.scene').getAttribute('data-view'), 'model');
    assert.equal(await page.locator('.scene').getAttribute('data-mode'), 'assembled');
    assert.match(await page.locator('[data-action=view][data-view=model]').innerText(), /Fotoğraflı\s*3D/i);
    assert.equal(await page.locator('.part-chip').count(), 23);
    assert.equal(apiCalls, 0);
    for (const frame of ['01', '07', '13', '19']) assert.ok(referenceRequests.some(u => u.endsWith('/frame-' + frame + '.jpg')), 'Original frame ' + frame + ' requested');
    const assembled = await canvasPixels();
    metrics.textureUploads = await page.evaluate(() => window.__qaPhotoTextureUploads);
    for (const frame of ['01', '07', '13', '19']) assert.ok(metrics.textureUploads.some(item => item.url.endsWith('/frame-' + frame + '.jpg') && item.width === 1072 && item.height === 586), 'Full-resolution original frame ' + frame + ' uploaded to WebGL');
    metrics.assembledRedPixels = redPixels(assembled);
    assert.ok(metrics.assembledRedPixels > 1000, 'Loaded 3D canvas visibly contains the vehicle roof and accent colors');
    await noOverflow(); await screenshot('desktop-assembled');
    pass('Default 3D uploads all four full-resolution original photographs to WebGL, visibly renders the car and makes no report API call');

    const clickBounds = await page.locator('.scene-host canvas').boundingBox();
    const initialSelection = await page.locator('.scene').getAttribute('data-selected');
    assert.equal(initialSelection, 'left_front_door');
    const knownParts = await page.locator('.part-chip').evaluateAll(nodes => nodes.map(n => n.dataset.id));
    // The first point targets the photographed hood. A bounded set around the
    // visible body accommodates camera-fit changes without any renderer hooks.
    const surfacePoints = [[.36, .49], [.39, .56], [.33, .59], [.45, .51], [.51, .48], [.59, .57], [.63, .66], [.32, .68], [.42, .65], [.54, .68], [.29, .57], [.65, .54]];
    for (const [x, y] of surfacePoints) {
      await page.mouse.click(clickBounds.x + clickBounds.width * x, clickBounds.y + clickBounds.height * y);
      await settle();
      const picked = await page.locator('.scene').getAttribute('data-selected');
      if (picked !== initialSelection) {
        assert.ok(knownParts.includes(picked), 'Canvas click returns a real profile part');
        assert.equal(await page.locator('.part-chip[data-id=' + picked + ']').getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('#part-title').innerText(), (await page.locator('.part-chip[data-id=' + picked + ']').textContent()).trim());
        metrics.canvasSurfacePick = { part: picked, normalizedPoint: [x, y] };
        break;
      }
      await page.locator('[data-action=home]').click();
      await settle();
    }
    assert.ok(metrics.canvasSurfacePick, 'Clicking visible car surfaces must select another real part through canvas ray picking');
    await screenshot('canvas-picked-part');
    await selectPart('left_front_door');
    await page.locator('[data-action=home]').click();
    await settle();
    pass('Clicking a visible car surface through the real canvas selects a profile part and updates its evidence panel');

    await page.locator('[data-action=mode][data-mode=exploded]').click();
    assert.equal(await page.locator('.scene').getAttribute('data-mode'), 'exploded');
    const exploded = await canvasPixels();
    metrics.explodedChangedPixels = changedPixels(assembled, exploded);
    assert.ok(metrics.explodedChangedPixels > 1000, 'Explosion must visibly change rendered geometry');
    assert.ok(redPixels(exploded) > 500, 'Explosion keeps the roof and colored accents in view');
    await screenshot('desktop-exploded');
    await page.locator('[data-action=mode][data-mode=isolate]').click();
    assert.equal(await page.locator('.scene').getAttribute('data-mode'), 'isolate');
    const isolated = await canvasPixels();
    metrics.isolatedChangedPixels = changedPixels(exploded, isolated);
    assert.ok(metrics.isolatedChangedPixels > 1000, 'Isolation must visibly focus a part');
    assert.ok(redPixels(isolated) > 500, 'Isolated door and mirror keep the colored accents in view');
    await screenshot('desktop-isolated');
    pass('Explosion and isolation visibly move photo-textured geometry while keeping the selected surface in view');

    await page.locator('#separation').fill('0');
    assert.equal(await page.locator('.scene').getAttribute('data-separation'), '0');
    const zero = await canvasPixels(); await screenshot('zero-separation');
    await page.locator('#separation').fill('100');
    assert.equal(await page.locator('.scene').getAttribute('data-separation'), '1');
    const full = await canvasPixels();
    metrics.separationChangedPixels = changedPixels(zero, full);
    assert.ok(metrics.separationChangedPixels > 1000, 'Separation slider must change actual rendered pixels');
    await page.locator('#separation').fill('72');
    pass('Zero and full separation alter rendered 3D geometry, not only toolbar state');

    await page.locator('[data-action=mode][data-mode=assembled]').click();
    await page.locator('summary').click();
    const ids = await page.locator('.part-chip').evaluateAll(nodes => nodes.map(n => n.dataset.id));
    assert.equal(ids.length, 23); assert.ok(!ids.includes('left_rear_door') && !ids.includes('right_rear_door'));
    for (const id of ids) {
      await page.locator('.part-chip[data-id=' + id + ']').click();
      assert.equal(await page.locator('.scene').getAttribute('data-selected'), id);
      assert.equal(await page.locator('.part-chip[data-id=' + id + ']').getAttribute('aria-pressed'), 'true');
      assert.ok((await page.locator('#part-title').innerText()).trim());
    }
    await page.locator('summary').click();
    await selectPart('right_front_door'); await screenshot('right-side');
    await selectPart('rear_bumper'); await screenshot('rear');
    await selectPart('front_bumper'); await screenshot('front');
    pass('All 23 profile-correct part selectors update 3D selection and evidence; right, rear and front views render');

    await selectPart('left_front_door');
    await page.locator('[data-action=home]').click();
    const beforeDrag = await canvasPixels();
    const bounds = await page.locator('.scene-host canvas').boundingBox();
    const selectedBeforeDrag = await page.locator('.scene').getAttribute('data-selected');
    await page.mouse.move(bounds.x + bounds.width * .68, bounds.y + bounds.height * .58);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * .35, bounds.y + bounds.height * .5, { steps: 12 });
    await page.mouse.up();
    const afterDrag = await canvasPixels();
    metrics.dragChangedPixels = changedPixels(beforeDrag, afterDrag);
    assert.ok(metrics.dragChangedPixels > 1000, 'Pointer drag rotates rendered geometry');
    assert.equal(await page.locator('.scene').getAttribute('data-selected'), selectedBeforeDrag, 'Dragging must not accidentally select another part');
    pass('Pointer dragging changes the actual camera view without generating an accidental part click');

    await page.locator('[data-action=home]').click();
    const beforeGhost = await canvasPixels();
    await page.locator('[data-action=ghost]').click();
    assert.equal(await page.locator('[data-action=ghost]').getAttribute('aria-pressed'), 'true');
    const ghost = await canvasPixels();
    metrics.ghostChangedPixels = changedPixels(beforeGhost, ghost);
    assert.ok(metrics.ghostChangedPixels > 500, 'Ghost mode visibly changes opacity');
    await page.locator('[data-action=home]').click();
    assert.equal(await page.locator('[data-action=ghost]').getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('.scene').getAttribute('data-mode'), 'assembled');
    assert.ok(redPixels(await canvasPixels()) > 1000, 'Home restores the visible photographed body');
    pass('Ghost opacity changes rendered surfaces and home restores the assembled photographic body');

    await page.locator('[data-action=rotate]').click();
    const reducedA = await canvasPixels();
    await page.waitForTimeout(550);
    const reducedB = await canvasPixels();
    metrics.reducedMotionChangedPixels = changedPixels(reducedA, reducedB);
    assert.ok(metrics.reducedMotionChangedPixels < 100, 'Reduced-motion preference prevents automatic camera animation');
    await page.locator('[data-action=home]').click();
    pass('Reduced-motion preference keeps the 3D camera stationary when automatic rotation is requested');

    await page.setViewportSize({ width: 390, height: 844 });
    await noOverflow(); await screenshot('mobile-assembled');
    assert.ok(redPixels(await canvasPixels()) > 200, 'Mobile assembled vehicle is visibly rendered');
    await page.locator('[data-action=mode][data-mode=exploded]').click();
    await noOverflow(); await screenshot('mobile-exploded');
    await page.locator('[data-action=mode][data-mode=isolate]').click();
    await noOverflow(); await screenshot('mobile-isolated');
    assert.ok(redPixels(await canvasPixels()) > 200, 'Mobile isolated door remains visible');
    await page.locator('summary').click(); await noOverflow(); await page.locator('summary').click();
    pass('390px assembled, exploded and isolated photo-textured views remain visible without horizontal overflow');

    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto(url + '?view=cutout');
    await page.locator('.photographic-svg').waitFor();
    assert.equal(await page.locator('.scene').getAttribute('data-view'), 'cutout');
    assert.equal(await page.locator('.scene-host canvas').count(), 0);
    await page.locator('[data-action=view][data-view=model]').click(); await ready();
    await page.locator('[data-action=view][data-view=photo]').click();
    await page.waitForFunction(() => document.querySelector('#photo-stage img')?.naturalWidth === 1072);
    pass('Explicit cutout route preserves photographic layers and switches to the new 3D and original-photo views');

    referenceRequests.length = 0;
    await page.goto(url + '#rapor=' + token);
    await page.locator('#part-title').waitFor();
    assert.equal(await page.locator('.scene').getAttribute('data-view'), 'photo');
    assert.equal(await page.locator('.scene-host canvas').count(), 0);
    assert.equal(await page.locator('[data-action=view][data-view=cutout]').isDisabled(), true);
    assert.match(await page.locator('.vehicle-label').innerText(), /TEST MARKA/);
    assert.ok((await page.locator('#photo-stage img').getAttribute('src')).startsWith(apiOrigin));
    await page.locator('[data-action=view][data-view=model]').click();
    await page.locator('.scene-host canvas').waitFor(); await settle();
    assert.notEqual(await page.locator('.scene-host').getAttribute('data-photo-texture-state'), 'ready');
    assert.match(await page.locator('#studio-source').innerText(), /temsili bir model/);
    assert.deepEqual(referenceRequests, [], 'Actual report must never request reference vehicle photographs');
    assert.deepEqual(await page.evaluate(() => window.__qaPhotoTextureUploads), [], 'Actual report never uploads reference vehicle photographs to WebGL');
    assert.doesNotMatch(await page.locator('body').innerText(), /Opel ADAM|ÖRNEK SUNUM/);
    await screenshot('approved-generic');
    pass('Approved customer report uses its signed photo and generic geometry without loading reference car textures');

    const failureContext = await browser.newContext({ viewport: { width: 1440, height: 1080 }, reducedMotion: 'reduce' });
    const failurePage = await failureContext.newPage(), failureErrors = [];
    failurePage.on('pageerror', e => failureErrors.push(e.message));
    await failureContext.route('**/real-car/frame-19.jpg', route => route.abort('failed'));
    try {
      await failurePage.goto(url);
      await failurePage.locator('#part-title').waitFor();
      await failurePage.waitForFunction(() => document.querySelector('.scene-host')?.dataset.photoTextureState === 'error' || Boolean(document.querySelector('.scene-fallback')));
      assert.notEqual(await failurePage.locator('.scene-host').getAttribute('data-photo-texture-state'), 'ready');
      assert.match(await failurePage.locator('.scene').innerText(), /Özgün fotoğraf dokuları yüklenemedi/);
      assert.equal(await failurePage.locator('.scene-host canvas').count(), 0, 'Failed texture model is disposed instead of displaying an incomplete photo claim');
      assert.equal(await failurePage.locator('.part-chip').count(), 23);
      assert.deepEqual(failureErrors, []);
      await failurePage.screenshot({ path: path.join(out, prefix + 'texture-failure.png'), fullPage: true });
      pass('A failed original-photo texture cannot leave the model marked ready; findings remain reachable');
    } finally { await failureContext.close(); }

    assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(unexpected, []);
    pass('No runtime errors, unexpected console errors or unapproved external requests in successful flows');
    fs.writeFileSync(path.join(out, prefix + 'ui-result.json'), JSON.stringify({ passed: checks.length, checks, errors, consoleErrors, unexpected, apiCalls, metrics, live }, null, 2));
  } catch (error) {
    await screenshot('failure').catch(() => {});
    console.error('UI diagnostic:', (await page.locator('body').innerText()).slice(0, 2400));
    console.error('Browser errors:', errors, consoleErrors);
    throw error;
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); server?.close(); process.exitCode = 1; });
