import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';

const base = 'https://bsjkohwbtrfwrqcyhsfz.supabase.co';
const origin = 'http://127.0.0.1:42733';
const key = process.env.OTOTR_STAGING_PUBLISHABLE_KEY;
const financeToken = process.env.OTOTR_STAGING_FINANCE_TOKEN;
const managerToken = process.env.OTOTR_STAGING_MANAGER_TOKEN;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function scopeFromEnvironment(name) {
  const values = (process.env[name] || '').split(',');
  if (values.length !== 3 || !values.every(value => uuid.test(value))) {
    throw new Error(name + ' must contain legal entity, dealer account and branch UUIDs');
  }
  const [legalEntityId, dealerAccountId, branchId] = values;
  return {legalEntityId, dealerAccountId, branchId};
}

async function read(token, scope) {
  const response = await fetch(base + '/functions/v1/finance-read', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      apikey: key, authorization: 'Bearer ' + token, origin,
      'content-type': 'application/json', 'correlation-id': randomUUID()
    },
    body: JSON.stringify({
      operationId: 'getDealerFinanceSummary',
      scope,
      pathParams: {dealerAccountId: scope.dealerAccountId},
      query: {asOf: process.env.OTOTR_STAGING_FIXTURE_DATE}
    })
  });
  return {status: response.status, body: await response.json().catch(() => null)};
}

try {
  assert.ok(key?.startsWith('sb_publishable_'), 'Staging publishable key is required');
  assert.ok(financeToken && managerToken && financeToken !== managerToken, 'Two separate staging Auth sessions are required');
  assert.match(process.env.OTOTR_STAGING_FIXTURE_DATE || '', /^\d{4}-\d{2}-\d{2}$/);
  const branchA = scopeFromEnvironment('OTOTR_STAGING_SCOPE_A');
  const branchB = scopeFromEnvironment('OTOTR_STAGING_SCOPE_B');
  assert.equal(branchA.legalEntityId, branchB.legalEntityId, 'Branches must share a headquarters');
  assert.notEqual(branchA.branchId, branchB.branchId, 'Two distinct branches are required');

  for (const [label, token, scope] of [
    ['Finance branch A', financeToken, branchA],
    ['Finance branch B', financeToken, branchB],
    ['Manager branch A', managerToken, branchA]
  ]) {
    const result = await read(token, scope);
    assert.equal(result.status, 200, label + ' expected HTTP 200');
    assert.ok(result.body?.data?.branchId === scope.branchId, label + ' returned an unexpected branch');
    assert.ok(result.body?.data?.accrued?.grossAmount != null, label + ' returned no fixture balance');
    console.log('PASS ' + label);
  }
  const denied = await read(managerToken, branchB);
  assert.equal(denied.status, 403, 'Cross-branch request expected HTTP 403');
  assert.equal(denied.body?.error?.code, 'SCOPE_DENIED');
  console.log('PASS manager cross-branch access rejected');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
