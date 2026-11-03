const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CAPABILITY=/^[A-Z][A-Z0-9_]{1,63}$/;
const DATE=/^\d{4}-\d{2}-\d{2}$/;

const validateContext=context=>{
  if(!context||typeof context!=='object'||Array.isArray(context))throw new Error('branch finance access context is required');
  for(const key of ['actorId','legalEntityId','dealerAccountId','branchId'])if(!UUID.test(context[key]||''))throw new Error(`invalid branch finance ${key}`);
  if(!CAPABILITY.test(context.capability||''))throw new Error('invalid branch finance capability');
  if(!DATE.test(context.businessDate||''))throw new Error('invalid branch finance businessDate');
  return Object.freeze({actorId:context.actorId.toLowerCase(),legalEntityId:context.legalEntityId.toLowerCase(),dealerAccountId:context.dealerAccountId.toLowerCase(),branchId:context.branchId.toLowerCase(),capability:context.capability,businessDate:context.businessDate});
};

export function createBranchFinanceAccessClient({endpoint,serviceToken,fetchImpl=fetch,timeoutMs=3000,correlationFactory=()=>crypto.randomUUID()}={}){
  let target;try{target=new URL(endpoint);}catch{throw new Error('finance branch access endpoint is invalid');}
  if(target.protocol!=='https:'&&!(['localhost','127.0.0.1'].includes(target.hostname)&&target.protocol==='http:'))throw new Error('finance branch access endpoint must use HTTPS');
  if(typeof serviceToken!=='string'||serviceToken.length<40)throw new Error('server-only finance branch access token is required');
  if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>10000)throw new Error('finance branch access timeout must be 100-10000 ms');
  return Object.freeze({async authorize(context){const input=validateContext(context);const correlationId=correlationFactory();if(!UUID.test(correlationId||''))return Object.freeze({allowed:false,accessState:'UNKNOWN',denialCode:'ACCESS_DECISION_UNAVAILABLE',correlationId:null});const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{const response=await fetchImpl(target.href,{method:'POST',headers:{Authorization:`Bearer ${serviceToken}`,'Content-Type':'application/json','Correlation-Id':correlationId},body:JSON.stringify(input),signal:controller.signal});const payload=(response.headers.get('content-type')||'').includes('application/json')?await response.json().catch(()=>null):null;const data=payload?.data;if(!data||typeof data.allowed!=='boolean'||!['OPEN','LOCKED_OVERDUE'].includes(data.accessState)||data.capability!==input.capability)return Object.freeze({allowed:false,accessState:'UNKNOWN',denialCode:'ACCESS_DECISION_UNAVAILABLE',correlationId});return Object.freeze({allowed:data.allowed,accessState:data.accessState,denialCode:data.allowed?null:(data.denialCode||'BRANCH_FINANCE_LOCKED'),reasonCode:data.reasonCode||null,blockingOpenItemId:data.blockingOpenItemId||null,blockingOpenAmount:data.blockingOpenAmount||null,currency:data.currency||null,correlationId:data.correlationId||correlationId});}catch{return Object.freeze({allowed:false,accessState:'UNKNOWN',denialCode:'ACCESS_DECISION_UNAVAILABLE',correlationId});}finally{clearTimeout(timer);}}});
}

export function createBranchFinanceRouteGuard({accessClient,resolveContext,onDenied}={}){
  if(!accessClient||typeof accessClient.authorize!=='function'||typeof resolveContext!=='function'||typeof onDenied!=='function')throw new Error('finance route guard ports are required');
  return handler=>{if(typeof handler!=='function')throw new Error('finance guarded route handler is required');return async requestContext=>{let context;try{context=await resolveContext(requestContext);}catch{return onDenied(requestContext,Object.freeze({allowed:false,accessState:'UNKNOWN',denialCode:'ACCESS_CONTEXT_UNAVAILABLE'}));}let decision;try{decision=await accessClient.authorize(context);}catch{decision=Object.freeze({allowed:false,accessState:'UNKNOWN',denialCode:'ACCESS_DECISION_UNAVAILABLE'});}if(!decision.allowed)return onDenied(requestContext,decision);return handler(requestContext,decision);};};
}
