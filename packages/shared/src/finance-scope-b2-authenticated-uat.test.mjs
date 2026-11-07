import test from 'node:test';
import assert from 'node:assert/strict';
import {createScopeB2AuthenticatedUat} from './finance-scope-b2-authenticated-uat.mjs';

const ids={finance:'10000000-0000-4000-8000-000000000001',manager:'10000000-0000-4000-8000-000000000002',legal:'20000000-0000-4000-8000-000000000001',dealer1:'30000000-0000-4000-8000-000000000001',dealer2:'30000000-0000-4000-8000-000000000002',b1:'40000000-0000-4000-8000-000000000001',b2:'40000000-0000-4000-8000-000000000002'};
const financeToken='f'.repeat(80),managerToken='m'.repeat(80),publishableKey='sb_publishable_'+'p'.repeat(40);
const scope=(code,dealer,branch)=>({legal_entity_id:ids.legal,dealer_account_id:dealer,branch_id:branch,branch_code:code});

test('runs three idempotent operations, verifies 96 TRY in both roles and denies cross-scope',async()=>{
  const calls=[];let operationIndex=0;
  const fetchImpl=async(url,options)=>{
    calls.push({url,options});const auth=options.headers.Authorization;const body=options.body?JSON.parse(options.body):{};
    if(url.endsWith('/auth/v1/user'))return Response.json({id:auth.endsWith(financeToken)?ids.finance:ids.manager});
    if(url.endsWith('/rpc/list_session_branch_scopes'))return Response.json(auth.endsWith(financeToken)?[scope('SCOPE-B1',ids.dealer1,ids.b1),scope('SCOPE-B2',ids.dealer2,ids.b2)]:[scope('SCOPE-B2',ids.dealer2,ids.b2)]);
    if(url.endsWith('/rpc/get_royalty_open_balance')){
      if(auth.endsWith(managerToken)&&body.p_branch_id===ids.b1)return Response.json({code:'42501'},{status:403});
      return Response.json({netGrossAmount:'96.00000000',openDebitGrossAmount:'120.00000000',availableCreditGrossAmount:'24.00000000',currency:'TRY'});
    }
    if(url.endsWith('/functions/v1/finance-erp-demo')){operationIndex++;return Response.json({transactionId:`50000000-0000-4000-8000-00000000000${operationIndex}`,sourceEventId:`60000000-0000-4000-8000-00000000000${operationIndex}`,outcome:operationIndex===2?'REPLAY':'CREATED'});}
    throw new Error('unexpected request');
  };
  let correlation=0;const run=createScopeB2AuthenticatedUat({fetchImpl,clock:()=>new Date('2026-11-07T03:00:00Z'),correlationFactory:()=>`70000000-0000-4000-8000-${String(++correlation).padStart(12,'0')}`});
  const result=await run({financeAccessToken:financeToken,branchManagerAccessToken:managerToken,publishableKey});
  assert.equal(result.operations.length,3);assert.equal(result.scopeMatrix.branchManagerCrossScopeStatus,403);assert.equal(result.royaltyBalance.finance.netGrossAmount,'96.00');assert.equal(result.browserSessionVerified,false);assert.equal(result.tokensRecorded,false);
  assert.deepEqual(result.scopeMatrix.financeVisibleBranchCodes,['SCOPE-B1','SCOPE-B2']);assert.deepEqual(result.scopeMatrix.branchManagerVisibleBranchCodes,['SCOPE-B2']);
  assert.ok(calls.filter(call=>call.url.endsWith('/functions/v1/finance-erp-demo')).every(call=>call.options.headers.Origin==='https://samivolkan.github.io'));
  assert.doesNotMatch(JSON.stringify(result),new RegExp(`${financeToken}|${managerToken}|${publishableKey}`));
});

test('fails closed when branch manager can see another branch',async()=>{
  const fetchImpl=async(url,options)=>{
    const finance=options.headers.Authorization.endsWith(financeToken);
    if(url.endsWith('/auth/v1/user'))return Response.json({id:finance?ids.finance:ids.manager});
    if(url.endsWith('/rpc/list_session_branch_scopes'))return Response.json([scope('SCOPE-B1',ids.dealer1,ids.b1),scope('SCOPE-B2',ids.dealer2,ids.b2)]);
    throw new Error('unexpected request');
  };
  const run=createScopeB2AuthenticatedUat({fetchImpl,correlationFactory:()=>ids.finance});
  await assert.rejects(()=>run({financeAccessToken:financeToken,branchManagerAccessToken:managerToken,publishableKey}),error=>error.code==='UAT_SCOPE_MATRIX_FAILED');
});
