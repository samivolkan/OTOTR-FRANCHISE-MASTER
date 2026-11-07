const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const configuration=message=>Object.assign(new Error(message),{code:'CONFIGURATION_ERROR'});

export function createFinanceErpSessionScopeResolver({supabaseUrl,publishableKey,serviceRoleKey,fetchImpl=fetch}={}){
  let base;try{base=new URL(supabaseUrl);}catch{throw configuration('SUPABASE_URL geçersiz.');}
  if(base.protocol!=='https:'&&!(['localhost','127.0.0.1'].includes(base.hostname)&&base.protocol==='http:'))throw configuration('SUPABASE_URL HTTPS olmalıdır.');
  if(typeof publishableKey!=='string'||!publishableKey.startsWith('sb_publishable_'))throw configuration('Supabase publishable key zorunludur.');
  if(typeof serviceRoleKey!=='string'||serviceRoleKey.length<40||serviceRoleKey===publishableKey)throw configuration('Server-only service role key zorunludur.');
  if(typeof fetchImpl!=='function')throw configuration('fetch zorunludur.');
  const json=async response=>(response.headers.get('content-type')||'').includes('application/json')?response.json().catch(()=>null):null;
  return Object.freeze({async resolve({authorization}={}){
    const token=typeof authorization==='string'?authorization.replace(/^Bearer\s+/i,'').trim():'';
    if(!token||token.startsWith('sb_publishable_')||token===serviceRoleKey)return null;
    const authResponse=await fetchImpl(`${base.origin}/auth/v1/user`,{headers:{apikey:publishableKey,Authorization:`Bearer ${token}`}}).catch(()=>null);
    if(!authResponse?.ok)return null;
    const user=await json(authResponse);if(!UUID.test(user?.id||''))return null;
    const scopeResponse=await fetchImpl(`${base.origin}/rest/v1/rpc/resolve_erp_session_branch_finance_scope`,{method:'POST',headers:{apikey:serviceRoleKey,Authorization:`Bearer ${serviceRoleKey}`,'Content-Type':'application/json','Accept-Profile':'finance_api','Content-Profile':'finance_api'},body:JSON.stringify({p_auth_user_id:user.id.toLowerCase()})}).catch(()=>null);
    if(!scopeResponse?.ok)return null;
    const scope=await json(scopeResponse);
    if(!scope||scope.scopeSource!=='VERIFIED_ERP_SESSION_MAPPING'||scope.actorId!==user.id.toLowerCase()||!['legalEntityId','dealerAccountId','branchId'].every(key=>UUID.test(scope[key]||'')))return null;
    return Object.freeze({actorId:scope.actorId,legalEntityId:scope.legalEntityId.toLowerCase(),dealerAccountId:scope.dealerAccountId.toLowerCase(),branchId:scope.branchId.toLowerCase()});
  }});
}
