const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const sharp=require('sharp');
(async()=>{
  const base='https://cdn.webrotate360.com/sites/webrotate360/images/webrotate360/views/sfcar/';
  const xmlURL='https://www.webrotate360.com/images/webrotate360/views/sfcar/sfcar.xml';
  const response=await fetch(xmlURL);if(!response.ok)throw new Error(`Source manifest: ${response.status}`);
  const xml=await response.text();const names=[...xml.matchAll(/<image src="([^"]+)"/g)].map(m=>m[1]);
  if(names.length!==24)throw new Error('Expected a verified 24-photo source sequence.');
  const out=path.resolve(__dirname,'../public/real-car');await fs.mkdir(out,{recursive:true});
  const frames=[];
  for(let start=0;start<24;start+=4){
    const batch=await Promise.all(names.slice(start,start+4).map(async(name,j)=>{
      const index=start+j+1,url=new URL(name,base).href;const r=await fetch(url);if(!r.ok)throw new Error(`Frame ${index}: ${r.status}`);
      const bytes=Buffer.from(await r.arrayBuffer());const meta=await sharp(bytes).metadata();
      if(meta.width<800||meta.height<400)throw new Error(`Frame ${index}: insufficient source resolution`);
      const file=`frame-${String(index).padStart(2,'0')}.jpg`;await fs.writeFile(path.join(out,file),bytes);
      return {index,file,sourceURL:url,width:meta.width,height:meta.height,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
    }));frames.push(...batch);
  }
  if(new Set(frames.map(f=>f.sha256)).size!==24)throw new Error('Duplicate source frames found.');
  await fs.writeFile(path.join(out,'source.json'),JSON.stringify({vehicle:'Opel ADAM',kind:'photographic-spin',count:24,sourcePage:'https://www.webrotate360.com/examples/browse-all-examples/360-car-photography.aspx',manifestURL:xmlURL,photographyCredit:'SpinFrame',showcaseCredit:'WebRotate 360',sourceStatement:'Photographed as a single row of 24 JPG images.',commercialReusePermissionVerified:false,usageNote:'Third-party showcase photography referenced in this local alternative prototype. Not an Ototr inspection or an Ototr-owned/licensed production asset.',downloadedAt:new Date().toISOString(),frames},null,2));
  const cells=await Promise.all(frames.map(async f=>({input:await sharp(path.join(out,f.file)).resize(300,180,{fit:'contain',background:'#ffffff'}).extend({top:0,bottom:25,left:0,right:0,background:'#f2f4f6'}).composite([{input:Buffer.from(`<svg width="300" height="25"><text x="12" y="18" font-size="14" font-family="Arial" fill="#333">FRAME ${f.index}</text></svg>`),top:180,left:0}]).png().toBuffer(),left:((f.index-1)%4)*300,top:Math.floor((f.index-1)/4)*205})));
  await fs.mkdir(path.resolve(__dirname,'../.local'),{recursive:true});await sharp({create:{width:1200,height:1230,channels:3,background:'#fff'}}).composite(cells).png().toFile(path.resolve(__dirname,'../.local/real-car-contact-sheet.png'));
  console.log(JSON.stringify({downloaded:frames.length,unique:new Set(frames.map(f=>f.sha256)).size,resolution:`${frames[0].width}x${frames[0].height}`,source:'SpinFrame / WebRotate 360',commercialReusePermissionVerified:false}));
})().catch(e=>{console.error(e);process.exitCode=1;});
