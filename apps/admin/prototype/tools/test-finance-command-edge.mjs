import assert from 'node:assert/strict';
import {createFinanceCommandHandler} from '../../../../supabase/functions/finance-command/core.mjs';
import {createFinanceCommandSupabaseAdapter} from '../../../../supabase/functions/finance-command/supabase-adapter.mjs';

const origin='https://erp.ototr.test';
const ids={legalEntityId:'11111111-1111-4111-8111-111111111111',dealerAccountId:'22222222-2222-4222-8222-222222222222',branchId:'33333333-3333-4333-8333-333333333333'};
const actorId='44444444-4444-4444-8444-444444444444',errorId='55555555-5555-4555-8555-555555555555',jobId='66666666-6666-4666-8666-666666666666',correlationId='77777777-7777-4777-8777-777777777777';
const token=`user-token-${'x'.repeat(32)}`;let commitInput;
const ports={
  authenticate:async value=>({id:actorId,token:value}),
  authorizeRetry:async()=>({allowed:true,...ids}),
  commitRetry:async value=>{commitInput=value;return {outcome:'QUEUED',errorId,jobId,status:'QUEUED',version:2};},
};
const handler=createFinanceCommandHandler({allowedOrigins:[origin],correlationFactory:()=>correlationId,...ports});
const command={operationId:'retryIntegrationError',scope:ids,command:{errorId,reasonCode:'TIMEOUT_RETRY',resolutionNote:'  ERP bağlantısı doğrulandı; tekrar kuyruğa alınsın.  ',expectedVersion:1,idempotencyKey:'retry:erp:001'}};
const request=(body=command,extra={})=>new Request('https://project.supabase.co/functions/v1/finance-command',{method:extra.method||'POST',headers:{Origin:extra.origin||origin,Authorization:extra.authorization||`Bearer ${token}`,'Content-Type':extra.contentType||'application/json','Correlation-Id':correlationId},body:(extra.method||'POST')==='POST'?JSON.stringify(body):undefined});
let response=await handler(request());assert.equal(response.status,200);let payload=await response.json();assert.equal(payload.data.outcome,'QUEUED');assert.equal(payload.data.jobId,jobId);assert.equal(commitInput.actorId,actorId);assert.equal(commitInput.correlationId,correlationId);assert.match(commitInput.resolutionNoteHash,/^[a-f0-9]{64}$/);assert.match(commitInput.intentHash,/^[a-f0-9]{64}$/);assert.doesNotMatch(JSON.stringify(commitInput),/bağlantısı doğrulandı/i);
const conflictHandler=createFinanceCommandHandler({allowedOrigins:[origin],correlationFactory:()=>correlationId,...ports,commitRetry:async()=>({outcome:'CONFLICT',errorId})});response=await conflictHandler(request());assert.equal(response.status,409);assert.equal((await response.json()).data.outcome,'CONFLICT');
const deniedHandler=createFinanceCommandHandler({allowedOrigins:[origin],correlationFactory:()=>correlationId,...ports,authorizeRetry:async()=>({allowed:true,...ids,branchId:'88888888-8888-4888-8888-888888888888'})});response=await deniedHandler(request());assert.equal(response.status,403);assert.equal((await response.json()).error.code,'SCOPE_DENIED');
assert.equal((await handler(request({...command,operationId:'rawRpc'}))).status,403);
assert.equal((await handler(request({...command,command:{...command.command,resolutionNote:''}}))).status,400);
assert.equal((await handler(request({...command,command:{...command.command,unexpected:'secret'}}))).status,400);
assert.equal((await handler(request(command,{origin:'https://evil.test'}))).status,403);
assert.equal((await handler(request(command,{method:'GET'}))).status,405);

const fetchCalls=[];const jsonResponse=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
const publishableKey=`sb_publishable_${'p'.repeat(32)}`,serviceRoleKey=`service-role-${'s'.repeat(64)}`;
const adapter=createFinanceCommandSupabaseAdapter({supabaseUrl:'https://project.supabase.co/path',publishableKey,serviceRoleKey,fetchImpl:async(url,options)=>{fetchCalls.push({url,options});if(url.endsWith('/auth/v1/user'))return jsonResponse(200,{id:actorId});if(url.endsWith('/authorize_integration_error_retry_scope'))return jsonResponse(200,{allowed:true,...ids});return jsonResponse(200,{outcome:'QUEUED',errorId,jobId,status:'QUEUED',version:2});}});
const actor=await adapter.authenticate(token);const authorization=await adapter.authorizeRetry({actor,errorId});assert.deepEqual(authorization,{allowed:true,...ids});await adapter.commitRetry(commitInput);
assert.equal(fetchCalls[1].options.headers.apikey,publishableKey);assert.equal(fetchCalls[1].options.headers.Authorization,`Bearer ${token}`);assert.equal(fetchCalls[2].options.headers.apikey,serviceRoleKey);assert.equal(fetchCalls[2].options.headers.Authorization,`Bearer ${serviceRoleKey}`);assert.doesNotMatch(fetchCalls[2].options.body,/bağlantısı doğrulandı/i);assert.match(fetchCalls[2].options.body,/p_resolution_note_hash/);
assert.throws(()=>createFinanceCommandSupabaseAdapter({supabaseUrl:'https://project.supabase.co',publishableKey,serviceRoleKey:publishableKey}),/SERVICE_ROLE/);
console.log('PASS finance-command-edge: user authorization, canonical scope, server-only commit, hashing, replay conflict and safe errors');
