// Customer capability authentication is verified in k360_resolve_share. No anonymous table access.
const allowedOrigins = new Set(['https://samivolkan.github.io', 'http://127.0.0.1:4318', 'http://127.0.0.1:4320']);
export function createHandler(env: (name: string) => string | undefined, fetcher: typeof fetch = fetch) {
 return async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin') || '';
  const headers: Record<string,string> = {'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Vary':'Origin'};
  if (allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin']=origin;
  headers['Access-Control-Allow-Headers']='apikey,content-type';
  headers['Access-Control-Allow-Methods']='POST,OPTIONS';
  const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
  if (origin && !allowedOrigins.has(origin)) return reply(403,{message:'Bu adresten erişim kapalı.'});
  if (req.method==='OPTIONS') return new Response(null,{status:204,headers});
  if (req.method!=='POST') return reply(405,{message:'Geçersiz istek.'});
  if (Number(req.headers.get('content-length')||0)>1024) return reply(413,{message:'Geçersiz istek.'});
  try {
   const raw=await req.text(); if(raw.length>1024)return reply(413,{message:'Geçersiz istek.'});
   const {token}=JSON.parse(raw); if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return reply(404,{message:'Paylaşım bulunamadı veya süresi doldu.'});
   const base=env('SUPABASE_URL'),key=env('SUPABASE_SERVICE_ROLE_KEY'); if(!base||!key)return reply(503,{message:'Rapor servisi hazır değil.'});
   const serverHeaders={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
   const result=await fetcher(base+'/rest/v1/rpc/k360_resolve_share',{method:'POST',headers:serverHeaders,body:JSON.stringify({share_token:token})});
   if(!result.ok)return reply(404,{message:'Paylaşım bulunamadı veya süresi doldu.'});
   const report=await result.json();
   // Share only photos present in the approved snapshot. All original storage paths are server-controlled.
   const active=new Set<string>(Object.values(report.session.photo_slots) as string[]);
   for(const finding of Object.values(report.session.findings) as Array<{evidenceIds:string[]}>)for(const id of finding.evidenceIds)active.add(id);
   const source=report.photos.filter((p:{id:string})=>active.has(p.id));
   const paths=source.map((p:{path:string})=>p.path);
   const signed=await fetcher(base+'/storage/v1/object/sign/kaporta-360',{method:'POST',headers:serverHeaders,body:JSON.stringify({expiresIn:120,paths})});
   if(!signed.ok)return reply(503,{message:'Rapor fotoğrafları yüklenemedi. Tekrar deneyin.'});
   const signedRows=await signed.json();
   const photos=source.map((p:{id:string;slot:string;kind:string;path:string})=>{const row=signedRows.find((s:{path:string})=>s.path===p.path);const relative=row?.signedURL||row?.signedUrl;if(!relative)throw Error('Missing signed photo');return{id:p.id,slot:p.slot,kind:p.kind,url:base+'/storage/v1'+relative};});
   return reply(200,{session:{profile:report.session.profile,status:'approved',photo_slots:report.session.photo_slots,findings:report.session.findings},job:{plate:report.job.plate,brand:report.job.brand,model:report.job.model,work_order_no:report.job.work_order_no},photos,approvedBy:report.approvedBy,approvedAt:report.approvedAt,reportId:report.reportId,customerView:true});
  } catch {return reply(400,{message:'Rapor yüklenemedi. Bağlantıyı kontrol edip tekrar deneyin.'});}
 };
}
if(import.meta.main) Deno.serve(createHandler(name=>Deno.env.get(name)));
