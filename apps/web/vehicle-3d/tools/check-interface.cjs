const {chromium}=require('playwright');
const sharp=require('sharp');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const results=[],errors=[],outside=[];
  const check=(name,condition)=>{assert.ok(condition,name);results.push(name);};
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4317/')&&!r.url().startsWith('data:'))outside.push(r.url());});
    await page.goto('http://127.0.0.1:4317/',{waitUntil:'networkidle'});
    await page.locator('#car-host canvas').waitFor();
    check('WebGL renderer loaded',await page.locator('#car-host canvas').count()===1);
    check('25 accessible part selectors',await page.locator('[data-part]').count()===25);
    await page.locator('[data-part=hood]').click();check('part list updates detail',await page.locator('#part-detail h2').textContent()==='Motor kaputu');
    await page.locator('#edit-part').click();await page.locator('#edit-status').selectOption('local');await page.locator('#edit-measurements').fill('121, 159, 119');await page.locator('#edit-note').fill('Kontrol testi: <img src=x onerror=alert(1)>');await page.locator('#edit-form button[type=submit]').click();
    await page.locator('#edit-dialog').waitFor({state:'hidden'});check('finding updated',await page.locator('#part-detail .status-chip').textContent()==='Lokal boyalı');
    check('notes render as text',await page.locator('.expert-note p img').count()===0);
    await page.reload({waitUntil:'networkidle'});await page.locator('[data-part=hood]').click();check('finding survives reload',await page.locator('.expert-note p').textContent()==='Kontrol testi: <img src=x onerror=alert(1)>');
    await page.locator('#customer-toggle').click();check('customer view hides edit',await page.locator('#edit-part').isHidden());await page.locator('#exit-customer').click();
    await page.locator('#rotate-toggle').click();check('rotation toggle',await page.locator('#rotate-toggle').getAttribute('aria-pressed')==='true');await page.locator('#rotate-toggle').click();
    await page.locator('#explode-toggle').click();check('exploded view toggle',await page.locator('#explode-toggle').getAttribute('aria-pressed')==='true');await page.locator('#explode-toggle').click();
    await page.locator('#plain-view').click();check('natural view toggle',await page.locator('#plain-view').getAttribute('aria-pressed')==='true');await page.locator('#color-view').click();
    await page.locator('.rail-nav [data-page=capture]').click();
    check('renders do not count as real photos',await page.locator('#capture-total').textContent()==='0');
    check('24 required positions',await page.locator('[data-shot]').count()===24);
    await page.locator('#new-capture').click();await page.locator('#confirm-new').click();await page.locator('#new-dialog').waitFor({state:'hidden'});
    check('fresh capture has no completed photos',await page.locator('.shot-tile.complete').count()===0);
    const fixture=await sharp({create:{width:1600,height:900,channels:3,background:'#779aaa'}}).png().toBuffer();
    await page.locator('#photo-upload').setInputFiles({name:'test-fixture.png',mimeType:'image/png',buffer:fixture});
    await page.waitForFunction(()=>document.querySelector('#capture-total').textContent==='1');
    check('valid photo upload succeeds',await page.locator('.shot-tile.complete').count()===1);
    await page.locator('#next-shot').click();await page.locator('#photo-upload').setInputFiles({name:'same-fixture.png',mimeType:'image/png',buffer:fixture});
    await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('zaten var'));check('duplicate photo blocked',await page.locator('#capture-total').textContent()==='1');
    const small=await sharp({create:{width:100,height:100,channels:3,background:'#bbaaaa'}}).png().toBuffer();
    await page.locator('#photo-upload').setInputFiles({name:'small.png',mimeType:'image/png',buffer:small});await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('720'));check('low resolution blocked',await page.locator('#capture-total').textContent()==='1');
    await page.reload({waitUntil:'networkidle'});await page.locator('.rail-nav [data-page=capture]').click();check('photo survives reload',await page.locator('#capture-total').textContent()==='1');
    const downloadPromise=page.waitForEvent('download');await page.locator('#export-report').click();const download=await downloadPromise;check('JSON report downloads',download.suggestedFilename()==='ototr-3d-rapor-taslagi.json');
    await page.locator('.rail-nav [data-page=plan]').click();check('equipment plan opens',await page.locator('.equipment-grid article').count()===4);
    check('no external network requests',outside.length===0);
    const mobileContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:4317/',{waitUntil:'networkidle'});
    for(const tab of ['report','capture','plan']){
      await mobile.locator(`.rail-nav [data-page=${tab}]`).click();
      check(`mobile ${tab} fits viewport`,await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await fs.mkdir(path.resolve(__dirname,'../.local'),{recursive:true});await mobile.screenshot({path:path.resolve(__dirname,`../.local/mobile-${tab}.png`),fullPage:true});
    }
    check('no browser runtime errors',errors.length===0);
    await fs.writeFile(path.resolve(__dirname,'../.local/interface-results.json'),JSON.stringify({results,errors,outside},null,2));
    console.log(JSON.stringify({passed:results.length,results,errors,outside},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
