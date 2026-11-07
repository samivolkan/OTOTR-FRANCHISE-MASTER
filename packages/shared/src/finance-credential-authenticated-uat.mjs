const PROJECT_REF='bsjkohwbtrfwrqcyhsfz';
const BASE_URL=`https://${PROJECT_REF}.supabase.co`;

function fail(code,message){throw Object.assign(new Error(message),{code});}
function required(value,name,min=1){if(typeof value!=='string'||value.trim().length<min)fail('UAT_CREDENTIAL_CONFIGURATION_INVALID',`${name} is missing`);return value.trim();}
async function json(response){return (response.headers.get('content-type')||'').includes('application/json')?response.json().catch(()=>null):null;}

export function createCredentialAuthenticatedFinanceUat({fetchImpl=fetch,runScopeUat,runSecurityUat}={}){
  if(typeof runScopeUat!=='function'||typeof runSecurityUat!=='function')fail('UAT_CREDENTIAL_CONFIGURATION_INVALID','UAT delegates are required');
  async function signIn(email,password,publishableKey){
    const response=await fetchImpl(`${BASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const body=await json(response);
    if(response.status!==200||typeof body?.access_token!=='string'||body.access_token.length<40)fail('UAT_CREDENTIAL_AUTH_FAILED','staging role authentication failed');
    return body.access_token;
  }
  async function signOut(accessToken,publishableKey){
    if(!accessToken)return;
    await fetchImpl(`${BASE_URL}/auth/v1/logout?scope=local`,{method:'POST',headers:{apikey:publishableKey,Authorization:`Bearer ${accessToken}`}}).catch(()=>null);
  }
  return async function run({financeEmail,financePassword,branchManagerEmail,branchManagerPassword,publishableKey,initiator='BRANCH_MANAGER'}){
    const key=required(publishableKey,'publishableKey',24);
    if(!key.startsWith('sb_publishable_'))fail('UAT_CREDENTIAL_CONFIGURATION_INVALID','publishable key is invalid');
    const finance={email:required(financeEmail,'financeEmail'),password:required(financePassword,'financePassword',8)};
    const manager={email:required(branchManagerEmail,'branchManagerEmail'),password:required(branchManagerPassword,'branchManagerPassword',8)};
    if(finance.email.toLowerCase()===manager.email.toLowerCase())fail('UAT_ROLE_SEPARATION_FAILED','role accounts must differ');
    let financeAccessToken,branchManagerAccessToken;
    try{
      [financeAccessToken,branchManagerAccessToken]=await Promise.all([signIn(finance.email,finance.password,key),signIn(manager.email,manager.password,key)]);
      const input={financeAccessToken,branchManagerAccessToken,publishableKey:key};
      const [scopeEvidence,securityEvidence]=await Promise.all([runScopeUat({...input,initiator}),runSecurityUat(input)]);
      return Object.freeze({scopeEvidence,securityEvidence,secretsRecorded:false,tokensRecorded:false,sessionsRevokedAfterRun:true});
    }finally{
      await Promise.all([signOut(financeAccessToken,key),signOut(branchManagerAccessToken,key)]);
    }
  };
}
