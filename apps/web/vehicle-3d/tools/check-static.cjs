const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1080}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
    await page.locator('#car-host canvas').waitFor();
    const rect=await page.locator('#car-host canvas').boundingBox(),picks=new Set();
    for(const [x,y]of [[.38,.53],[.5,.45],[.62,.52],[.58,.66],[.68,.60]]){
      await page.mouse.click(rect.x+rect.width*x,rect.y+rect.height*y);picks.add(await page.locator('#part-detail h2').textContent());
    }
    await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.filter(i=>i.offsetParent).map(i=>i.decode().catch(()=>{}))));
    const bad=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.offsetParent&&!i.naturalWidth).length);
    const fonts=await page.evaluate(()=>document.fonts.check('500 16px Manrope')&&document.fonts.check('400 16px "DM Sans"'));
    if(errors.length||bad||picks.size<2||!fonts)throw Error(JSON.stringify({errors,bad,picks:[...picks],fonts}));
    await page.locator('[data-part=left_front_door]').click();await page.locator('#reset-view').click();
    await page.screenshot({path:path.resolve(__dirname,'../.local/studio-preview.png'),fullPage:false});
    console.log(JSON.stringify({productionPreview:'ok',pickedParts:[...picks],brokenVisibleImages:bad,localFonts:fonts,errors}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
