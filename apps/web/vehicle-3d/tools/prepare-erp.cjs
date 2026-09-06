const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),output=path.join(root,'dist-erp');
fs.renameSync(path.join(output,'kaporta-360.html'),path.join(output,'index.html'));
for(const dir of ['fonts','real-car'])fs.cpSync(path.join(root,'public',dir),path.join(output,dir),{recursive:true});
const config=JSON.parse(fs.readFileSync(path.join(root,'public/runtime-config.json'),'utf8'));
if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(config.url)||!config.publishableKey?.startsWith('sb_publishable_'))throw Error('Pilot için yalnız public publishable key yapılandırılmalı.');
fs.writeFileSync(path.join(output,'runtime-config.json'),JSON.stringify({url:config.url,publishableKey:config.publishableKey}));
const manifest=JSON.parse(fs.readFileSync(path.join(output,'real-car/source.json')));
for(const f of manifest.frames){
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(output,'real-car',f.file))).digest('hex');
  if(hash!==f.sha256)throw Error('Kaynak fotoğraf bütünlüğü: '+f.file);
}
manifest.usageNote='Third-party photographic reference in an OTOTR Kaporta 360 demonstration. Not an Ototr inspection, not an assertion of damage, and not an Ototr-owned/licensed production asset. Commercial reuse permission has not been verified.';
fs.writeFileSync(path.join(output,'real-car/source.json'),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(output,'SOURCE-NOTICE.txt'),'OTOTR Kaporta 360 — demonstration\nPhotography: SpinFrame / WebRotate 360\nSource: '+manifest.sourcePage+'\n24 real photographs; all inspection findings and measurements are fictional examples.\nCommercial reuse permission has not been verified. Use owned or explicitly licensed photos for production inspection reports.\nThis viewer is independently implemented; no reconstructed 3D geometry or automated damage detection.\nFonts: DM Sans and Manrope, SIL Open Font License; license files included.\n');
fs.writeFileSync(path.join(output,'release.json'),JSON.stringify({module:'kaporta-360',buildTime:new Date().toISOString(),frames:24,parts:23,mode:'demo-and-authenticated-pilot',demo:{entry:'index.html',inspectionDataIsFictional:true},pilot:{entry:'pilot.html',environment:'ototr-staging',authenticated:true,requiredAngles:28,finalERPApprovalRequired:true},geometryReconstructed:false},null,2));
console.log('ERP paketi hazır: dist-erp/ — gerçek fotoğraflı demo ve iş emrine bağlı personel pilotu.');
