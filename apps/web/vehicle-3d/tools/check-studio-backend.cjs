// Read-only public boundary probes. Never creates a session or uses real customer fixtures.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
(async()=>{const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/runtime-config.json'),'utf8'));
 if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(config.url)||!config.publishableKey.startsWith('sb_publishable_'))throw Error('Expected public runtime config');
 const headers={apikey:config.publishableKey,'Content-Type':'application/json'},edge=config.url+'/functions/v1/kaporta-360-report',checks=[];
 const check=async(name,url,options,expected)=>{const r=await fetch(url,options);assert.equal(r.status,expected,name);checks.push({name,status:r.status});console.log('PASS '+name+' ('+r.status+')');};
 await check('Anonymous work-order preparation denied',config.url+'/rest/v1/rpc/k360_save_studio',{method:'POST',headers,body:JSON.stringify({session_id:crypto.randomUUID(),expected_revision:1,payload:{}})},401);
 await check('Nonexistent customer capability rejected',edge,{method:'POST',headers:{...headers,Origin:'https://samivolkan.github.io'},body:JSON.stringify({token:crypto.randomBytes(32).toString('hex')})},404);
 await check('Unexpected origin rejected',edge,{method:'POST',headers:{...headers,Origin:'https://untrusted.example'},body:'{}'},403);
 await check('Authorized origin preflight accepted',edge,{method:'OPTIONS',headers:{Origin:'https://samivolkan.github.io'}},204);
 fs.writeFileSync(path.join(__dirname,'../.local/studio-backend-qa.json'),JSON.stringify({checkedAt:new Date().toISOString(),checks},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
