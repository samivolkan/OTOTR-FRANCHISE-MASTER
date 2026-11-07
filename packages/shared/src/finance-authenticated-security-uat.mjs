import {createHash,randomUUID} from 'node:crypto';

const PROJECT_REF='bsjkohwbtrfwrqcyhsfz';
const BASE_URL=`https://${PROJECT_REF}.supabase.co`;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FORBIDDEN_KEY=/(customer.?name|full.?name|phone|email|plate|tckn|vkn|iban|bank.?account|card.?number|cvv|cvc|authorization|access.?token|refresh.?token|service.?role|raw.?payload)/i;

function fail(code,message){throw Object.assign(new Error(message),{code});}
function required(value,name,min=40){if(typeof value!=='string'||value.length<min)fail('SECURITY_UAT_CONFIGURATION_INVALID',`${name} is missing`);return value;}
function sha(value){return createHash('sha256').update(value).digest('hex');}
async function payload(response){return (response.headers.get('content-type')||'').includes('application/json')?response.json().catch(()=>null):null;}
function assertMinimized(value,path='$'){
  if(value===null||value===undefined)return;
  if(Array.isArray(value)){value.forEach((item,index)=>assertMinimized(item,`${path}[${index}]`));return;}
  if(typeof value==='object')for(const [key,item] of Object.entries(value)){if(FORBIDDEN_KEY.test(key))fail('SECURITY_UAT_DATA_MINIMIZATION_FAILED',`forbidden response field at ${path}.${key}`);assertMinimized(item,`${path}.${key}`);}
}

export function createFinanceAuthenticatedSecurityUat({fetchImpl=fetch,clock=()=>new Date(),correlationFactory=randomUUID}={}){
  async function request(path,{accessToken,publishableKey,body,origin='https://samivolkan.github.io',method='POST'}={}){
    const correlationId=correlationFactory();if(!UUID.test(correlationId))fail('SECURITY_UAT_CORRELATION_INVALID','correlation id is invalid');
    const headers={apikey:publishableKey,'Content-Type':'application/json','Correlation-Id':correlationId,Origin:origin};if(accessToken)headers.Authorization=`Bearer ${accessToken}`;
    const response=await fetchImpl(BASE_URL+path,{method,headers,...(body!==undefined&&{body:JSON.stringify(body)})});
    return {status:response.status,payload:await payload(response),correlationId};
  }
  async function identity(token,key){const result=await request('/auth/v1/user',{accessToken:token,publishableKey:key,method:'GET',origin:undefined});if(result.status!==200||!UUID.test(result.payload?.id))fail('SECURITY_UAT_AUTH_FAILED','user lookup failed');return {id:result.payload.id,hash:sha(result.payload.id)};}
  async function scopes(token,key){const result=await request('/rest/v1/rpc/list_session_branch_scopes',{accessToken:token,publishableKey:key,body:{},origin:undefined});if(result.status!==200||!Array.isArray(result.payload))fail('SECURITY_UAT_SCOPE_DISCOVERY_FAILED','scope discovery failed');return result.payload.map(x=>({legalEntityId:x.legal_entity_id,dealerAccountId:x.dealer_account_id,branchId:x.branch_id,branchCode:x.branch_code}));}
  const readBody=(operationId,scope)=>({operationId,scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:operationId==='exportDealerFinanceSummary'?{asOf:'2026-11-07'}:{}});
  async function financeRead(token,key,operationId,scope,origin){return request('/functions/v1/finance-read',{accessToken:token,publishableKey:key,body:readBody(operationId,scope),origin});}

  return async function run({financeAccessToken,branchManagerAccessToken,publishableKey}){
    const financeToken=required(financeAccessToken,'financeAccessToken');const managerToken=required(branchManagerAccessToken,'branchManagerAccessToken');const key=required(publishableKey,'publishableKey',24);
    if(!key.startsWith('sb_publishable_'))fail('SECURITY_UAT_CONFIGURATION_INVALID','publishable key is invalid');
    const [financeIdentity,managerIdentity,financeScopes,managerScopes]=await Promise.all([identity(financeToken,key),identity(managerToken,key),scopes(financeToken,key),scopes(managerToken,key)]);
    if(financeIdentity.id===managerIdentity.id)fail('SECURITY_UAT_ROLE_SEPARATION_FAILED','role identities must differ');
    const b1=financeScopes.find(x=>x.branchCode==='SCOPE-B1'),financeB2=financeScopes.find(x=>x.branchCode==='SCOPE-B2'),managerB2=managerScopes.find(x=>x.branchCode==='SCOPE-B2');
    if(!b1||!financeB2||!managerB2||managerScopes.length!==1||managerScopes[0].branchCode!=='SCOPE-B2')fail('SECURITY_UAT_SCOPE_MATRIX_FAILED','role scope matrix is invalid');
    const [financeOwn,managerOwn,managerCross,managerExport,managerCrossExport,anonymousRead,badOrigin]=await Promise.all([
      financeRead(financeToken,key,'getDealerFinanceSummary',b1),financeRead(managerToken,key,'getDealerFinanceSummary',managerB2),financeRead(managerToken,key,'getDealerFinanceSummary',b1),
      financeRead(managerToken,key,'exportDealerFinanceSummary',managerB2),financeRead(managerToken,key,'exportDealerFinanceSummary',b1),financeRead(null,key,'getDealerFinanceSummary',managerB2),financeRead(managerToken,key,'getDealerFinanceSummary',managerB2,'https://evil.example')
    ]);
    const expected=[['finance own summary',financeOwn,200],['manager own summary',managerOwn,200],['manager cross summary',managerCross,403],['manager own export',managerExport,200],['manager cross export',managerCrossExport,403],['anonymous read',anonymousRead,401],['invalid origin',badOrigin,403]];
    for(const [name,result,status] of expected)if(result.status!==status)fail('SECURITY_UAT_STATUS_MISMATCH',`${name} expected ${status}, got ${result.status}`);
    assertMinimized(financeOwn.payload);assertMinimized(managerOwn.payload);assertMinimized(managerExport.payload);
    return Object.freeze({schemaVersion:1,module:'OTOTR_FRANCHISE_FINANCE',target:'STAGING_AUTHENTICATED_SECURITY_UAT',environment:'ototr-staging',projectRef:PROJECT_REF,executedAtUtc:clock().toISOString(),productionDataUsed:false,dataClassification:'SYNTHETIC_AGGREGATE_ONLY',identities:{financeIdentitySha256:financeIdentity.hash,branchManagerIdentitySha256:managerIdentity.hash,distinct:true},scopeMatrix:{financeVisibleBranchCodes:financeScopes.map(x=>x.branchCode).sort(),branchManagerVisibleBranchCodes:managerScopes.map(x=>x.branchCode).sort()},controls:{idorCrossScopeStatus:managerCross.status,exportOwnScopeStatus:managerExport.status,exportCrossScopeStatus:managerCrossExport.status,anonymousStatus:anonymousRead.status,invalidOriginStatus:badOrigin.status,responseDataMinimized:true},correlationEvidenceSha256:expected.map(([,result])=>sha(result.correlationId)),secretsRecorded:false,tokensRecorded:false,browserSessionVerified:false,preProductionDecision:'NO_GO'});
  };
}
