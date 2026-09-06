const DB_NAME='ototr-kaporta-pending-v1';
let db;
function database(){return db||=new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore('queue',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function transaction(mode,fn){const d=await database();return new Promise((resolve,reject)=>{const tx=d.transaction('queue',mode);let result;const req=fn(tx.objectStore('queue'));req.onsuccess=()=>{result=req.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Kayıt tamamlanamadı.'));});}
export const queuePhoto=photo=>transaction('readwrite',s=>s.put(photo));
export const removeQueued=id=>transaction('readwrite',s=>s.delete(id));
export const pendingFor=async userId=>(await transaction('readonly',s=>s.getAll())).filter(p=>p.userId===userId);
export async function inspectPhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('JPG, PNG veya WebP kullanın. HEIC dosyasını önce JPEG olarak dışa aktarın.');
 if(file.size>20*1024*1024||file.size<1000)throw Error('Dosya 1 KB–20 MB aralığında olmalı.');
 const bytes=await file.arrayBuffer();const bitmap=await createImageBitmap(file).catch(()=>{throw Error('Görsel dosyası okunamadı.');});
 const width=bitmap.width,height=bitmap.height;bitmap.close();
 if(Math.min(width,height)<720||width*height>60000000)throw Error('En az 720 piksel kısa kenar ve en fazla 60 MP görsel kullanın.');
 const hash=await crypto.subtle.digest('SHA-256',bytes);return {id:crypto.randomUUID(),blob:file,mime:file.type,size:file.size,width,height,sha256:Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join(''),capturedAt:new Date().toISOString()};
}
