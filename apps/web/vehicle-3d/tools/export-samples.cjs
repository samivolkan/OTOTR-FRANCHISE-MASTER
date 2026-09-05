const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1080},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4317/?generateSamples=1',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.ototrSampleAssets,{timeout:30000});
    const assets=await page.evaluate(()=>window.ototrSampleAssets);
    const out=path.resolve(__dirname,'../public/sample-renders');await fs.mkdir(out,{recursive:true});
    for(const [id,url] of Object.entries(assets.thumbnails))await fs.writeFile(path.join(out,`${id}.jpg`),Buffer.from(url.split(',')[1],'base64'));
    await fs.mkdir(path.resolve(__dirname,'../.local'),{recursive:true});
    await page.screenshot({path:path.resolve(__dirname,'../.local/studio-desktop.png'),fullPage:true});
    await fs.writeFile(path.join(out,'ORIGIN.json'),JSON.stringify({type:'synthetic-render',model:'ototr-procedural-sedan-v1',photosOfRealVehicle:false,reconstructedFromPhotos:false,count:Object.keys(assets.thumbnails).length},null,2));
    const modelDownload=page.waitForEvent('download');await page.locator('#export-model').click();const model=await modelDownload;await model.saveAs(path.resolve(__dirname,'../public/ototr-semantik-sedan.glb'));
    console.log(JSON.stringify({sampleCount:Object.keys(assets.thumbnails).length,errors}));
    if(errors.length)process.exitCode=1;
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
