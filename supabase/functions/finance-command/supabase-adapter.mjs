const configuration=message=>Object.assign(new Error(message),{code:'CONFIGURATION_ERROR'});
const database=operation=>Object.assign(new Error(`Finance command database operation failed: ${operation}`),{code:'DATABASE_ERROR'});
export function createFinanceCommandSupabaseAdapter({supabaseUrl,publishableKey,serviceRoleKey,fetchImpl=fetch}={}){
  let base;try{base=new URL(supabaseUrl);}catch{throw configuration('SUPABASE_URL geçersiz.');}
  if(base.protocol!=='https:'&&!(['localhost','127.0.0.1'].includes(base.hostname)&&base.protocol==='http:'))throw configuration('SUPABASE_URL HTTPS olmalıdır.');
  if(typeof publishableKey!=='string'||!publishableKey.startsWith('sb_publishable_'))throw configuration('SUPABASE_PUBLISHABLE_KEY zorunludur.');
  if(typeof serviceRoleKey!=='string'||serviceRoleKey.length<40||serviceRoleKey===publishableKey)throw configuration('SUPABASE_SERVICE_ROLE_KEY server-side zorunludur.');
  if(typeof fetchImpl!=='function')throw configuration('fetch zorunludur.');
  const headers=(key,token,profile)=>({apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(profile?{'Accept-Profile':profile,'Content-Profile':profile}:{})});
  async function post(path,key,token,payload,profile){const response=await fetchImpl(`${base.origin}${path}`,{method:'POST',headers:headers(key,token,profile),body:JSON.stringify(payload)});let result=null;if((response.headers?.get?.('content-type')||'').includes('application/json'))result=await response.json().catch(()=>null);if(!response.ok)throw database(path);return result;}
  async function authenticate(token){const response=await fetchImpl(`${base.origin}/auth/v1/user`,{headers:headers(publishableKey,token)});if(!response.ok)return null;const user=await response.json().catch(()=>null);return typeof user?.id==='string'?Object.freeze({id:user.id,token}):null;}
  async function authorizeRetry({actor,errorId}){const result=await post('/rest/v1/rpc/authorize_integration_error_retry_scope',publishableKey,actor.token,{p_error_id:errorId,p_permission:'finance.integration-errors.retry'},'finance_api');return result&&typeof result==='object'?{allowed:result.allowed===true,legalEntityId:result.legalEntityId,dealerAccountId:result.dealerAccountId,branchId:result.branchId}:{allowed:false};}
  async function commitRetry({actorId,scope,errorId,reasonCode,resolutionNoteHash,expectedVersion,idempotencyKey,intentHash,correlationId}){return post('/rest/v1/rpc/commit_integration_error_retry',serviceRoleKey,serviceRoleKey,{p_actor_id:actorId,p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:scope.dealerAccountId,p_branch_id:scope.branchId,p_error_id:errorId,p_reason_code:reasonCode,p_resolution_note_hash:resolutionNoteHash,p_expected_version:expectedVersion,p_idempotency_key:idempotencyKey,p_intent_hash:intentHash,p_correlation_id:correlationId},'finance_api');}
  return Object.freeze({authenticate,authorizeRetry,commitRetry});
}
