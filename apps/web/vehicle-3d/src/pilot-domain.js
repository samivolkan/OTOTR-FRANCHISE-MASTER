import {PARTS} from './domain.js';
export const PROFILES={hatchback3:'3 kapılı hatchback',sedan4:'4 kapılı sedan',hatchback5:'5 kapılı hatchback',suv5:'5 kapılı SUV'};
export const OUTCOMES={unchecked:'İncelenmedi',inspected:'İncelendi',inaccessible:'Görülemiyor',not_applicable:'Bu araçta yok'};
export const PROCESSES={none:'Sonuç girilmedi',original:'Orijinal',painted:'Boyalı',local:'Lokal boyalı',replaced:'Değişen',removed:'Sök-tak',repaired:'Onarım izli'};
export const DEFECTS={scratch:'Çizik',dent:'Göçük',crack:'Çatlak',corrosion:'Korozyon',stone:'Taş izi',wear:'Yüzey aşınması'};
export const PHASES={draft:'Çekim ve inceleme',review:'Teknik incelemede',approved:'Kaporta onaylı',returned:'Düzeltme istendi'};
const directions=['Ön','Sağ ön','Sağ yan','Sağ arka','Arka','Sol arka','Sol yan','Sol ön'];
export const SHOTS=[...Array.from({length:24},(_,i)=>({id:`ring-${String(i+1).padStart(2,'0')}`,name:`${directions[Math.floor(i/3)]} · ${i*15}°`,angle:i*15,kind:'ring',tip:'Araç sabit, kapılar kapalı. Aynı yükseklik ve mesafede tüm aracı kadraja alın.'})),...['Ön sağ üst','Arka sağ üst','Arka sol üst','Ön sol üst'].map((name,i)=>({id:`upper-${i+1}`,name,kind:'upper',angle:45+i*90,tip:'Tavan yüzeyini ve üst kenarları gösterin. Güvenli çekim konumunu koruyun.'}))];
export function partsFor(profile){if(!PROFILES[profile])throw Error('Geçerli bir parça düzeni seçin.');return PARTS.filter(p=>profile!=='hatchback3'||!['left_rear_door','right_rear_door'].includes(p.id)).map(p=>({...p,name:profile==='hatchback3'?p.name.replace('ön kapı','kapı'):p.name}));}
export function emptyFinding(){return{outcome:'unchecked',process:'none',defects:[],measurements:[],note:'',evidenceIds:[],annotations:[]};}
export function validateFinding(profile,id,input){
 const part=partsFor(profile).find(p=>p.id===id);if(!part)throw Error('Parça bu araç düzeninde bulunmuyor.');
 const f={...emptyFinding(),...input};
 if(!OUTCOMES[f.outcome]||!PROCESSES[f.process])throw Error('İnceleme ve işlem durumunu kontrol edin.');
 if(!Array.isArray(f.defects)||f.defects.some(d=>!DEFECTS[d]))throw Error('Geçersiz yüzey bulgusu.');
 f.defects=[...new Set(f.defects)];f.note=String(f.note||'').trim();if(f.note.length>2000)throw Error('Not 2000 karakteri aşamaz.');
 if(!Array.isArray(f.measurements)||f.measurements.length>12||f.measurements.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<=0||n>5000))throw Error('Ölçümler 0–5000 µm aralığında olmalı (0 hariç).');
 if(part.material!=='metal'&&f.measurements.length)throw Error('Bu yüzey için standart metal boya ölçümü girilemez.');
 if(f.outcome!=='inspected'&&(f.process!=='none'||f.defects.length||f.measurements.length))throw Error('İncelenmeyen parçaya işlem sonucu veya ölçüm atanamaz.');
 if(!Array.isArray(f.evidenceIds)||f.evidenceIds.length>20||f.evidenceIds.some(x=>typeof x!=='string'))throw Error('Kanıt seçimini kontrol edin.');
 if(!Array.isArray(f.annotations)||f.annotations.length>30||f.annotations.some(a=>!f.evidenceIds.includes(a.photoId)||![a.x,a.y,a.w,a.h].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1)||a.x+a.w>1.001||a.y+a.h>1.001))throw Error('İşaret, seçili kanıtın sınırları içinde olmalı.');
 return f;
}
export function reviewIssues(session,photos){
 const issues=[];const byId=new Map(photos.map(p=>[p.id,p]));
 for(const shot of SHOTS){if(!byId.has(session.photo_slots?.[shot.id]))issues.push({type:'photo',id:shot.id,message:`Eksik çekim: ${shot.name}`});}
 const active=Object.values(session.photo_slots||{}).map(id=>byId.get(id)).filter(Boolean);
 if(new Set(active.map(p=>p.sha256)).size!==active.length)issues.push({type:'photo',message:'Tekrarlanan fotoğraf var.'});
 for(const part of partsFor(session.profile)){
  const f=session.findings?.[part.id]||emptyFinding();
  if(f.outcome==='unchecked')issues.push({type:'part',id:part.id,message:`${part.name}: inceleme girilmedi.`});
  else if(f.outcome==='inspected'){
   if(f.process==='none')issues.push({type:'part',id:part.id,message:`${part.name}: işlem durumu eksik.`});
   if(part.material==='metal'&&f.measurements.length<3)issues.push({type:'part',id:part.id,message:`${part.name}: en az 3 ölçüm gerekli.`});
   if(f.process!=='original'||f.defects.length){if(f.note.trim().length<5||!f.evidenceIds.some(id=>byId.get(id)?.kind==='detail'))issues.push({type:'part',id:part.id,message:`${part.name}: bulgu açıklaması ve yakın plan gerekli.`});}
  }else if(f.note.length<5)issues.push({type:'part',id:part.id,message:`${part.name}: kapsam dışı/görülememe gerekçesi gerekli.`});
  if(f.evidenceIds.some(id=>!byId.has(id)))issues.push({type:'part',id:part.id,message:`${part.name}: kanıt bağlantısı geçersiz.`});
 }
 return issues;
}
export function parseMeasurements(text){if(!text.trim())return [];const tokens=text.trim().split(/[;,\s]+/);if(tokens.some(v=>!/^\d+(\.\d+)?$/.test(v)))throw Error('Ölçümleri 120, 128, 135 biçiminde girin.');return tokens.map(Number);}
export function photoSlotName(slot){return SHOTS.find(s=>s.id===slot)?.name||'Parça detayı';}
export function progress(session){return{photos:SHOTS.filter(s=>session.photo_slots?.[s.id]).length,parts:partsFor(session.profile).filter(p=>session.findings?.[p.id]?.outcome&&session.findings[p.id].outcome!=='unchecked').length,totalParts:partsFor(session.profile).length};}
