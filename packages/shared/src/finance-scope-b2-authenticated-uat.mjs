import {createHash, randomUUID} from 'node:crypto';

const PROJECT_REF='bsjkohwbtrfwrqcyhsfz';
const BASE_URL=`https://${PROJECT_REF}.supabase.co`;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(code,message){throw Object.assign(new Error(message),{code});}
function token(value,name){if(typeof value!=='string'||value.length<40)fail('UAT_CONFIGURATION_INVALID',`${name} is missing`);return value;}
function key(value){if(typeof value!=='string'||!value.startsWith('sb_publishable_')||value.length<24)fail('UAT_CONFIGURATION_INVALID','publishable key is invalid');return value;}
function sha(value){return createHash('sha256').update(value).digest('hex');}
async function json(response){const type=response.headers.get('content-type')||'';return type.includes('application/json')?response.json().catch(()=>null):null;}

export function createScopeB2AuthenticatedUat({fetchImpl=fetch,clock=()=>new Date(),correlationFactory=randomUUID}={}){
  async function request(path,{accessToken,publishableKey,method='POST',body,profile,origin}={}){
    const correlationId=correlationFactory();
    if(!UUID.test(correlationId))fail('UAT_CORRELATION_INVALID','correlation id is invalid');
    const headers={apikey:publishableKey,Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json','Correlation-Id':correlationId};
    if(profile){headers['Accept-Profile']=profile;headers['Content-Profile']=profile;}
    if(origin)headers.Origin=origin;
    const response=await fetchImpl(BASE_URL+path,{method,headers,...(body!==undefined&&{body:JSON.stringify(body)})});
    return {response,payload:await json(response),correlationId};
  }

  async function identity(accessToken,publishableKey){
    const {response,payload}=await request('/auth/v1/user',{accessToken,publishableKey,method:'GET'});
    if(response.status!==200||!UUID.test(payload?.id))fail('UAT_AUTH_INVALID','authenticated user lookup failed');
    return {id:payload.id,identitySha256:sha(payload.id)};
  }

  async function scopes(accessToken,publishableKey){
    const {response,payload}=await request('/rest/v1/rpc/list_session_branch_scopes',{accessToken,publishableKey,body:{},profile:'finance_api'});
    if(response.status!==200||!Array.isArray(payload))fail('UAT_SCOPE_DISCOVERY_FAILED','finance scope discovery failed');
    return payload.map(item=>({legalEntityId:item.legal_entity_id,dealerAccountId:item.dealer_account_id,branchId:item.branch_id,branchCode:item.branch_code}));
  }

  async function balance(accessToken,publishableKey,scope){
    const {response,payload}=await request('/rest/v1/rpc/get_royalty_open_balance',{accessToken,publishableKey,profile:'finance_api',body:{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:scope.dealerAccountId,p_branch_id:scope.branchId}});
    return {status:response.status,payload};
  }

  return async function run({financeAccessToken,branchManagerAccessToken,initiator='BRANCH_MANAGER',publishableKey}){
    const financeToken=token(financeAccessToken,'financeAccessToken');
    const managerToken=token(branchManagerAccessToken,'branchManagerAccessToken');
    const publicKey=key(publishableKey);
    if(!['FINANCE','BRANCH_MANAGER'].includes(initiator))fail('UAT_CONFIGURATION_INVALID','initiator is invalid');

    const [financeIdentity,managerIdentity,financeScopes,managerScopes]=await Promise.all([
      identity(financeToken,publicKey),identity(managerToken,publicKey),scopes(financeToken,publicKey),scopes(managerToken,publicKey)
    ]);
    if(financeIdentity.id===managerIdentity.id)fail('UAT_ROLE_SEPARATION_FAILED','finance and branch manager identities must differ');
    const financeB1=financeScopes.find(scope=>scope.branchCode==='SCOPE-B1');
    const financeB2=financeScopes.find(scope=>scope.branchCode==='SCOPE-B2');
    const managerB2=managerScopes.find(scope=>scope.branchCode==='SCOPE-B2');
    if(!financeB1||!financeB2||!managerB2||managerScopes.some(scope=>scope.branchCode!=='SCOPE-B2'))fail('UAT_SCOPE_MATRIX_FAILED','role scope matrix is invalid');
    if(financeB2.legalEntityId!==managerB2.legalEntityId||financeB2.dealerAccountId!==managerB2.dealerAccountId||financeB2.branchId!==managerB2.branchId)fail('UAT_SCOPE_MATRIX_FAILED','SCOPE-B2 identifiers differ by role');

    const cross=await balance(managerToken,publicKey,financeB1);
    if(cross.status!==403)fail('UAT_CROSS_SCOPE_NOT_DENIED','branch manager cross-scope request was not denied');

    const operationToken=initiator==='FINANCE'?financeToken:managerToken;
    const operations=[];
    for(const operation of ['collection-600','collection-400','refund-200']){
      const {response,payload,correlationId}=await request('/functions/v1/finance-erp-demo',{accessToken:operationToken,publishableKey:publicKey,body:{operation},origin:'https://samivolkan.github.io'});
      if(response.status!==200||!UUID.test(payload?.transactionId)||!UUID.test(payload?.sourceEventId)||!['CREATED','REPLAY'].includes(payload?.outcome))fail('UAT_ERP_OPERATION_FAILED',`${operation} failed`);
      operations.push({operation,status:response.status,outcome:payload.outcome,correlationIdSha256:sha(correlationId)});
    }

    const [financeBalance,managerBalance]=await Promise.all([balance(financeToken,publicKey,financeB2),balance(managerToken,publicKey,managerB2)]);
    for(const [role,result] of [['FINANCE',financeBalance],['BRANCH_MANAGER',managerBalance]]){
      if(result.status!==200||Number(result.payload?.netGrossAmount)!==96||result.payload?.currency!=='TRY')fail('UAT_BALANCE_MISMATCH',`${role} royalty balance mismatch`);
    }
    return Object.freeze({
      schemaVersion:1,module:'OTOTR_FRANCHISE_FINANCE',target:'STAGING_AUTHENTICATED_API_UAT',environment:'ototr-staging',projectRef:PROJECT_REF,
      executedAtUtc:clock().toISOString(),initiatorRole:initiator,productionDataUsed:false,dataClassification:'SYNTHETIC_AGGREGATE_ONLY',
      identities:{financeIdentitySha256:financeIdentity.identitySha256,branchManagerIdentitySha256:managerIdentity.identitySha256,distinct:true},
      scopeMatrix:{financeVisibleBranchCodes:financeScopes.map(x=>x.branchCode).sort(),branchManagerVisibleBranchCodes:managerScopes.map(x=>x.branchCode).sort(),branchManagerCrossScopeStatus:cross.status},
      operations,royaltyBalance:{finance:{status:financeBalance.status,netGrossAmount:'96.00',currency:'TRY'},branchManager:{status:managerBalance.status,netGrossAmount:'96.00',currency:'TRY'}},
      secretsRecorded:false,tokensRecorded:false,browserSessionVerified:false,preProductionDecision:'NO_GO'
    });
  };
}
