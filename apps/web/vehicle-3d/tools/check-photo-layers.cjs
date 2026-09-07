const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const app=path.resolve(__dirname,'..'),dist=path.join(app,'dist-erp'),out=path.join(app,'.local');
const live=process.argv.includes('--live'),localOrigin='http://127.0.0.1:4334';
const url=live?'https://samivolkan.github.io/Ototr/kaporta-360/sunum.html':localOrigin+'/kaporta-360/sunum.html';
const origin=new URL(url).origin,apiOrigin='https://photolayersqa.supabase.co',token='b'.repeat(64);
const counts={1:5,4:8,7:8,10:9,13:3,16:9,19:8,22:9};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.json':'application/json','.ttf':'font/ttf','.woff2':'font/woff2'};
fs.mkdirSync(out,{recursive:true});
const server=live?null:http.createServer((req,res)=>{
 const pathname=new URL(req.url,localOrigin).pathname;
 if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
 const relative=decodeURIComponent(pathname.replace(/^\/kaporta-360\//,'/'));
 const file=path.resolve(dist,'.'+relative);
 if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
function fixture(){return {customerView:true,reportId:'QA-PHOTO-LAYERS',approvedAt:'2026-09-08T12:00:00Z',approvedBy:'QA uzmanı',job:{plate:'QA 360',brand:'TEST MARKA',model:'Test araç',work_order_no:'QA-ONLY'},session:{status:'approved',profile:'hatchback3',photo_slots:{'ring-22':'qa-photo'},findings:{left_front_door:{outcome:'inspected',process:'painted',defects:['scratch'],measurements:[215,224,229],note:'QA onaylı kayıt',evidenceIds:['qa-photo'],annotations:[]}}},photos:[{id:'qa-photo',slot:'ring-22',kind:'ring',url:apiOrigin+'/storage/v1/object/sign/kaporta-360/qa/frame-22.jpg?token=qa-only'}]};}
(async()=>{
 const {PHOTO_MASKS}=await import('../src/photo-mask-domain.js');
 if(server)await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4334,'127.0.0.1',resolve);});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1080},deviceScaleFactor:1,reducedMotion:'reduce'});
 const page=await context.newPage(),checks=[],errors=[],consoleErrors=[],unexpected=[];
 let apiCalls=0,revoked=false,expectedDenied=false;
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('console',m=>{if(m.type()==='error'&&!(expectedDenied&&m.text().includes('404')))consoleErrors.push(m.text());});
 page.on('request',r=>{const u=new URL(r.url());if(['http:','https:'].includes(u.protocol)&&u.origin!==origin&&u.origin!==apiOrigin)unexpected.push(r.url());});
 await context.route('**/runtime-config.json',route=>route.fulfill({json:{url:apiOrigin,publishableKey:'qa-public-key'}}));
 await context.route(apiOrigin+'/**',async route=>{
  const request=route.request(),u=new URL(request.url());
  if(u.pathname.endsWith('/kaporta-360-report')){apiCalls++;assert.equal(request.method(),'POST');assert.equal(request.postDataJSON().token,token);return revoked?route.fulfill({status:404,json:{message:'Test paylaşımı kapalı.'}}):route.fulfill({json:fixture()});}
  if(u.pathname.endsWith('/frame-22.jpg'))return route.fulfill({path:path.join(app,'public/real-car/frame-22.jpg'),contentType:'image/jpeg'});
  unexpected.push(request.url());return route.abort();
 });
 const pass=name=>{checks.push(name);console.log('PASS '+name);};
 const screenshot=async name=>page.screenshot({path:path.join(out,'photo-layers-'+(live?'live-':'')+name+'.png'),fullPage:true});
 const ready=async()=>{await page.locator('#part-title').waitFor();await page.waitForFunction(()=>!document.querySelector('.scene')?.classList.contains('loading'));};
 const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Horizontal page overflow');
 const group=id=>page.locator('[data-photo-part='+id+']');
 const selectByPhoto=async id=>{
  const frame=Number(await page.locator('.photo-layer-host').getAttribute('data-photo-frame'));
  const p=PHOTO_MASKS[frame].parts.find(p=>p.id===id);assert.ok(p,'Part visible in prepared frame');
  const point=await group(id).locator('path').evaluate((node,anchor)=>{const p=new DOMPoint(...anchor).matrixTransform(node.getScreenCTM());return{x:p.x,y:p.y};},p.anchor);
  await page.mouse.click(point.x,point.y);
 };
 try{
  await page.goto(url);await ready();
  assert.equal(await page.locator('.scene').getAttribute('data-view'),'cutout');assert.equal(await page.locator('.scene-host canvas').count(),0);
  assert.equal(await page.locator('.photographic-svg').count(),1);assert.equal(await page.locator('.photo-layer-host').getAttribute('data-photo-frame'),'22');assert.equal(await page.locator('[data-photo-part]').count(),9);assert.equal(apiCalls,0);
  const hrefs=await page.locator('.photographic-svg image').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));assert.equal(hrefs.length,10);assert.ok(hrefs.every(h=>h==='./real-car/frame-22.jpg'));
  await page.waitForFunction(()=>document.querySelector('.evidence-media img')?.naturalWidth>0);await noOverflow();await screenshot('desktop');pass('Default uses nine original-photo panels from frame 22, without WebGL or API requests');

  await selectByPhoto('hood');assert.equal(await page.locator('.scene').getAttribute('data-selected'),'hood');
  await selectByPhoto('left_front_door');assert.equal(await page.locator('#part-title').innerText(),'Sol kapı');assert.equal(await group('left_front_door').getAttribute('aria-pressed'),'true');assert.match(await page.locator('.expert-note').innerText(),/Temsili senaryo/);pass('Clicking real photographic hood and door surfaces updates the selected finding');

  await page.locator('[data-action=mode][data-mode=assembled]').click();const assembled=await group('left_front_door').evaluate(node=>getComputedStyle(node).transform);assert.equal(assembled,'matrix(1, 0, 0, 1, 0, 0)');assert.equal(await page.locator('.photographic-svg > image').getAttribute('mask'),null,'Assembled context is the complete original photograph');assert.equal(await page.locator('[data-photo-part] > image').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='0')),true,'Assembled panel pixels are hidden to avoid mask-edge seams');await screenshot('assembled');
  await page.locator('[data-action=mode][data-mode=exploded]').click();const exploded=await group('left_front_door').evaluate(node=>getComputedStyle(node).transform);assert.notEqual(exploded,assembled);
  await page.locator('[data-action=mode][data-mode=isolate]').click();const isolated=await group('left_front_door').evaluate(node=>getComputedStyle(node).transform);assert.notEqual(isolated,exploded);assert.equal(await group('hood').evaluate(node=>getComputedStyle(node).opacity),'0.08');assert.equal(await group('hood').getAttribute('tabindex'),'-1');await screenshot('isolated');pass('Assembly restores identity transform; explosion moves source pixels; isolation enlarges one part and disables hidden picking');

  await page.locator('#separation').fill('0');const zero=await group('hood').evaluate(node=>getComputedStyle(node).transform);assert.equal(zero,'matrix(1, 0, 0, 1, 0, 0)');assert.equal(await page.locator('[data-photo-part]').evaluateAll(nodes=>nodes.every(n=>new DOMMatrix(getComputedStyle(n).transform).isIdentity)),true,'Zero separation restores every panel including the selected one');assert.equal(await page.locator('.photographic-svg > image').getAttribute('mask'),null,'Zero separation shows the complete original photograph');assert.equal(await page.locator('[data-photo-part] > image').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='0')),true);await screenshot('zero-separation');await page.locator('#separation').fill('100');assert.notEqual(await group('hood').evaluate(node=>getComputedStyle(node).transform),zero);await page.locator('#separation').fill('72');pass('Zero separation restores the unmasked original photo and identity transforms for every part; full distance separates them');

  for(const [frame,count]of Object.entries(counts)){
   await page.locator('[data-action=photo-angle][data-frame="'+frame+'"]').click();assert.equal(await page.locator('.photo-layer-host').getAttribute('data-photo-frame'),frame);assert.equal(await page.locator('[data-photo-part]').count(),count);
   assert.ok((await page.locator('.photographic-svg image').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')))).every(h=>h==='./real-car/frame-'+frame.padStart(2,'0')+'.jpg'));
   assert.equal(await page.locator('[data-action=photo-angle][data-frame="'+frame+'"]').getAttribute('aria-pressed'),'true');await screenshot('angle-'+frame.padStart(2,'0'));
  }
  pass('All eight prepared angles use their exact source photograph and expected visible panel counts');

  await group('hood').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.scene').getAttribute('data-selected'),'hood');assert.equal(await page.locator('[data-action=tour]').getAttribute('aria-pressed'),'false');
  await group('left_front_door').focus();await page.keyboard.press('Space');assert.equal(await page.locator('.scene').getAttribute('data-selected'),'left_front_door');assert.equal(await page.locator('[data-action=tour]').getAttribute('aria-pressed'),'false');pass('SVG panel Enter and Space select the surface without accidentally starting a tour');

  await page.locator('[data-action=tour]').click();assert.equal(await page.locator('[data-action=tour]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.scene').getAttribute('data-selected'),'left_front_fender');
  await page.waitForFunction(()=>document.querySelector('.scene')?.dataset.selected==='rear_bumper',null,{timeout:11000});assert.equal(await page.locator('.scene').getAttribute('data-view'),'cutout');assert.ok(await group('rear_bumper').count());await page.locator('[data-action=tour]').click();assert.equal(await page.locator('[data-action=tour]').getAttribute('aria-pressed'),'false');pass('Guided findings move from front fender to a real photographic rear-bumper angle and pause');

  await page.locator('[data-action=ghost]').click();assert.equal(await page.locator('.photographic-svg > image').evaluate(n=>getComputedStyle(n).opacity),'0.3');await page.locator('[data-action=home]').click();assert.equal(await page.locator('.photo-layer-host').getAttribute('data-photo-mode'),'assembled');assert.equal(await page.locator('.photographic-svg > image').evaluate(n=>getComputedStyle(n).opacity),'1');assert.equal(await page.locator('[data-action=ghost]').getAttribute('aria-pressed'),'false');pass('Ghost context and reset change photograph opacity and restore assembled view');

  await page.locator('[data-action=view][data-view=photo]').click();const photos=[];
  for(let f=1;f<=24;f++){await page.locator('#photo-frame').fill(String(f));await page.waitForFunction(()=>document.querySelector('#photo-stage img')?.naturalWidth===1072);photos.push(await page.locator('#photo-stage img').getAttribute('src'));assert.equal(await page.locator('#frame-count').innerText(),String(f).padStart(2,'0')+' / 24');}
  assert.equal(new Set(photos).size,24);assert.ok(photos.every((p,i)=>p==='./real-car/frame-'+String(i+1).padStart(2,'0')+'.jpg'));pass('All 24 original photographs remain available unchanged in the photo viewer');

  await page.locator('[data-action=view][data-view=model]').click();assert.equal(await page.locator('.scene-host canvas').count(),1);await page.locator('[data-action=mode][data-mode=exploded]').click();assert.equal(await page.locator('.scene').getAttribute('data-mode'),'exploded');await page.locator('[data-action=view][data-view=cutout]').click();assert.equal(await page.locator('.scene').getAttribute('data-view'),'cutout');assert.equal(await page.locator('.photo-layer-host').isVisible(),true);pass('Explicit 3D schematic view still renders and switching back restores photographic layers');

  await page.setViewportSize({width:390,height:844});await page.locator('[data-action=photo-angle][data-frame="22"]').click();await noOverflow();await screenshot('mobile');await page.locator('[data-action=mode][data-mode=isolate]').click();await noOverflow();await screenshot('mobile-isolated');await page.locator('summary').click();await noOverflow();await page.locator('summary').click();pass('390px photo layers, isolation and all-parts drawer stay within the viewport');

  await page.setViewportSize({width:1440,height:1080});await page.goto(url+'#rapor='+token);await ready();assert.equal(await page.locator('.scene').getAttribute('data-view'),'photo');assert.equal(await page.locator('.photographic-svg,[data-photo-part],canvas').count(),0);assert.equal(await page.locator('[data-action=view][data-view=cutout]').isDisabled(),true);assert.ok((await page.locator('#photo-stage img').getAttribute('src')).startsWith(apiOrigin));assert.match(await page.locator('.vehicle-label').innerText(),/TEST MARKA/);assert.doesNotMatch(await page.locator('body').innerText(),/Opel ADAM|ÖRNEK SUNUM/);await screenshot('approved');pass('Approved customer defaults to original signed photo; reference cutouts and sample vehicle never appear');

  await page.locator('[data-action=view][data-view=model]').click();assert.equal(await page.locator('.scene-host canvas').count(),1);assert.equal(await page.locator('.photographic-svg,[data-photo-part]').count(),0);assert.match(await page.locator('#studio-source').innerText(),/temsili bir model/);await page.locator('[data-action=zoom-photo]').click();await page.locator('dialog[open]').waitFor();revoked=true;expectedDenied=true;await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await page.locator('.closed-screen').waitFor();assert.equal(await page.locator('.experience,canvas,dialog,img,.photographic-svg,[data-photo-part]').count(),0);assert.doesNotMatch(await page.locator('body').innerText(),/QA 360|TEST MARKA|QA onaylı kayıt/);pass('Revoked approved report clears signed photos, open evidence, model and report text');

  const beforeInvalid=apiCalls;await page.goto(url+'#rapor=invalid');await page.locator('.closed-screen').waitFor();assert.equal(apiCalls,beforeInvalid);assert.equal(await page.locator('.experience,img,canvas,.photographic-svg,[data-photo-part]').count(),0);assert.doesNotMatch(await page.locator('body').innerText(),/Opel ADAM|ÖRNEK SUNUM/);pass('Invalid token cannot load a report or substitute the photographic demo');

  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(unexpected,[]);pass('No runtime errors, unexpected console errors or unapproved external requests');
  fs.writeFileSync(path.join(out,'photo-layers-'+(live?'live-':'')+'ui-result.json'),JSON.stringify({passed:checks.length,checks,errors,consoleErrors,unexpected,apiCalls,live},null,2));
 }catch(error){await screenshot('failure').catch(()=>{});console.error('UI diagnostic:',(await page.locator('body').innerText()).slice(0,2200));console.error('Browser errors:',errors,consoleErrors);throw error;}
 finally{await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server?.close();process.exitCode=1;});
