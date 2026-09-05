const DB_NAME='ototr-vehicle-3d-local-v1';
export async function openStore(){
  return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore('data');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
}
export async function readState(){const db=await openStore();try{return await new Promise((resolve,reject)=>{const r=db.transaction('data').objectStore('data').get('session');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}}
export async function writeState(state){const db=await openStore();try{await new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').put(state,'session');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export async function preparePhoto(file,existingPhotos,slotId){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('JPG, PNG veya WebP seçin. HEIC dosyasını önce JPG olarak dışa aktarın.');
  if(file.size>20*1024*1024)throw new Error('Dosya 20 MB sınırını aşıyor.');
  const bytes=await file.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  if(Object.entries(existingPhotos).some(([id,p])=>id!==slotId&&p.sha256===hash))throw new Error('Bu fotoğraf başka bir pozda zaten var. Bu açı için yeni fotoğraf seçin.');
  const bitmap=await createImageBitmap(file);
  if(Math.min(bitmap.width,bitmap.height)<720){bitmap.close();throw new Error('Kısa kenar en az 720 piksel olmalı. Daha yüksek çözünürlüklü fotoğraf seçin.');}
  const width=bitmap.width,height=bitmap.height;const scale=Math.min(1,1800/Math.max(width,height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  return {kind:'photo',name:file.name,sha256:hash,width,height,createdAt:new Date().toISOString(),url:canvas.toDataURL('image/jpeg',.87),quality:'manual_review_required'};
}
