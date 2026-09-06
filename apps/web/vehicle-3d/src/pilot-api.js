let config,auth;
const KEY='ototr-kaporta-auth-v1';
export async function configure(){const r=await fetch('./runtime-config.json',{cache:'no-store'});if(!r.ok)throw Error('Pilot bağlantısı henüz yapılandırılmadı.');config=await r.json();if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(config.url)||!config.publishableKey)throw Error('Pilot bağlantı ayarı geçersiz.');try{auth=JSON.parse(sessionStorage.getItem(KEY));}catch{}return config;}
function remember(a){auth={...a,expires_at:a.expires_at||Math.floor(Date.now()/1000)+(a.expires_in||3600)};sessionStorage.setItem(KEY,JSON.stringify(auth));sessionStorage.removeItem(KEY+'-signed-out');}
async function request(path,{method='GET',body,raw=false,token=true}={}){
 if(!config)throw Error('Bağlantı hazırlanıyor.');
 if(token&&auth?.refresh_token&&auth.expires_at<Date.now()/1000+60){const r=await fetch(config.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:auth.refresh_token})});if(!r.ok){signOut();throw Error('Oturum süresi doldu. Tekrar giriş yapın.');}remember(await r.json());}
 const headers={apikey:config.publishableKey,...(token?{Authorization:`Bearer ${auth?.access_token||''}`}:{})};
 if(body&&!raw)headers['Content-Type']='application/json';
 if(raw)headers['Content-Type']=body.type;
 const r=await fetch(config.url+path,{method,headers,body:raw?body:body?JSON.stringify(body):undefined});
 if(!r.ok){const e=await r.json().catch(()=>({}));throw Error(r.status===401?'Oturum doğrulanamadı. Tekrar giriş yapın.':e.message||e.error_description||'İşlem tamamlanamadı. Bağlantıyı kontrol edin.');}
 return r;
}
export async function login(email,password){const r=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},token:false});remember(await r.json());return me();}
export function signOut(){auth=null;sessionStorage.removeItem(KEY);sessionStorage.setItem(KEY+'-signed-out','1');}
export async function me(){if(!auth?.access_token){const inherited=!sessionStorage.getItem(KEY+'-signed-out')&&localStorage.getItem('ototrSupabaseAccessToken');if(inherited)auth={access_token:inherited};else return null;}await request('/auth/v1/user');return rpc('k360_identity',{});}
export const rpc=async(name,body)=>(await request('/rest/v1/rpc/'+name,{method:'POST',body})).json();
export const jobs=()=>rpc('k360_jobs',{});
export const openSession=(caseId,profile)=>rpc('k360_open',{case_id:caseId,body_profile:profile});
export const loadSession=id=>rpc('k360_load',{session_id:id});
export const command=(id,revision,action,payload={})=>rpc('k360_command',{session_id:id,expected_revision:revision,action,payload});
export async function upload(sessionId,photo){const ext=photo.mime==='image/png'?'png':photo.mime==='image/webp'?'webp':'jpg';const name=`${sessionId}/${photo.id}.${ext}`;try{await request('/storage/v1/object/kaporta-360/'+name,{method:'POST',body:photo.blob,raw:true});}catch(e){if(!/already exists|Duplicate|resource already exists/i.test(e.message))throw e;}return name;}
export async function photoURL(name,original=false){const r=await request('/storage/v1/object/authenticated/kaporta-360/'+name);const blob=await r.blob();if(original)return URL.createObjectURL(blob);const bitmap=await createImageBitmap(blob);const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const preview=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.88));return URL.createObjectURL(preview||blob);}
export async function customerReport(token){const r=await request('/functions/v1/kaporta-360-report',{method:'POST',body:{token},token:false});return r.json();}
