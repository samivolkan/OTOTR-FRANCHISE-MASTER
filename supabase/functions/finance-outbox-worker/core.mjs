const headers=id=>({'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Correlation-Id':id});
const json=(status,id,body)=>new Response(JSON.stringify(body),{status,headers:headers(id)});
const digest=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
async function sameSecret(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const[x,y]=await Promise.all([digest(a),digest(b)]);let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0;}
const bearer=req=>{const v=req.headers.get('authorization')||'';return v.startsWith('Bearer ')?v.slice(7):'';};
const uuid=()=>crypto.randomUUID();
export function createFinanceOutboxWorkerHandler({serviceRoleKey,allowedTopics,claim,acknowledge,fail,publish,clock=()=>new Date(),newId=uuid,maxAttempts=8}){
  if(typeof serviceRoleKey!=='string'||serviceRoleKey.length<20||!Array.isArray(allowedTopics)||!allowedTopics.length)throw new Error('outbox worker configuration invalid');
  return async request=>{
    const correlationId=request.headers.get('correlation-id')||newId();
    if(request.method!=='POST')return json(405,correlationId,{error:{code:'METHOD_NOT_ALLOWED'}});
    if(!await sameSecret(bearer(request),serviceRoleKey))return json(401,correlationId,{error:{code:'WORKER_AUTH_REQUIRED'}});
    let input={};try{input=await request.json();}catch{return json(400,correlationId,{error:{code:'INVALID_JSON'}});}
    const batchSize=Number.isSafeInteger(input.batchSize)&&input.batchSize>=1&&input.batchSize<=100?input.batchSize:20;
    const leaseId=newId(),now=clock(),workerId='finance-outbox-worker';
    let messages;try{messages=await claim({workerId,leaseId,batchSize,leaseSeconds:60,nowUtc:now.toISOString(),allowedTopics});}
    catch{return json(503,correlationId,{error:{code:'OUTBOX_CLAIM_FAILED'}});}
    const result={claimed:messages.length,published:0,retrying:0,deadLetter:0};
    for(const message of messages){
      try{
        const externalAckId=await publish(message);
        await acknowledge({workerId,leaseId,messageId:message.id,externalAckId,publishedAtUtc:clock().toISOString()});
        result.published++;
      }catch(error){
        const retryable=error?.retryable!==false;
        const delay=Math.min(900,Math.max(15,2**Math.min(message.attempt_count||1,9)));
        const next=new Date(clock().getTime()+delay*1000).toISOString();
        const outcome=await fail({workerId,leaseId,messageId:message.id,errorCode:typeof error?.code==='string'?error.code:'DELIVERY_FAILED',retryable,maxAttempts,nextAttemptAtUtc:next,nowUtc:clock().toISOString()});
        if(outcome.outcome==='RETRYING')result.retrying++;else result.deadLetter++;
      }
    }
    return json(200,correlationId,{data:result});
  };
}
