const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
  const url='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Manrope:wght@400;500;600;650;700;750;800&display=swap';
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});if(!response.ok)throw new Error('Font CSS request failed');
  let css=await response.text();const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
  const dir=path.resolve(__dirname,'../public/fonts');await fs.mkdir(dir,{recursive:true});
  for(let i=0;i<urls.length;i++){const r=await fetch(urls[i]);if(!r.ok)throw new Error('Font download failed');const name=`font-${i}.ttf`;await fs.writeFile(path.join(dir,name),Buffer.from(await r.arrayBuffer()));css=css.split(urls[i]).join(`./${name}`);}
  await fs.writeFile(path.join(dir,'fonts.css'),css);console.log(`Bundled ${urls.length} font files; no runtime font requests required.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
