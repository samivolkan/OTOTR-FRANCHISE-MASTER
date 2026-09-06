const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/runtime-config.json')));
 const headers={apikey:config.publishableKey,'Content-Type':'application/json',Origin:'https://samivolkan.github.io'};
 const results=[];
 for(const name of ['k360_jobs','k360_identity']){const r=await fetch(config.url+'/rest/v1/rpc/'+name,{method:'POST',headers,body:'{}',signal:AbortSignal.timeout(20000)});assert.ok([401,403].includes(r.status),name+' must deny anonymous callers');results.push({check:'Anonymous '+name,status:r.status});}
 const r=await fetch(config.url+'/functions/v1/kaporta-360-report',{method:'POST',headers,body:JSON.stringify({token:'0'.repeat(64)}),signal:AbortSignal.timeout(20000)});assert.equal(r.status,404);const body=await r.json();assert.equal(body.message,'Paylaşım bulunamadı veya süresi doldu.');results.push({check:'Nonexistent customer token',status:r.status});
 const preflight=await fetch(config.url+'/functions/v1/kaporta-360-report',{method:'OPTIONS',headers:{Origin:'https://samivolkan.github.io','Access-Control-Request-Headers':'apikey,content-type'},signal:AbortSignal.timeout(20000)});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://samivolkan.github.io');results.push({check:'Published ERP CORS preflight',status:preflight.status});
 const noOrigin=await fetch(config.url+'/functions/v1/kaporta-360-report',{method:'POST',headers:{...headers,Origin:'https://untrusted.invalid'},body:'{}',signal:AbortSignal.timeout(20000)});assert.equal(noOrigin.status,403);results.push({check:'Unexpected origin',status:noOrigin.status});
 console.log(JSON.stringify({passed:results.length,results},null,2));fs.writeFileSync(path.join(__dirname,'../.local/pilot-qa/backend-result.json'),JSON.stringify({passed:results.length,results},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
