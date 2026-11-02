import assert from 'node:assert/strict';
import { createFinanceSummaryClient, FinanceBridgeError, validateFinanceScope } from '../bayi-portal/assets/finance-api-bridge.mjs';

const scope = Object.freeze({
  legalEntityId: '11111111-1111-4111-8111-111111111111',
  dealerAccountId: '22222222-2222-4222-8222-222222222222',
  branchId: '33333333-3333-4333-8333-333333333333',
});
const correlationId = '44444444-4444-4444-8444-444444444444';
const publishableKey = `sb_publishable_${'a'.repeat(32)}`;
const token = `user-token-${'x'.repeat(32)}`;
let captured;
const client = createFinanceSummaryClient({
  getConfig: () => ({ url: 'https://example.supabase.co/path', publishableKey }),
  getAccessToken: () => token,
  correlationFactory: () => correlationId,
  fetchImpl: async (url, options) => {
    captured = { url, options };
    return { ok: true, status: 200, headers: { get: name => name.toLowerCase() === 'content-type' ? 'application/json' : null }, json: async () => ({ data: { ...scope } }) };
  },
});
const result = await client.getDealerFinanceSummary(scope, { asOf: '2026-11-03' });
assert.deepEqual(result.scope, scope);
assert.equal(captured.url, 'https://example.supabase.co/functions/v1/finance-read');
assert.equal(captured.options.method, 'POST');
assert.equal(captured.options.headers.apikey, publishableKey);
assert.equal(captured.options.headers.Authorization, `Bearer ${token}`);
assert.equal(captured.options.headers['Correlation-Id'], correlationId);
assert.deepEqual(JSON.parse(captured.options.body), { operationId: 'getDealerFinanceSummary', scope, pathParams: { dealerAccountId: scope.dealerAccountId }, query: { asOf: '2026-11-03' } });
await client.getDealerStatement(scope, { from: '2026-11-01', to: '2026-11-30', status: 'OPEN', cursor: 'cursor', limit: 25 });
assert.deepEqual(JSON.parse(captured.options.body), { operationId: 'getDealerStatement', scope, pathParams: { dealerAccountId: scope.dealerAccountId }, query: { from: '2026-11-01', to: '2026-11-30', status: 'OPEN', cursor: 'cursor', limit: 25 } });
const paymentId = '55555555-5555-4555-8555-555555555555';
await client.getPayment(scope, paymentId);
assert.deepEqual(JSON.parse(captured.options.body), { operationId:'getPayment', scope, pathParams:{dealerAccountId:scope.dealerAccountId,paymentId}, query:{} });
const accrualId = '66666666-6666-4666-8666-666666666666';
await client.getAccrualDetail(scope, accrualId);
assert.deepEqual(JSON.parse(captured.options.body), { operationId:'getAccrualDetail', scope, pathParams:{dealerAccountId:scope.dealerAccountId,accrualId}, query:{} });
const reversalAccrualId = '77777777-7777-4777-8777-777777777777';
await client.getRoyaltyRefundTrace(scope,reversalAccrualId);
assert.deepEqual(JSON.parse(captured.options.body), { operationId:'getRoyaltyRefundTrace',scope,pathParams:{dealerAccountId:scope.dealerAccountId,reversalAccrualId},query:{} });

const rejectsWithCode = async (factory, code) => assert.rejects(factory, error => error instanceof FinanceBridgeError && error.code === code);
assert.throws(() => validateFinanceScope({ ...scope, branchId: 'not-a-uuid' }), error => error.code === 'FINANCE_SCOPE_INVALID');
for (const invalidConfig of [
  { url: 'http://example.com', publishableKey },
  { url: 'https://example.com', publishableKey: `ey${'a'.repeat(40)}` },
  { url: 'https://example.com', publishableKey: `sb_secret_${'a'.repeat(32)}` },
]) {
  const invalidClient = createFinanceSummaryClient({ getConfig: () => invalidConfig, getAccessToken: () => token, fetchImpl: async () => { throw new Error('must not run'); } });
  await rejectsWithCode(() => invalidClient.getDealerFinanceSummary(scope), 'CONFIGURATION_ERROR');
}
const unauthenticated = createFinanceSummaryClient({ getConfig: () => ({ url: 'https://example.com', publishableKey }), getAccessToken: () => '', fetchImpl: async () => { throw new Error('must not run'); } });
await rejectsWithCode(() => unauthenticated.getDealerFinanceSummary(scope), 'AUTH_REQUIRED');
await rejectsWithCode(() => client.getDealerStatement(scope, { from: '2026-11-30', to: '2026-11-01' }), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.getDealerStatement(scope, { status: 'INVALID' }), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.getDealerStatement(scope, { limit: 201 }), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.getPayment(scope, 'invalid'), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.getAccrualDetail(scope, 'invalid'), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.getRoyaltyRefundTrace(scope,'invalid'),'VALIDATION_ERROR');

const denied = createFinanceSummaryClient({
  getConfig: () => ({ url: 'https://example.com', publishableKey }), getAccessToken: () => token,
  fetchImpl: async () => ({ ok: false, status: 403, headers: { get: () => 'application/json' }, json: async () => ({}) }),
});
await rejectsWithCode(() => denied.getDealerFinanceSummary(scope), 'SCOPE_DENIED');

const transport = createFinanceSummaryClient({
  getConfig: () => ({ url: 'https://example.com', publishableKey }), getAccessToken: () => token,
  fetchImpl: async () => { throw new Error('raw secret backend detail'); },
});
await assert.rejects(() => transport.getDealerFinanceSummary(scope), error => error.code === 'TRANSPORT_ERROR' && !error.message.includes('secret'));

let contextRendered = null;
let clickListener = null;
globalThis.OTOTRDealerFinanceAuth = { getConfig: () => ({ url: 'https://example.com', publishableKey }), getAccessToken: () => token };
globalThis.OTOTRFinanceUI = {
  setScopeContext: value => { contextRendered = value; }, setConnectionState() {}, renderSummary() {},
  connectButton: { addEventListener: (name, listener) => { assert.equal(name, 'click'); clickListener = listener; } },
};
globalThis.OTOTR_FINANCE_CONTEXT = scope;
await import(`../bayi-portal/assets/finance-api-bridge.mjs?configured-context=${Date.now()}`);
assert.deepEqual(contextRendered, scope);
assert.equal(typeof globalThis.OTOTRFinance.connectConfiguredScope, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getDealerStatement, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getPayment, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getAccrualDetail, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getRoyaltyRefundTrace,'function');
assert.equal(typeof clickListener, 'function');
globalThis.OTOTR_FINANCE_CONTEXT = { ...scope, branchId: 'invalid' };
assert.equal(globalThis.OTOTRFinance.refreshContext(), null);
assert.equal(contextRendered, null);
delete globalThis.OTOTRDealerFinanceAuth;
delete globalThis.OTOTRFinanceUI;
delete globalThis.OTOTR_FINANCE_CONTEXT;
delete globalThis.OTOTRFinance;

console.log('PASS finance-api-bridge: scoped summary + statement + payment + accrual + refund trace POST, publishable key, auth, safe failures');
