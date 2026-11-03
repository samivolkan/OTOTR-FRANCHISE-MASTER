const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON=/^[A-Z][A-Z0-9_]{2,63}$/;
const KEYS=new Set(['operationId','scope','command']);
const RULE_KEYS=['basis','calculation','cancellationPolicy','code','configurationStatus','evidenceDocumentId','exceptions','feeDefinitionId','tax','trigger','due'];

export class FinanceCommandError extends Error{constructor(status,code,message){super(message);this.name='FinanceCommandError';this.status=status;this.code=code;}}
const uuid=(value,field)=>{if(typeof value!=='string'||!UUID.test(value))throw new FinanceCommandError(400,'INVALID_COMMAND',`${field} geçerli UUID olmalıdır.`);return value.toLowerCase();};
const encode=value=>new TextEncoder().encode(value);
const sha256=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',encode(value)))].map(v=>v.toString(16).padStart(2,'0')).join('');
const canonical=value=>value===null||typeof value!=='object'?JSON.stringify(value):Array.isArray(value)?`[${value.map(canonical).join(',')}]`:`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
const responseHeaders=(origin,correlationId)=>({'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, correlation-id, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Max-Age':'600','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Correlation-Id':correlationId,'Vary':'Origin'});
const json=(origin,correlationId,status,body)=>new Response(JSON.stringify(body),{status,headers:responseHeaders(origin,correlationId)});

async function parse(request,maxBodyBytes){
  if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))throw new FinanceCommandError(415,'CONTENT_TYPE_REQUIRED','application/json zorunludur.');
  const raw=await request.text();if(encode(raw).byteLength>maxBodyBytes)throw new FinanceCommandError(413,'PAYLOAD_TOO_LARGE','Komut gövdesi sınırı aşıldı.');
  let body;try{body=JSON.parse(raw);}catch{throw new FinanceCommandError(400,'INVALID_JSON','Geçerli JSON zorunludur.');}
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!KEYS.has(key)))throw new FinanceCommandError(400,'INVALID_COMMAND','Komut sözleşmesi geçersiz.');
  if(!['retryIntegrationError','createDispute','submitDispute','updateContractFeeRule','submitContractVersion','approveContractVersion','publishContractVersion'].includes(body.operationId))throw new FinanceCommandError(403,'OPERATION_DENIED','Finans komutuna izin verilmiyor.');
  const scope=Object.freeze({legalEntityId:uuid(body.scope?.legalEntityId,'legalEntityId'),dealerAccountId:uuid(body.scope?.dealerAccountId,'dealerAccountId'),branchId:uuid(body.scope?.branchId,'branchId')});
  const command=body.command;if(!command||typeof command!=='object'||Array.isArray(command))throw new FinanceCommandError(400,'INVALID_COMMAND','Komut gövdesi geçersiz.');
  if(body.operationId==='createDispute'){
    const allowed=['targetRecordType','targetRecordId','disputedAmount','currencyCode','reasonCode','statementHash','documentIds','idempotencyKey'];if(Object.keys(command).some(key=>!allowed.includes(key)))throw new FinanceCommandError(400,'INVALID_COMMAND','İtiraz komutu geçersiz.');
    if(!['OPEN_ITEM','ACCRUAL','EXTERNAL_INVOICE_LINE'].includes(command.targetRecordType)||typeof command.disputedAmount!=='string'||!command.disputedAmount.match(/^(0*[1-9]\d*)(\.\d{1,8})?$/)||typeof command.currencyCode!=='string'||!command.currencyCode.match(/^[A-Z]{3}$/)||typeof command.reasonCode!=='string'||!REASON.test(command.reasonCode)||command.reasonCode.length>64||!(command.statementHash===null||typeof command.statementHash==='string'&&/^[a-f0-9]{64}$/i.test(command.statementHash))||!Array.isArray(command.documentIds)||command.documentIds.length>20||command.documentIds.some(id=>!UUID.test(id))||typeof command.idempotencyKey!=='string'||command.idempotencyKey.length<8||command.idempotencyKey.length>200||!/^[A-Za-z0-9:_-]+$/.test(command.idempotencyKey))throw new FinanceCommandError(400,'INVALID_COMMAND','İtiraz alanları geçersiz.');
    return Object.freeze({operationId:body.operationId,scope,dealerAccountId:scope.dealerAccountId,targetRecordType:command.targetRecordType,targetRecordId:uuid(command.targetRecordId,'targetRecordId'),disputedAmount:command.disputedAmount,currencyCode:command.currencyCode,reasonCode:command.reasonCode,statementHash:command.statementHash,documentIds:Object.freeze(command.documentIds.map(id=>uuid(id,'documentId'))),idempotencyKey:command.idempotencyKey});
  }
  if(body.operationId==='submitDispute'){
    if(Object.keys(command).some(key=>!['disputeId','expectedVersion','reasonCode','note','idempotencyKey'].includes(key)))throw new FinanceCommandError(400,'INVALID_COMMAND','İtiraz gönderim komutu geçersiz.');
    if(!Number.isInteger(command.expectedVersion)||command.expectedVersion<1||typeof command.reasonCode!=='string'||!REASON.test(command.reasonCode)||typeof command.note!=='string'||!command.note.trim()||command.note.length>2000||typeof command.idempotencyKey!=='string'||command.idempotencyKey.length<8||command.idempotencyKey.length>200||!/^[A-Za-z0-9:_-]+$/.test(command.idempotencyKey))throw new FinanceCommandError(400,'INVALID_COMMAND','İtiraz gönderim alanları geçersiz.');
    return Object.freeze({operationId:body.operationId,scope,disputeId:uuid(command.disputeId,'disputeId'),expectedVersion:command.expectedVersion,reasonCode:command.reasonCode,note:command.note.trim(),idempotencyKey:command.idempotencyKey});
  }
  if(body.operationId==='updateContractFeeRule'){
    const allowed=['contractVersionId','feeRuleId','expectedVersion','rule','idempotencyKey'];
    if(Object.keys(command).some(key=>!allowed.includes(key)))throw new FinanceCommandError(400,'INVALID_COMMAND','Kural güncelleme komutu geçersiz.');
    const rule=command.rule;
    if(!rule||typeof rule!=='object'||Array.isArray(rule)||Object.keys(rule).sort().join('|')!==[...RULE_KEYS].sort().join('|'))throw new FinanceCommandError(400,'INVALID_COMMAND','Kural gövdesi geçersiz.');
    if(typeof rule.code!=='string'||!/^[A-Z][A-Z0-9_]{2,79}$/.test(rule.code)||typeof rule.feeDefinitionId!=='string'||!UUID.test(rule.feeDefinitionId)||!['UNCONFIGURED','CONFIGURED'].includes(rule.configurationStatus)||!Array.isArray(rule.exceptions)||rule.exceptions.length!==0)throw new FinanceCommandError(400,'INVALID_COMMAND','Kural alanları geçersiz.');
    if(rule.configurationStatus==='CONFIGURED'&&(!rule.trigger||!rule.basis||!rule.calculation||!rule.tax||!rule.due||!rule.cancellationPolicy))throw new FinanceCommandError(400,'INVALID_COMMAND','Yapılandırılmış kural alanları eksik.');
    if(!Number.isInteger(command.expectedVersion)||command.expectedVersion<1||typeof command.idempotencyKey!=='string'||command.idempotencyKey.length<8||command.idempotencyKey.length>200||!/^[A-Za-z0-9:_-]+$/.test(command.idempotencyKey))throw new FinanceCommandError(400,'INVALID_COMMAND','Kural sürümü veya idempotency anahtarı geçersiz.');
    return Object.freeze({operationId:body.operationId,scope,contractVersionId:uuid(command.contractVersionId,'contractVersionId'),feeRuleId:uuid(command.feeRuleId,'feeRuleId'),expectedVersion:command.expectedVersion,rule:Object.freeze(rule),idempotencyKey:command.idempotencyKey});
  }
  if(['submitContractVersion','approveContractVersion','publishContractVersion'].includes(body.operationId)){
    if(Object.keys(command).some(key=>!['contractVersionId','expectedVersion','reasonCode','note','idempotencyKey'].includes(key)))throw new FinanceCommandError(400,'INVALID_COMMAND','Sözleşme sürümü yaşam döngüsü komutu geçersiz.');
    if(typeof command.reasonCode!=='string'||!REASON.test(command.reasonCode)||typeof command.note!=='string'||!command.note.trim()||command.note.length>2000)throw new FinanceCommandError(400,'INVALID_COMMAND','Karar nedeni ve 1–2000 karakter not zorunludur.');
    if(!Number.isInteger(command.expectedVersion)||command.expectedVersion<1||typeof command.idempotencyKey!=='string'||command.idempotencyKey.length<8||command.idempotencyKey.length>200||!/^[A-Za-z0-9:_-]+$/.test(command.idempotencyKey))throw new FinanceCommandError(400,'INVALID_COMMAND','Sürüm veya idempotency anahtarı geçersiz.');
    return Object.freeze({operationId:body.operationId,scope,contractVersionId:uuid(command.contractVersionId,'contractVersionId'),expectedVersion:command.expectedVersion,reasonCode:command.reasonCode,note:command.note.trim(),idempotencyKey:command.idempotencyKey});
  }
  if(Object.keys(command).some(key=>!['errorId','reasonCode','resolutionNote','expectedVersion','idempotencyKey'].includes(key)))throw new FinanceCommandError(400,'INVALID_COMMAND','Retry komutu geçersiz.');
  const errorId=uuid(command.errorId,'errorId');
  if(typeof command.reasonCode!=='string'||!REASON.test(command.reasonCode))throw new FinanceCommandError(400,'INVALID_COMMAND','reasonCode geçersiz.');
  if(typeof command.resolutionNote!=='string'||!command.resolutionNote.trim()||command.resolutionNote.length>2000)throw new FinanceCommandError(400,'INVALID_COMMAND','Çözüm notu 1–2000 karakter olmalıdır.');
  if(!Number.isInteger(command.expectedVersion)||command.expectedVersion<1)throw new FinanceCommandError(400,'INVALID_COMMAND','expectedVersion geçersiz.');
  if(typeof command.idempotencyKey!=='string'||command.idempotencyKey.length<8||command.idempotencyKey.length>200||!/^[A-Za-z0-9:_-]+$/.test(command.idempotencyKey))throw new FinanceCommandError(400,'INVALID_COMMAND','idempotencyKey geçersiz.');
  return Object.freeze({operationId:body.operationId,scope,errorId,reasonCode:command.reasonCode,resolutionNote:command.resolutionNote.trim(),expectedVersion:command.expectedVersion,idempotencyKey:command.idempotencyKey});
}

export function createFinanceCommandHandler({allowedOrigins,authenticate,authorizeRetry,commitRetry,authorizeDisputeCreate,commitDisputeCreate,authorizeDisputeSubmit,commitDisputeSubmit,authorizeFeeRuleUpdate,commitFeeRuleUpdate,authorizeContractVersionSubmit,commitContractVersionSubmit,authorizeContractVersionApprove,commitContractVersionApprove,authorizeContractVersionPublish,commitContractVersionPublish,correlationFactory=()=>crypto.randomUUID(),digest=sha256,maxBodyBytes=16384}={}){
  const origins=new Set(allowedOrigins||[]);const invalid=value=>{try{const u=new URL(value);return value==='*'||u.origin!==value||(u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)));}catch{return true;}};
  if(!origins.size||[...origins].some(invalid))throw new Error('HTTPS veya local HTTP açık origin allowlist zorunludur.');
  if(![authenticate,authorizeRetry,commitRetry,authorizeDisputeCreate,commitDisputeCreate,authorizeDisputeSubmit,commitDisputeSubmit,authorizeFeeRuleUpdate,commitFeeRuleUpdate,authorizeContractVersionSubmit,commitContractVersionSubmit,authorizeContractVersionApprove,commitContractVersionApprove,authorizeContractVersionPublish,commitContractVersionPublish,digest].every(fn=>typeof fn==='function'))throw new Error('Finans komut portları zorunludur.');
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
      const authorized=input.operationId==='retryIntegrationError'?await authorizeRetry({actor,errorId:input.errorId}):input.operationId==='createDispute'?await authorizeDisputeCreate({actor,dealerAccountId:input.dealerAccountId,targetRecordType:input.targetRecordType,targetRecordId:input.targetRecordId}):input.operationId==='submitDispute'?await authorizeDisputeSubmit({actor,disputeId:input.disputeId}):input.operationId==='updateContractFeeRule'?await authorizeFeeRuleUpdate({actor,contractVersionId:input.contractVersionId,feeRuleId:input.feeRuleId}):input.operationId==='submitContractVersion'?await authorizeContractVersionSubmit({actor,contractVersionId:input.contractVersionId}):input.operationId==='approveContractVersion'?await authorizeContractVersionApprove({actor,contractVersionId:input.contractVersionId}):await authorizeContractVersionPublish({actor,contractVersionId:input.contractVersionId});
      if(!authorized?.allowed||authorized.legalEntityId!==input.scope.legalEntityId||authorized.dealerAccountId!==input.scope.dealerAccountId||authorized.branchId!==input.scope.branchId)throw new FinanceCommandError(403,'SCOPE_DENIED','Finans komutu kapsamına erişim reddedildi.');
      if(input.operationId==='updateContractFeeRule'){
        const intentHash=await digest([input.contractVersionId,input.feeRuleId,input.expectedVersion,canonical(input.rule),input.idempotencyKey].join('|'));
        if(!/^[a-f0-9]{64}$/.test(intentHash))throw new FinanceCommandError(503,'DIGEST_UNAVAILABLE','Komut özeti üretilemedi.');
        const result=await commitFeeRuleUpdate({actorId:actor.id,scope:input.scope,dealerLegalEntityId:authorized.dealerLegalEntityId,contractVersionId:input.contractVersionId,feeRuleId:input.feeRuleId,expectedVersion:input.expectedVersion,rule:input.rule,idempotencyKey:input.idempotencyKey,intentHash,correlationId});
        if(!result||!['UPDATED','REPLAY','CONFLICT'].includes(result.outcome))throw new Error('invalid fee rule commit response');
        return json(origin,correlationId,result.outcome==='CONFLICT'?409:200,{data:{outcome:result.outcome,resource:result.resource||null,correlationId}});
      }
      if(input.operationId==='createDispute'){
        const intentHash=await digest([input.dealerAccountId,input.targetRecordType,input.targetRecordId,input.disputedAmount,input.currencyCode,input.reasonCode,input.statementHash||'',canonical(input.documentIds),input.idempotencyKey].join('|'));if(!/^[a-f0-9]{64}$/.test(intentHash))throw new FinanceCommandError(503,'DIGEST_UNAVAILABLE','Komut özeti üretilemedi.');
        const result=await commitDisputeCreate({actorId:actor.id,scope:input.scope,targetRecordType:input.targetRecordType,targetRecordId:input.targetRecordId,disputedAmount:input.disputedAmount,currencyCode:input.currencyCode,reasonCode:input.reasonCode,statementHash:input.statementHash,documentIds:input.documentIds,idempotencyKey:input.idempotencyKey,intentHash,correlationId});if(!result||!['CREATED','REPLAY','CONFLICT'].includes(result.outcome))throw new Error('invalid dispute create response');return json(origin,correlationId,result.outcome==='CONFLICT'?409:200,{data:{...result,correlationId}});
      }
      if(input.operationId==='submitDispute'){
        const noteHash=await digest(input.note);const intentHash=await digest([input.disputeId,input.expectedVersion,input.reasonCode,noteHash,input.idempotencyKey].join('|'));
        if(!/^[a-f0-9]{64}$/.test(noteHash)||!/^[a-f0-9]{64}$/.test(intentHash))throw new FinanceCommandError(503,'DIGEST_UNAVAILABLE','Komut özeti üretilemedi.');
        const result=await commitDisputeSubmit({actorId:actor.id,disputeId:input.disputeId,expectedVersion:input.expectedVersion,reasonCode:input.reasonCode,noteHash,idempotencyKey:input.idempotencyKey,intentHash,correlationId});
        if(!result||!['SUBMITTED','REPLAY','CONFLICT'].includes(result.outcome))throw new Error('invalid dispute submit response');
        return json(origin,correlationId,result.outcome==='CONFLICT'?409:200,{data:{...result,correlationId}});
      }
      if(['submitContractVersion','approveContractVersion','publishContractVersion'].includes(input.operationId)){
        const noteHash=await digest(input.note);const intentHash=await digest([input.operationId,input.contractVersionId,input.expectedVersion,input.reasonCode,noteHash,input.idempotencyKey].join('|'));
        if(!/^[a-f0-9]{64}$/.test(noteHash)||!/^[a-f0-9]{64}$/.test(intentHash))throw new FinanceCommandError(503,'DIGEST_UNAVAILABLE','Komut özeti üretilemedi.');
        const commit=input.operationId==='submitContractVersion'?commitContractVersionSubmit:input.operationId==='approveContractVersion'?commitContractVersionApprove:commitContractVersionPublish;
        const result=await commit({actorId:actor.id,scope:input.scope,dealerLegalEntityId:authorized.dealerLegalEntityId,contractVersionId:input.contractVersionId,expectedVersion:input.expectedVersion,reasonCode:input.reasonCode,note:input.note,noteHash,idempotencyKey:input.idempotencyKey,intentHash,correlationId});
        if(!result||!['SUBMITTED','APPROVED','CREATED','REPLAY','CONFLICT'].includes(result.outcome))throw new Error('invalid contract version lifecycle response');
        return json(origin,correlationId,result.outcome==='CONFLICT'?409:200,{data:{...result,correlationId}});
      }
      const resolutionNoteHash=await digest(input.resolutionNote);
      const intentHash=await digest([input.errorId,input.reasonCode,resolutionNoteHash,input.expectedVersion,input.idempotencyKey].join('|'));
      if(!/^[a-f0-9]{64}$/.test(resolutionNoteHash)||!/^[a-f0-9]{64}$/.test(intentHash))throw new FinanceCommandError(503,'DIGEST_UNAVAILABLE','Komut özeti üretilemedi.');
      const result=await commitRetry({actorId:actor.id,scope:input.scope,errorId:input.errorId,reasonCode:input.reasonCode,resolutionNoteHash,expectedVersion:input.expectedVersion,idempotencyKey:input.idempotencyKey,intentHash,correlationId});
      if(!result||!['QUEUED','REPLAY','CONFLICT'].includes(result.outcome))throw new Error('invalid commit response');
      return json(origin,correlationId,result.outcome==='CONFLICT'?409:200,{data:{outcome:result.outcome,errorId:result.errorId,jobId:result.jobId||null,status:result.status||null,version:result.version??null,correlationId}});
    }catch(error){const known=error instanceof FinanceCommandError;return json(origins.has(origin)?origin:'null',correlationId,known?error.status:500,{error:{code:known?error.code:'INTERNAL_ERROR',message:known?error.message:'Finans komutu tamamlanamadı.'}});}
  };
}
