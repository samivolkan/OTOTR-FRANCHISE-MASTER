import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot=join(dirname(fileURLToPath(import.meta.url)),'..','..','..','..');
const coverage=JSON.parse(await readFile(join(repoRoot,'docs','finance','erp-ui-coverage.json'),'utf8'));
const ui=await readFile(join(repoRoot,'apps','admin','prototype','bayi-portal','assets','finance-ui.js'),'utf8');
const bridge=await readFile(join(repoRoot,'apps','admin','prototype','bayi-portal','assets','finance-api-bridge.mjs'),'utf8');
const uiIds=[...ui.matchAll(/\['(SCR-\d{2})','/g)].map(match=>match[1]);
const allowed=new Set(['SHELL_ONLY','PARTIAL_LIVE_READ','PARTIAL_LIVE_WRITE','LIVE_READ_VERIFIED','LIVE_WRITE']);

assert.equal(coverage.schemaVersion,1);
assert.equal(coverage.module,'OTOTR_FRANCHISE_FINANCE');
assert.equal(coverage.policy.shellIsNotComplete,true);
assert.equal(coverage.policy.demoFallbackAllowed,false);
assert.equal(coverage.policy.productionDataUsed,false);
assert.equal(coverage.releaseDecision,'NO_GO');
assert.equal(coverage.screens.length,17);
assert.deepEqual(coverage.screens.map(screen=>screen.id),uiIds);
assert.equal(new Set(uiIds).size,17);

for(const screen of coverage.screens){
  assert.ok(allowed.has(screen.status),`${screen.id} status invalid`);
  assert.ok(Array.isArray(screen.operations)&&Array.isArray(screen.evidence)&&Array.isArray(screen.remaining));
  if(screen.status==='SHELL_ONLY'){
    assert.equal(screen.operations.length,0,`${screen.id} shell cannot claim operations`);
    assert.ok(screen.remaining.length>0,`${screen.id} shell must disclose remaining work`);
  }else{
    assert.ok(screen.operations.length>0,`${screen.id} live status requires operations`);
    assert.ok(screen.evidence.length>0,`${screen.id} live status requires evidence`);
    for(const evidence of screen.evidence) await access(join(repoRoot,evidence));
  }
}
for(const capability of coverage.crossScreenCapabilities){
  assert.equal(capability.status,'LIVE_READ_VERIFIED');
  assert.ok(coverage.screens.some(screen=>screen.id===capability.hostScreen));
  assert.match(bridge,new RegExp(capability.operation));
}

const counts=Object.fromEntries([...allowed].map(status=>[status,coverage.screens.filter(screen=>screen.status===status).length]));
assert.deepEqual(counts,{SHELL_ONLY:0,PARTIAL_LIVE_READ:8,PARTIAL_LIVE_WRITE:4,LIVE_READ_VERIFIED:3,LIVE_WRITE:2});
console.log(`PASS finance-ui-coverage: 17 screens; liveWrite=${counts.LIVE_WRITE}; verifiedRead=${counts.LIVE_READ_VERIFIED}; partialRead=${counts.PARTIAL_LIVE_READ}; partialWrite=${counts.PARTIAL_LIVE_WRITE}; shell=${counts.SHELL_ONLY}; decision=NO_GO`);
