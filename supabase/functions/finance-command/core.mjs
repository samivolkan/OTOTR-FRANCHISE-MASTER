const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON=/^[A-Z][A-Z0-9_]{2,63}$/;
const KEYS=new Set(['operationId','scope','command']);

export class FinanceCommandError extends Error{constructor(status,code,message){super(message);this.name='FinanceCommandError';this.status=status;this.code=code;}}
const uuid=(value,field)=>{if(typeof value!=='string'||!UUID.test(value))throw new FinanceCommandError(400,'INVALID_COMMAND',`${field} geçerli UUID olmalıdır.`);return value.toLowerCase();};
const encode=value=>new TextEncoder().encode(value);
const sha256=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',encode(value)))].map(v=>v.toString(16).padStart(2,'0')).join('');
const responseHeaders=(origin,correlationId)=>({'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, correlation-id, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Max-Age':'600','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Correlation-Id':correlationId,'Vary':'Origin'});
const json=(origin,correlationId,status,body)=>new Response(JSON.stringify(body),{status,headers:responseHeaders(origin,correlationId)});

async function parse(request,maxBodyBytes){
  if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))throw new FinanceCommandError(415,'CONTENT_TYPE_REQUIRED','application/json zorunludur.');
  const raw=await request.text();if(encode(raw).byteLength>maxBodyBytes)throw new FinanceCommandError(413,'PAYLOAD_TOO_LARGE','Komut gövdesi sınırı aşıldı.');
  let body;try{body=JSON.parse(raw);}catch{throw new FinanceCommandError(400,'INVALID_JSON','Geçerli JSON zorunludur.');}
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!KEYS.has(key)))throw new FinanceCommandError(400,'INVALID_COMMAND','Komut sözleşmesi geçersiz.');
  if(body.operationId!=='retryIntegrationError')throw new FinanceCommandError(403,'OPERATION_DENIED','Finans komutuna izin verilmiyor.');
  const scope=Object.freeze({legalEntityId:uuid(body.scope?.legalEntityId,'legalEntityId'),dealerAccountId:uuid(body.scope?.dealerAccountId,'dealerAccountId'),branchId:uuid(body.scope?.branchId,'branchId')});
  const command=body.command;if(!command||typeof command!=='object'||Array.isArray(command)||Object.keys(command).some(key=>!['errorId','reasonCode','resolutionNote','expectedVersion','idempotencyKey'].includes(key)))throw new FinanceCommandError(400,'INVALID_COMMAND','Retry komutu geçersiz.');
  const errorId=uuid(command.errorId,'errorId');
  if(typeof command.reasonCode!=='string'||!REASON.test(command.reasonCode))throw new FinanceCommandError(400,'INVALID_COMMAND','reasonCode geçersiz.');
  if(typeof command.resolutionNote!=='string'||!command.resolutionNote.trim()||command.resolutionNote.length>2000)throw new FinanceCommandError(400,'INVALID_COMMAND','Çözüm notu 1–2000 karakter olmalıdır.');
  if(!Number.isInteger(command.expectedVersion)||command.expectedVersion<1)throw new FinanceCommandError(400,'INVALID_COMMAND','expectedVersion geçersiz.');
  if(typeof command.idempotencyKey!=='string'||command.idempotencyKey.length<8||command.idempotencyKey.length>200||!/^[A-Za-z0-9:_-]+$/.test(command.idempotencyKey))throw new FinanceCommandError(400,'INVALID_COMMAND','idempotencyKey geçersiz.');
  return Object.freeze({operationId:body.operationId,scope,errorId,reasonCode:command.reasonCode,resolutionNote:command.resolutionNote.trim(),expectedVersion:command.expectedVersion,idempotencyKey:command.idempotencyKey});
}

export function createFinanceCommandHandler({allowedOrigins,authenticate,authorizeRetry,commitRetry,correlationFactory=()=>crypto.randomUUID(),digest=sha256,maxBodyBytes=16384}={}){
  const origins=new Set(allowedOrigins||[]);const invalid=value=>{try{const u=new URL(value);return value==='*'||u.origin!==value||(u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)));}catch{return true;}};
  if(!origins.size||[...origins].some(invalid))throw new Error('HTTPS veya local HTTP açık origin allowlist zorunludur.');
  if(![authenticate,authorizeRetry,commitRetry,digest].every(fn=>typeof fn==='function'))throw new Error('Finans komut portları zorunludur.');
  if(!Number.isInteger(maxBodyBytes)||maxBodyBytes<1024||maxBodyBytes>32768)throw new Error('maxBodyBytes 1024–32768 arasında olmalıdır.');
  return async request=>{
    const rawCorrelation=request.headers.get('correlation-id');const correlationId=typeof rawCorrelation==='string'&&UUID.test(rawCorrelation)?rawCorrelation.toLowerCase():correlationFactory();const origin=request.headers.get('origin')||'';
    try{
      if(!UUID.test(correlationId))throw new FinanceCommandError(503,'CORRELATION_UNAVAILABLE','İstek izleme kimliği üretilemedi.');
      if(!origins.has(origin))throw new FinanceCommandError(403,'ORIGIN_DENIED','İstek kaynağına izin verilmiyor.');
      if(request.method==='OPTIONS')return new Response(null,{status:204,headers:responseHeaders(origin,correlationId)});
      if(request.method!=='POST')throw new FinanceCommandError(405,'METHOD_NOT_ALLOWED','Yalnızca POST desteklenir.');
      const match=/^Bearer\s+([^\s]+)$/i.exec(request.headers.get('authorization')||'');if(!match||match[1].length<20)throw new FinanceCommandError(401,'AUTH_REQUIRED','Geçerli kullanıcı oturumu gereklidir.');
      const actor=await authenticate(match[1]);if(!actor?.id||!UUID.test(actor.id))throw new FinanceCommandError(401,'AUTH_REQUIRED','Kullanıcı doğrulanamadı.');
      const input=await parse(request,maxBodyBytes);
      const authorized=await authorizeRetry({actor,errorId:input.errorId});
      if(!authorized?.allowed||authorized.legalEntityId!==input.scope.legalEntityId||authorized.dealerAccountId!==input.scope.dealerAccountId||authorized.branchId!==input.scope.branchId)throw new FinanceCommandError(403,'SCOPE_DENIED','Retry kapsamına erişim reddedildi.');
      const resolutionNoteHash=await digest(input.resolutionNote);
      const intentHash=await digest([input.errorId,input.reasonCode,resolutionNoteHash,input.expectedVersion,input.idempotencyKey].join('|'));
      if(!/^[a-f0-9]{64}$/.test(resolutionNoteHash)||!/^[a-f0-9]{64}$/.test(intentHash))throw new FinanceCommandError(503,'DIGEST_UNAVAILABLE','Komut özeti üretilemedi.');
      const result=await commitRetry({actorId:actor.id,scope:input.scope,errorId:input.errorId,reasonCode:input.reasonCode,resolutionNoteHash,expectedVersion:input.expectedVersion,idempotencyKey:input.idempotencyKey,intentHash,correlationId});
      if(!result||!['QUEUED','REPLAY','CONFLICT'].includes(result.outcome))throw new Error('invalid commit response');
      return json(origin,correlationId,result.outcome==='CONFLICT'?409:200,{data:{outcome:result.outcome,errorId:result.errorId,jobId:result.jobId||null,status:result.status||null,version:result.version??null,correlationId}});
    }catch(error){const known=error instanceof FinanceCommandError;return json(origins.has(origin)?origin:'null',correlationId,known?error.status:500,{error:{code:known?error.code:'INTERNAL_ERROR',message:known?error.message:'Finans komutu tamamlanamadı.'}});}
  };
}
