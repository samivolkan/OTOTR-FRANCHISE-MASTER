const HTTPS_OR_LOCAL=/^https:\/\//i;

function safeBase(value){
  const url=new URL(value);
  if(!HTTPS_OR_LOCAL.test(url.origin)&&!(['localhost','127.0.0.1'].includes(url.hostname)&&url.protocol==='http:'))throw new Error('STAGING_AUTH_BASE_INVALID');
  return url.origin;
}

export async function signInWithPassword({base,publishableKey,email,password,fetchImpl=fetch}){
  if(typeof publishableKey!=='string'||!publishableKey.startsWith('sb_publishable_'))throw new Error('STAGING_PUBLISHABLE_KEY_REQUIRED');
  if(typeof email!=='string'||!email.includes('@')||typeof password!=='string'||password.length<8)throw new Error('STAGING_CREDENTIALS_REQUIRED');
  const response=await fetchImpl(`${safeBase(base)}/auth/v1/token?grant_type=password`,{
    method:'POST',signal:AbortSignal.timeout(15000),headers:{apikey:publishableKey,'content-type':'application/json'},
    body:JSON.stringify({email,password})
  });
  const body=await response.json().catch(()=>null);
  if(!response.ok||typeof body?.access_token!=='string'||body.access_token.length<20)throw new Error('STAGING_AUTH_FAILED');
  return body.access_token;
}

export async function resolveStagingToken(role,{base,publishableKey,environment=process.env,fetchImpl=fetch}={}){
  const prefix=`OTOTR_STAGING_${role.toUpperCase()}`;
  const existing=environment[`${prefix}_TOKEN`];
  if(typeof existing==='string'&&existing.length>=20)return existing;
  return signInWithPassword({base,publishableKey,email:environment[`${prefix}_EMAIL`],password:environment[`${prefix}_PASSWORD`],fetchImpl});
}
