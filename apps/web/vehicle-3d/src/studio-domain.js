import {partsFor, SHOTS, emptyFinding} from './pilot-domain.js';

export const STUDIO_VERSION = 1;
export const STUDIO_STEPS = ['setup','capture','mapping','story','preview','review'];
const clean = (v,n=600) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n) : '';
const finite = v => typeof v === 'number' && Number.isFinite(v);
const unit = v => finite(v) && v >= 0 && v <= 1;
const object = v => v && typeof v === 'object' && !Array.isArray(v);
export function emptyStudio(profile='hatchback3') {
  return {version:1,enabled:true,modelKey:'generic:'+profile,summary:'',equipment:'',checks:{},bindings:[],pins:[],tour:[]};
}
export function polygonArea(points) { return Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2; }
function cross(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);}
function intersects(a,b,c,d){
  const on=(p,q,r)=>Math.abs(cross(p,q,r))<1e-9&&r[0]>=Math.min(p[0],q[0])-1e-9&&r[0]<=Math.max(p[0],q[0])+1e-9&&r[1]>=Math.min(p[1],q[1])-1e-9&&r[1]<=Math.max(p[1],q[1])+1e-9;
  return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0 || on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);
}
export function validPolygon(points) {
  if(!Array.isArray(points)||points.length<3||points.length>40||points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(unit)))return false;
  if(polygonArea(points)<.0001)return false;
  for(let i=0;i<points.length;i++) {
    const b=(i+1)%points.length;
    if(Math.hypot(points[i][0]-points[b][0],points[i][1]-points[b][1])<.00001)return false;
    for(let j=i+1;j<points.length;j++) {const d=(j+1)%points.length;if(j===b||d===i)continue;if(intersects(points[i],points[b],points[j],points[d]))return false;}
  }
  return true;
}
export function validateStudio(input,session,photos,{demo=false,complete=false}={}) {
  if(!object(input)||input.version!==1||typeof input.enabled!=='boolean')throw Error('Sunum hazırlığı sürümü geçersiz.');
  if(JSON.stringify(input).length>180000)throw Error('Sunum hazırlığı boyut sınırını aşıyor.');
  const parts=partsFor(session.profile),ids=new Set(parts.map(p=>p.id)),byPhoto=new Map(photos.map(p=>[p.id,p]));
  const plan=emptyStudio(session.profile);plan.enabled=input.enabled;
  const allowed=['generic:'+session.profile,...(demo&&session.profile==='hatchback3'?['reference:adam']:[])];
  if(!allowed.includes(input.modelKey))throw Error('Bu araç için doğrulanmış model eşlemesi yok.');
  plan.modelKey=input.modelKey;plan.summary=clean(input.summary);plan.equipment=clean(input.equipment,240);
  if(!object(input.checks)||Object.keys(input.checks).length>150)throw Error('Çekim kontrolü geçersiz.');
  for(const [id,c] of Object.entries(input.checks)) {
    const photo=byPhoto.get(id);if(!photo||!object(c)||c.sha256!==photo.sha256)throw Error('Çekim kontrolü kaynak fotoğrafla eşleşmiyor.');
    if(['identity','angle','quality'].some(k=>typeof c[k]!=='boolean'))throw Error('Çekim kontrol alanları eksik.');
    plan.checks[id]={sha256:c.sha256,identity:c.identity,angle:c.angle,quality:c.quality};
  }
  if(!Array.isArray(input.bindings)||input.bindings.length>50)throw Error('En fazla 50 fotoğraf kesiti hazırlanabilir.');
  const pairs=new Set();
  for(const b of input.bindings) {
    const photo=byPhoto.get(b.photoId),key=b.partId+':'+b.photoId;
    if(!ids.has(b.partId)||!photo||b.sha256!==photo.sha256||!validPolygon(b.points)||pairs.has(key)||typeof b.reviewed!=='boolean')throw Error('Parça sınırı, kaynak fotoğraf veya eşleştirme geçersiz.');
    if(photo.kind!=='detail'&&session.photo_slots?.[photo.slot]!==photo.id)throw Error('Bu açının fotoğrafı yenilendi. Parça sınırını yeni çekime hazırlayın.');
    if(photo.kind==='detail'&&!session.findings?.[b.partId]?.evidenceIds?.includes(photo.id))throw Error('Detay fotoğrafını önce bu parçanın kanıtına bağlayın.');
    pairs.add(key);plan.bindings.push({partId:b.partId,photoId:b.photoId,sha256:b.sha256,points:b.points.map(p=>[...p]),reviewed:b.reviewed});
  }
  if(!Array.isArray(input.pins)||input.pins.length>100)throw Error('En fazla 100 ölçüm noktası işaretlenebilir.');
  const pinned=new Set();
  for(const p of input.pins) {
    const f=session.findings?.[p.partId]||emptyFinding(),key=p.partId+':'+p.photoId+':'+p.measurementIndex;
    if(!ids.has(p.partId)||!byPhoto.has(p.photoId)||!f.evidenceIds?.includes(p.photoId)||!Number.isInteger(p.measurementIndex)||p.measurementIndex<0||p.measurementIndex>=f.measurements.length||!unit(p.x)||!unit(p.y)||pinned.has(key))throw Error('Ölçüm noktası, kaydedilmiş ölçüme ve bağlı kanıta ait olmalı.');
    if(p.value!==f.measurements[p.measurementIndex])throw Error('İşaretli ölçüm değişti. Ölçüm noktasını yeniden yerleştirin.');
    pinned.add(key);plan.pins.push({partId:p.partId,photoId:p.photoId,measurementIndex:p.measurementIndex,value:p.value,x:p.x,y:p.y});
  }
  if(!Array.isArray(input.tour)||input.tour.length>12)throw Error('Anlatım en fazla 12 durak olabilir.');
  const stops=new Set();
  for(const s of input.tour) {
    const f=session.findings?.[s.partId];
    if(!ids.has(s.partId)||stops.has(s.partId)||!f||f.outcome==='unchecked'||!byPhoto.has(s.photoId)||!f.evidenceIds?.includes(s.photoId)||!Number.isInteger(s.seconds)||s.seconds<5||s.seconds>20||!['photo','cutout','model'].includes(s.view))throw Error('Anlatım durağı incelenmiş parçaya ve bağlı kanıta ait olmalı; süre 5–20 saniye olabilir.');
    if(s.view==='cutout'&&!plan.bindings.some(b=>b.partId===s.partId&&b.photoId===s.photoId&&b.reviewed))throw Error('Fotoğraf kesiti anlatımı için kontrol edilmiş parça sınırı gerekli.');
    const caption=clean(s.caption,400);if(caption.length<5)throw Error('Anlatım açıklamasını yazın.');
    stops.add(s.partId);plan.tour.push({partId:s.partId,photoId:s.photoId,seconds:s.seconds,caption,view:s.view});
  }
  if(complete&&plan.enabled) {
    const issues=studioIssues(plan,session,photos);if(issues.length)throw Error(issues[0].message);
  }
  return plan;
}
export function studioIssues(plan,session,photos) {
  if(!plan?.enabled)return [];
  const issues=[],byPhoto=new Map(photos.map(p=>[p.id,p]));
  for(const shot of SHOTS) {
    const id=session.photo_slots?.[shot.id],p=byPhoto.get(id),c=plan.checks?.[id];
    if(!p)issues.push({step:'capture',id:shot.id,message:shot.name+': çekim eksik.'});
    else if(!c||c.sha256!==p.sha256||!c.identity||!c.angle||!c.quality)issues.push({step:'capture',id:shot.id,message:shot.name+': araç, açı ve görüntü kontrolünü tamamlayın.'});
  }
  for(const b of plan.bindings||[])if(!b.reviewed)issues.push({step:'mapping',id:b.partId,message:'Hazırlanan parça sınırını kontrol edin: '+(partsFor(session.profile).find(p=>p.id===b.partId)?.name||b.partId)});
  if(!plan.tour?.length)issues.push({step:'story',message:'En az bir kanıta bağlı anlatım durağı hazırlayın.'});
  if(clean(plan.summary).length<10)issues.push({step:'story',message:'Müşteriye sunulacak kapsam açıklamasını yazın.'});
  return issues;
}

const maskCache=new WeakMap();
/** Prepared masks always belong to an exact immutable photograph, never to a make/model guess. */
export function preparedMask(presentation,photoId) {
  const studio=presentation?.studio,photo=presentation?.photos?.find(p=>p.id===photoId);
  if(!studio?.enabled||!photo||!['approved','preview'].includes(presentation.kind))return null;
  let cache=maskCache.get(presentation);if(!cache){cache=new Map();maskCache.set(presentation,cache);}if(cache.has(photoId))return cache.get(photoId);
  const width=photo.width||1072,height=photo.height||586;
  const parts=studio.bindings.filter(b=>b.photoId===photoId&&b.sha256===photo.sha256&&b.reviewed&&validPolygon(b.points)).map(b=>{
    const anchor=b.points.reduce((a,p)=>[a[0]+p[0]*width/b.points.length,a[1]+p[1]*height/b.points.length],[0,0]);
    const side=b.partId.startsWith('left')?-1:b.partId.startsWith('right')?1:anchor[0]>width/2?1:-1;
    return {id:b.partId,path:'M'+b.points.map(p=>p[0]*width+' '+p[1]*height).join(' L')+' Z',anchor,offset:[side*width*.075,['roof','hood','trunk','windshield','rear_glass'].includes(b.partId)?-height*.11:height*.045]};
  });
  const mask=parts.length?{frame:photo.frame||photo.slot,width,height,parts}:null;cache.set(photoId,mask);return mask;
}
export function preparedBinding(presentation,partId,preferredId) {
  return presentation?.studio?.bindings?.find(b=>b.partId===partId&&b.reviewed&&b.photoId===preferredId)
    || presentation?.studio?.bindings?.find(b=>b.partId===partId&&b.reviewed)||null;
}
export function publicStudio(input,session,photos) {
  if(!input?.enabled)return null;
  if(!Array.isArray(input.bindings)||input.bindings.some(b=>{const p=photos.find(p=>p.id===b.photoId);return !p||!Number.isInteger(p.width)||!Number.isInteger(p.height)||p.width<720||p.height<720||p.width*p.height>60000000||!/^[a-f0-9]{64}$/.test(p.sha256);} ))return null;
  try {const plan=validateStudio({...input,checks:{},equipment:''},session,photos);return {version:1,enabled:true,modelKey:plan.modelKey,summary:plan.summary,bindings:plan.bindings.filter(b=>b.reviewed),pins:plan.pins,tour:plan.tour};} catch {return null;}
}
