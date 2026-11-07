import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {resolveStagingToken,signInWithPassword} from './finance-staging-auth.mjs';

const token='staging-user-token-with-safe-test-length';
let received=null;
const server=createServer(async(request,response)=>{
  const chunks=[];for await(const chunk of request)chunks.push(chunk);
  received={url:request.url,apikey:request.headers.apikey,authorization:request.headers.authorization,body:JSON.parse(Buffer.concat(chunks).toString('utf8'))};
  response.writeHead(200,{'content-type':'application/json'});response.end(JSON.stringify({access_token:token}));
});
server.listen(0,'127.0.0.1');await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;

try{
  const result=await signInWithPassword({base,publishableKey:'sb_publishable_test',email:'finance@example.test',password:'safe-password'});
  assert.equal(result,token);assert.equal(received.url,'/auth/v1/token?grant_type=password');assert.equal(received.apikey,'sb_publishable_test');assert.equal(received.authorization,undefined);assert.deepEqual(received.body,{email:'finance@example.test',password:'safe-password'});
  assert.equal(await resolveStagingToken('finance',{base,publishableKey:'sb_publishable_test',environment:{OTOTR_STAGING_FINANCE_TOKEN:token}}),token);
  await assert.rejects(()=>resolveStagingToken('manager',{base,publishableKey:'sb_publishable_test',environment:{}}),/STAGING_CREDENTIALS_REQUIRED/);
  await assert.rejects(()=>signInWithPassword({base:'http://example.test',publishableKey:'sb_publishable_test',email:'finance@example.test',password:'safe-password'}),/STAGING_AUTH_BASE_INVALID/);
  console.log('PASS finance-staging-auth: password login, token fallback and safe failure contract');
}finally{server.close();await once(server,'close');}
