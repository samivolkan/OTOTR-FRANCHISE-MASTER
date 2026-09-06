const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const root=path.resolve(__dirname,'../.local/erp-publish');
const live=process.argv.includes('--live');
const url=live?'https://samivolkan.github.io/Ototr/':'http://127.0.0.1:4320/Ototr/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
async function main(){
 let server;
 if(!live){
  server=http.createServer(async(req,res)=>{
   try{
    const pathname=decodeURIComponent(new URL(req.url,url).pathname);
    const relative=pathname.replace(/^\/Ototr\//,'');
    const file=path.resolve(root,relative.endsWith('/')?relative+'index.html':relative||'index.html');
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isFile()){res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);return;}
    // Serve unchanged, public ERP dependencies from the existing publication.
    const remote=await fetch('https://samivolkan.github.io/Ototr/'+relative);res.writeHead(remote.status,{'Content-Type':remote.headers.get('content-type')||'application/octet-stream'});res.end(Buffer.from(await remote.arrayBuffer()));
   }catch{res.writeHead(502);res.end();}
  });
  await new Promise(resolve=>server.listen(4320,'127.0.0.1',resolve));
 }
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const checks=[],errors=[],failedModuleRequests=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(url,{waitUntil:'domcontentloaded'});
  const menu=page.locator('#nav [data-nav-route="kaporta-360"]');await menu.waitFor({timeout:30000});assert.equal(await menu.textContent(),'Kaporta 360');
  const popupReady=page.waitForEvent('popup');await menu.click();const spin=await popupReady;
  spin.on('pageerror',e=>errors.push(e.message));spin.on('response',r=>{if(r.status()>=400&&r.url().includes('/kaporta-360/'))failedModuleRequests.push({url:r.url(),status:r.status()});});
  await spin.waitForLoadState('networkidle');
  assert.equal(new URL(spin.url()).pathname,'/Ototr/kaporta-360/pilot.html');await spin.getByRole('heading',{name:'Ekspertize devam edin'}).waitFor();checks.push('ERP menu opens authenticated Kaporta 360 pilot');
  await spin.getByRole('link',{name:'24 gerçek fotoğraflı örneği incele'}).click();await spin.waitForLoadState('networkidle');assert.equal(await spin.title(),'Kaporta 360 | OTOTR ERP');checks.push('Personnel entry links to clearly labelled photographic demo');
  assert.equal(await spin.locator('#frame-slider').isEnabled(),true);assert.match(await spin.locator('#frame-loaded').textContent(),/24 \/ 24 hazır/);
  assert.equal(await spin.locator('[data-real-part]').count(),23);checks.push('24 photographs and 23 parts ready');
  await spin.locator('#all-photos').click();assert.equal(await spin.locator('#gallery-grid img').evaluateAll(xs=>xs.filter(x=>x.complete&&x.naturalWidth===1072).length),24);
  await spin.locator('[data-gallery-frame="13"]').click();assert.equal(await spin.locator('#frame-current').textContent(),'13');
  await spin.locator('#next-frame').click();assert.equal(await spin.locator('#frame-current').textContent(),'14');checks.push('all 24 images decode and rotate');
  await spin.locator('[data-real-part="left_front_door"]').click();assert.equal(await spin.locator('#frame-current').textContent(),'22');checks.push('part selection points to correct image');
  assert.equal(await spin.locator('.r-demo').textContent(),'DEMO');assert.match(await spin.locator('.r-truth-note').textContent(),/tasarım örneğidir/);assert.match(await spin.locator('.r-footer small').textContent(),/ticari kullanım izni doğrulanmadı/);
  assert.equal(await spin.locator('a[href="./index.html"]').count(),0);assert.equal(await spin.locator('.r-header nav a[href="../index.html#dashboard"]').count(),1);assert.equal(await spin.locator('.r-header nav a[href="./pilot.html"]').count(),1);checks.push('ERP branding, pilot/return links and demo/source labels');
  await spin.evaluate(()=>scrollTo(0,0));await spin.screenshot({path:path.resolve(__dirname,live?'../.local/kaporta-360-live.png':'../.local/kaporta-360-erp-review.png')});
  await spin.setViewportSize({width:390,height:844});assert.equal(await spin.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks.push('390px mobile layout does not overflow');
  await spin.locator('.r-header nav a[href="../index.html#dashboard"]').click();await spin.locator('#nav [data-nav-route="kaporta-360"]').waitFor();assert.equal(new URL(spin.url()).hash,'#dashboard');checks.push('return to ERP dashboard');
  const fresh=await context.newPage();await fresh.goto(url+'kaporta-360/',{waitUntil:'networkidle'});assert.equal(await fresh.locator('#frame-slider').isEnabled(),true);checks.push('direct link opens independently');
  assert.deepEqual(errors,[]);assert.deepEqual(failedModuleRequests,[]);checks.push('no module runtime errors or failed asset responses');
  const result={mode:live?'live':'staged',url:url+'kaporta-360/',passed:checks.length,checks,errors,failedModuleRequests,time:new Date().toISOString()};fs.writeFileSync(path.resolve(__dirname,live?'../.local/kaporta-360-live-results.json':'../.local/kaporta-360-erp-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
