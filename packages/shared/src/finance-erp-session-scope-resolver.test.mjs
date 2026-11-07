import assert from 'node:assert/strict';
import {createFinanceErpSessionScopeResolver} from './finance-erp-session-scope-resolver.mjs';
const id=n=>`${String(n).padStart(8,'0')}-1111-4111-8111-${String(n).padStart(12,'0')}`;
const publishableKey='sb_publishable_test';
const serviceRoleKey='server-only-service-role-key-longer-than-forty-characters';
const calls=[];
const resolver=createFinanceErpSessionScopeResolver({supabaseUrl:'https://example.supabase.co',publishableKey,serviceRoleKey,fetchImpl:async(url,options={})=>{
  calls.push({url,options});
  if(url.endsWith('/auth/v1/user'))return Response.json({id:id(1)});
  return Response.json({actorId:id(1),legalEntityId:id(2),dealerAccountId:id(3),branchId:id(4),scopeSource:'VERIFIED_ERP_SESSION_MAPPING'});
}});
const scope=await resolver.resolve({authorization:'Bearer signed-user-jwt'});
assert.deepEqual(scope,{actorId:id(1),legalEntityId:id(2),dealerAccountId:id(3),branchId:id(4)});
assert.equal(calls.length,2);
assert.equal(calls[0].options.headers.apikey,publishableKey);
assert.equal(calls[1].options.headers.Authorization,`Bearer ${serviceRoleKey}`);
assert.deepEqual(JSON.parse(calls[1].options.body),{p_auth_user_id:id(1)});
assert.equal(await resolver.resolve({authorization:`Bearer ${publishableKey}`}),null);
assert.equal(await resolver.resolve({authorization:`Bearer ${serviceRoleKey}`}),null);

const forged=createFinanceErpSessionScopeResolver({supabaseUrl:'https://example.supabase.co',publishableKey,serviceRoleKey,fetchImpl:async url=>url.endsWith('/auth/v1/user')?Response.json({id:id(1)}):Response.json({actorId:id(9),legalEntityId:id(2),dealerAccountId:id(3),branchId:id(4),scopeSource:'VERIFIED_ERP_SESSION_MAPPING'})});
assert.equal(await forged.resolve({authorization:'Bearer signed-user-jwt'}),null);
const outage=createFinanceErpSessionScopeResolver({supabaseUrl:'https://example.supabase.co',publishableKey,serviceRoleKey,fetchImpl:async()=>{throw new Error('down');}});
assert.equal(await outage.resolve({authorization:'Bearer signed-user-jwt'}),null);
assert.throws(()=>createFinanceErpSessionScopeResolver({supabaseUrl:'http://example.test',publishableKey,serviceRoleKey}),/HTTPS/);
console.log('PASS finance ERP session scope resolver: user JWT authentication, server-only mapping, actor binding, secret rejection and fail-closed outage');
