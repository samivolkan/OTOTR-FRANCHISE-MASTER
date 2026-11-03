const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const CAPABILITY=/^[A-Z][A-Z0-9_]{1,63}$/;
const digest=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
async function sameSecret(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const[x,y]=await Promise.all([digest(a),digest(b)]);let mismatch=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)mismatch|=(x[i]||0)^(y[i]||0);return mismatch===0;}
const headers=id=>({'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Correlation-Id':id});
const json=(status,id,body)=>new Response(JSON.stringify(body),{status,headers:headers(id)});
const uuid=(value,name)=>{if(typeof value!=='string'||!UUID.test(value))throw Object.assign(new Error(`${name} geçerli UUID olmalıdır.`),{status:400,code:'INVALID_ACCESS_REQUEST'});return value.toLowerCase();};

export function createFinanceBranchAccessHandler({serviceRoleKey,authorizeAccess,correlationFactory=()=>crypto.randomUUID(),maxBodyBytes=8192}={}){
  if(typeof serviceRoleKey!=='string'||serviceRoleKey.length<40||typeof authorizeAccess!=='function')throw new Error('Branch access worker yapılandırması geçersiz.');
  return async request=>{const correlationId=request.headers.get('correlation-id')?.match(UUID)?.[0]?.toLowerCase()||correlationFactory();try{
    if(request.method!=='POST')return json(405,correlationId,{error:{code:'METHOD_NOT_ALLOWED',message:'Yalnızca POST desteklenir.'}});
    const bearer=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!await sameSecret(bearer,serviceRoleKey))return json(401,correlationId,{error:{code:'GATEWAY_AUTH_REQUIRED',message:'Güvenilir ERP geçidi kimliği zorunludur.'}});
    if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return json(415,correlationId,{error:{code:'CONTENT_TYPE_REQUIRED',message:'application/json zorunludur.'}});
    const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>maxBodyBytes)return json(413,correlationId,{error:{code:'PAYLOAD_TOO_LARGE',message:'Erişim isteği sınırı aşıldı.'}});
    let body;try{body=JSON.parse(raw);}catch{return json(400,correlationId,{error:{code:'INVALID_JSON',message:'Geçerli JSON zorunludur.'}});}
    const allowed=['actorId','legalEntityId','dealerAccountId','branchId','capability','businessDate'];
    if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!allowed.includes(k))||!CAPABILITY.test(body.capability||'')||!DATE.test(body.businessDate||''))return json(400,correlationId,{error:{code:'INVALID_ACCESS_REQUEST',message:'ERP erişim isteği sözleşmesi geçersiz.'}});
    const input={actorId:uuid(body.actorId,'actorId'),legalEntityId:uuid(body.legalEntityId,'legalEntityId'),dealerAccountId:uuid(body.dealerAccountId,'dealerAccountId'),branchId:uuid(body.branchId,'branchId'),capability:body.capability,businessDate:body.businessDate,correlationId};
    const result=await authorizeAccess(input);if(!result||typeof result.allowed!=='boolean'||!['OPEN','LOCKED_OVERDUE'].includes(result.accessState))throw new Error('invalid branch access response');
    return json(result.allowed?200:423,correlationId,{data:{allowed:result.allowed,accessState:result.accessState,reasonCode:result.reasonCode||null,capability:input.capability,blockingOpenItemId:result.blockingOpenItemId||null,blockingOpenAmount:result.blockingOpenAmount||null,currency:result.currency||null,evaluatedAtUtc:result.evaluatedAtUtc||null,correlationId}});
  }catch(error){const known=Number.isInteger(error?.status)&&typeof error?.code==='string';return json(known?error.status:500,correlationId,{error:{code:known?error.code:'INTERNAL_ERROR',message:known?error.message:'Şube erişim kararı üretilemedi.'}});}};
}
