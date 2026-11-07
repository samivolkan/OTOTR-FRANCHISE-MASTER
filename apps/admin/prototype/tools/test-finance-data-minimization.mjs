import assert from 'node:assert/strict';
import {assertFinanceDataMinimized} from './finance-data-minimization.mjs';

assert.equal(assertFinanceDataMinimized({branchId:'11111111-1111-4111-8111-111111111111',accrued:{grossAmount:'96.00'},rawRecordsExposed:false}),true);
for(const unsafe of [
  {payload:{customer:'x'}},
  {customerEmail:'person@example.test'},
  {document:{objectKey:'private/path'}},
  {rawPayloadExposed:true},
  {authorization:'Bearer abcdefghijklmnopqrstuvwxyz123456'},
  {nested:{accessToken:'eyJabcdefghijklmnopqrstuvwxyz.abcdefghijklmno.abcdefghijklmno'}}
])assert.throws(()=>assertFinanceDataMinimized(unsafe),/(forbidden field|unsafe exposure marker|secret-like value)/);
console.log('PASS finance-data-minimization: safe projection accepted; raw, PII, storage and token fields rejected');
