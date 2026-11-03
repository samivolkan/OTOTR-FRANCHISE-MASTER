const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDEM=/^[A-Za-z0-9:_-]{8,200}$/;
const headers=correlationId=>({'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Correlation-Id':correlationId});
const json=(status,correlationId,body)=>new Response(JSON.stringify(body),{status,headers:headers(correlationId)});
const digest=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
async function sameSecret(left,right){if(typeof left!=='string'||typeof right!=='string')return false;const[a,b]=await Promise.all([digest(left),digest(right)]);let mismatch=a.length^b.length;for(let index=0;index<Math.max(a.length,b.length);index++)mismatch|=(a[index]||0)^(b[index]||0);return mismatch===0;}
const requiredUuid=(value,name)=>{if(typeof value!=='string'||!UUID.test(value))throw Object.assign(new Error(`${name} geçerli UUID olmalıdır.`),{status:400,code:'INVALID_EVENT'});return value.toLowerCase();};

export function createFinanceRefundWorkerHandler({serviceRoleKey,processRefund,correlationFactory=()=>crypto.randomUUID(),maxBodyBytes=16384}={}){
  if(typeof serviceRoleKey!=='string'||serviceRoleKey.length<40||typeof processRefund!=='function')throw new Error('Refund worker yapılandırması geçersiz.');
  return async request=>{
    const correlationId=request.headers.get('correlation-id')?.match(UUID)?.[0]?.toLowerCase()||correlationFactory();
    try{
      if(request.method!=='POST')return json(405,correlationId,{error:{code:'METHOD_NOT_ALLOWED',message:'Yalnızca POST desteklenir.'}});
      const bearer=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
      if(!await sameSecret(bearer,serviceRoleKey))return json(401,correlationId,{error:{code:'WORKER_AUTH_REQUIRED',message:'Güvenilir finans worker kimliği zorunludur.'}});
      if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return json(415,correlationId,{error:{code:'CONTENT_TYPE_REQUIRED',message:'application/json zorunludur.'}});
      const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>maxBodyBytes)return json(413,correlationId,{error:{code:'PAYLOAD_TOO_LARGE',message:'Worker olay gövdesi sınırı aşıldı.'}});
      let body;try{body=JSON.parse(raw);}catch{return json(400,correlationId,{error:{code:'INVALID_JSON',message:'Geçerli JSON zorunludur.'}});}
      const allowed=['actorId','legalEntityId','dealerLegalEntityId','dealerAccountId','branchId','sourceEventId','refundId','idempotencyKey'];
      if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!allowed.includes(key))||!IDEM.test(body.idempotencyKey||''))return json(400,correlationId,{error:{code:'INVALID_EVENT',message:'Royalty iade olayı sözleşmesi geçersiz.'}});
      const input={actorId:requiredUuid(body.actorId,'actorId'),legalEntityId:requiredUuid(body.legalEntityId,'legalEntityId'),dealerLegalEntityId:requiredUuid(body.dealerLegalEntityId,'dealerLegalEntityId'),dealerAccountId:requiredUuid(body.dealerAccountId,'dealerAccountId'),branchId:requiredUuid(body.branchId,'branchId'),sourceEventId:requiredUuid(body.sourceEventId,'sourceEventId'),refundId:requiredUuid(body.refundId,'refundId'),idempotencyKey:body.idempotencyKey,correlationId};
      const result=await processRefund(input);
      if(!result||!['CREATED','REPLAY','NOT_FOUND','CONFLICT'].includes(result.outcome))throw new Error('invalid refund processor response');
      const status=result.outcome==='NOT_FOUND'?404:result.outcome==='CONFLICT'?409:200;
      return json(status,correlationId,{data:{...result,correlationId}});
    }catch(error){const known=Number.isInteger(error?.status)&&typeof error?.code==='string';return json(known?error.status:500,correlationId,{error:{code:known?error.code:'INTERNAL_ERROR',message:known?error.message:'Royalty iade worker işlemi tamamlanamadı.'}});}
  };
}
