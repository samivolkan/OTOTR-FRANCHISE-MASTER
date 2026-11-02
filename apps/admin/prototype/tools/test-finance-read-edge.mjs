import assert from 'node:assert/strict';
import { createFinanceReadHandler } from '../../../../supabase/functions/finance-read/core.mjs';
import { createFinanceSupabaseAdapter } from '../../../../supabase/functions/finance-read/supabase-adapter.mjs';

const origin = 'https://erp.ototr.test';
const ids = Object.freeze({
  legalEntityId: '11111111-1111-4111-8111-111111111111',
  dealerAccountId: '22222222-2222-4222-8222-222222222222',
  branchId: '33333333-3333-4333-8333-333333333333',
});
const correlationId = '44444444-4444-4444-8444-444444444444';
const token = `user-token-${'x'.repeat(32)}`;
const requestBody = { operationId: 'getDealerFinanceSummary', scope: ids, pathParams: { dealerAccountId: ids.dealerAccountId }, query: { asOf: '2026-11-03' } };
const calls = [];
const handler = createFinanceReadHandler({
  allowedOrigins: [origin], correlationFactory: () => correlationId,
  authenticate: async value => { calls.push(['authenticate', value]); return { id: 'user-1', token: value }; },
  authorizeScope: async value => { calls.push(['authorize', value]); return true; },
  readSummary: async value => { calls.push(['read', value]); return { ...ids, calculatedAtUtc: '2026-11-03T10:00:00Z' }; },
  readStatement: async value => { calls.push(['statement', value]); return { items: [], nextCursor: null, hasMore: false }; },
  readPayments: async value => { calls.push(['payments',value]); return {items:[],nextCursor:null,hasMore:false}; },
  readPayment: async value => { calls.push(['payment', value]); return { payment: { paymentId: value.paymentId }, allocations: [] }; },
  readAccrualDetail: async value => { calls.push(['accrual', value]); return { accrualId:value.accrualId, journalEntry:{lines:[]} }; },
  readRefundTrace: async value => { calls.push(['refund',value]); return { reversalAccrual:{accrualId:value.reversalAccrualId} }; },
  readCurrentPeriod:async value=>{calls.push(['period',value]);return {periodId:'88888888-8888-4888-8888-888888888888',status:'OPEN'};},
});
const makeRequest = (body = requestBody, extras = {}) => new Request('https://project.supabase.co/functions/v1/finance-read', {
  method: extras.method || 'POST',
  headers: { Origin: extras.origin || origin, Authorization: extras.authorization || `Bearer ${token}`, 'Content-Type': extras.contentType || 'application/json', 'Correlation-Id': correlationId },
  body: (extras.method || 'POST') === 'POST' ? JSON.stringify(body) : undefined,
});

const success = await handler(makeRequest());
assert.equal(success.status, 200);
assert.equal(success.headers.get('access-control-allow-origin'), origin);
assert.equal(success.headers.get('correlation-id'), correlationId);
assert.deepEqual((await success.json()).data, { ...ids, calculatedAtUtc: '2026-11-03T10:00:00Z' });
assert.equal(calls[0][0], 'authenticate');
assert.equal(calls[1][0], 'authorize');
assert.deepEqual(calls[1][1].scope, ids);
assert.equal(calls[2][0], 'read');

const statementRequest = { operationId: 'getDealerStatement', scope: ids, pathParams: { dealerAccountId: ids.dealerAccountId }, query: { from: '2026-11-01', to: '2026-11-30', status: 'OPEN', limit: 25 } };
const statementResponse = await handler(makeRequest(statementRequest));
assert.equal(statementResponse.status, 200);
assert.deepEqual((await statementResponse.json()).data, { items: [], nextCursor: null, hasMore: false });
assert.equal(calls.at(-1)[0], 'statement');
assert.equal(calls.at(-2)[1].operationId, 'getDealerStatement');

const paymentsRequest={operationId:'listPayments',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{status:'VERIFIED',limit:25}};
const paymentsResponse=await handler(makeRequest(paymentsRequest));
assert.equal(paymentsResponse.status,200);assert.deepEqual((await paymentsResponse.json()).data,{items:[],nextCursor:null,hasMore:false});assert.equal(calls.at(-1)[0],'payments');

const paymentId = '55555555-5555-4555-8555-555555555555';
const paymentRequest = { operationId:'getPayment', scope:ids, pathParams:{dealerAccountId:ids.dealerAccountId,paymentId}, query:{} };
const paymentResponse = await handler(makeRequest(paymentRequest));
assert.equal(paymentResponse.status, 200);
assert.equal((await paymentResponse.json()).data.payment.paymentId, paymentId);
assert.equal(calls.at(-1)[0], 'payment');

const accrualId = '66666666-6666-4666-8666-666666666666';
const accrualRequest = { operationId:'getAccrualDetail', scope:ids, pathParams:{dealerAccountId:ids.dealerAccountId,accrualId}, query:{} };
const accrualResponse = await handler(makeRequest(accrualRequest));
assert.equal(accrualResponse.status, 200);
assert.equal((await accrualResponse.json()).data.accrualId, accrualId);
assert.equal(calls.at(-1)[0], 'accrual');

const reversalAccrualId = '77777777-7777-4777-8777-777777777777';
const refundRequest = {operationId:'getRoyaltyRefundTrace',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId,reversalAccrualId},query:{}};
const refundResponse = await handler(makeRequest(refundRequest));
assert.equal(refundResponse.status,200);
assert.equal((await refundResponse.json()).data.reversalAccrual.accrualId,reversalAccrualId);
assert.equal(calls.at(-1)[0],'refund');

const periodRequest={operationId:'getFinancePeriod',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{asOf:'2026-11-03'}};
const periodResponse=await handler(makeRequest(periodRequest));
assert.equal(periodResponse.status,200);assert.equal((await periodResponse.json()).data.status,'OPEN');assert.equal(calls.at(-1)[0],'period');

assert.equal((await handler(makeRequest(requestBody, { origin: 'https://evil.test' }))).status, 403);
assert.equal((await handler(makeRequest(requestBody, { authorization: 'Bearer short' }))).status, 401);
assert.equal((await handler(makeRequest({ ...requestBody, operationId: 'deleteEverything' }))).status, 403);
assert.equal((await handler(makeRequest({ ...requestBody, unexpected: true }))).status, 400);
assert.equal((await handler(makeRequest({ ...requestBody, pathParams: { dealerAccountId: ids.branchId } }))).status, 403);
assert.equal((await handler(makeRequest({ ...requestBody, query: { asOf: '2026-02-30' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { from: '2026-11-30', to: '2026-11-01' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { status: 'INVALID' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { limit: 201 } }))).status, 400);
assert.equal((await handler(makeRequest({...paymentsRequest,query:{status:'OPEN'}}))).status,400);
assert.equal((await handler(makeRequest({...paymentRequest,pathParams:{dealerAccountId:ids.dealerAccountId,paymentId:'bad'}}))).status, 400);
assert.equal((await handler(makeRequest({...paymentRequest,query:{unexpected:true}}))).status, 400);
assert.equal((await handler(makeRequest({...accrualRequest,pathParams:{dealerAccountId:ids.dealerAccountId,accrualId:'bad'}}))).status, 400);
assert.equal((await handler(makeRequest({...refundRequest,pathParams:{dealerAccountId:ids.dealerAccountId,reversalAccrualId:'bad'}}))).status,400);
assert.equal((await handler(makeRequest({...periodRequest,query:{}}))).status,400);
assert.throws(() => createFinanceReadHandler({ allowedOrigins: ['*'], authenticate() {}, authorizeScope() {}, readSummary() {}, readStatement() {}, readPayments() {}, readPayment() {}, readAccrualDetail() {}, readRefundTrace() {},readCurrentPeriod(){} }), /allowlist/);
assert.throws(() => createFinanceReadHandler({ allowedOrigins: ['http://erp.ototr.test'], authenticate() {}, authorizeScope() {}, readSummary() {}, readStatement() {}, readPayments() {}, readPayment() {}, readAccrualDetail() {}, readRefundTrace() {},readCurrentPeriod(){} }), /allowlist/);
assert.throws(() => createFinanceReadHandler({ allowedOrigins: [origin], authenticate() {}, authorizeScope() {}, readSummary() {}, readStatement() {}, readPayments() {}, readPayment() {}, readAccrualDetail() {}, readRefundTrace() {},readCurrentPeriod(){}, maxBodyBytes: 100 }), /maxBodyBytes/);

const safeHandler = createFinanceReadHandler({ allowedOrigins: [origin], correlationFactory: () => correlationId, authenticate: async () => { throw new Error('database password leaked'); }, authorizeScope: async () => true, readSummary: async () => ({}), readStatement: async () => ({}), readPayments:async()=>({}), readPayment: async () => ({}), readAccrualDetail: async () => ({}), readRefundTrace:async()=>({}),readCurrentPeriod:async()=>({}) });
const safeResponse = await safeHandler(makeRequest());
assert.equal(safeResponse.status, 500);
assert.doesNotMatch(JSON.stringify(await safeResponse.json()), /password|leaked/);

const fetchCalls = [];
const jsonResponse = (status, payload) => ({ ok: status >= 200 && status < 300, status, headers: { get: name => name === 'content-type' ? 'application/json' : null }, json: async () => payload });
const adapter = createFinanceSupabaseAdapter({
  supabaseUrl: 'https://project.supabase.co/path', publishableKey: `sb_publishable_${'a'.repeat(32)}`,
  fetchImpl: async (url, options) => { fetchCalls.push({ url, options }); return url.endsWith('/auth/v1/user') ? jsonResponse(200, { id: 'user-1' }) : jsonResponse(200, url.endsWith('/authorize_scope') ? true : { ...ids }); },
});
const actor = await adapter.authenticate(token);
assert.equal(actor.id, 'user-1');
assert.equal(await adapter.authorizeScope({ actor, scope: ids, operationId: 'getDealerFinanceSummary' }), true);
await adapter.readSummary({ actor, scope: ids, dealerAccountId: ids.dealerAccountId, asOf: '2026-11-03' });
await adapter.readStatement({ actor, scope: ids, dealerAccountId: ids.dealerAccountId, from: '2026-11-01', to: '2026-11-30', status: 'OPEN', cursor: 'cursor', limit: 25 });
await adapter.readPayments({actor,scope:ids,dealerAccountId:ids.dealerAccountId,from:'2026-11-01',to:'2026-11-30',status:'VERIFIED',cursor:'payment-cursor',limit:25});
await adapter.readPayment({ actor, scope:ids, dealerAccountId:ids.dealerAccountId, paymentId });
await adapter.readAccrualDetail({ actor, scope:ids, dealerAccountId:ids.dealerAccountId, accrualId });
await adapter.readRefundTrace({actor,scope:ids,dealerAccountId:ids.dealerAccountId,reversalAccrualId});
await adapter.readCurrentPeriod({actor,scope:ids,dealerAccountId:ids.dealerAccountId,asOf:'2026-11-03'});
assert.equal(fetchCalls.length, 9);
assert.equal(fetchCalls[0].options.headers.Authorization, `Bearer ${token}`);
assert.equal(fetchCalls[1].options.headers['Accept-Profile'], 'finance_api');
assert.deepEqual(JSON.parse(fetchCalls[2].options.body), { p_legal_entity_id: ids.legalEntityId, p_dealer_account_id: ids.dealerAccountId, p_branch_id: ids.branchId, p_as_of: '2026-11-03' });
assert.deepEqual(JSON.parse(fetchCalls[3].options.body), { p_legal_entity_id: ids.legalEntityId, p_dealer_account_id: ids.dealerAccountId, p_branch_id: ids.branchId, p_from: '2026-11-01', p_to: '2026-11-30', p_status: 'OPEN', p_cursor: 'cursor', p_limit: 25 });
assert.deepEqual(JSON.parse(fetchCalls[4].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_from:'2026-11-01',p_to:'2026-11-30',p_status:'VERIFIED',p_cursor:'payment-cursor',p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[5].options.body), { p_legal_entity_id:ids.legalEntityId, p_dealer_account_id:ids.dealerAccountId, p_branch_id:ids.branchId, p_payment_id:paymentId });
assert.deepEqual(JSON.parse(fetchCalls[6].options.body), { p_legal_entity_id:ids.legalEntityId, p_dealer_account_id:ids.dealerAccountId, p_branch_id:ids.branchId, p_accrual_id:accrualId });
assert.deepEqual(JSON.parse(fetchCalls[7].options.body), { p_legal_entity_id:ids.legalEntityId, p_dealer_account_id:ids.dealerAccountId, p_branch_id:ids.branchId, p_reversal_accrual_id:reversalAccrualId });
assert.deepEqual(JSON.parse(fetchCalls[8].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_as_of:'2026-11-03'});
for (const invalidKey of [`ey${'a'.repeat(40)}`, `sb_secret_${'a'.repeat(32)}`]) assert.throws(() => createFinanceSupabaseAdapter({ supabaseUrl: 'https://project.supabase.co', publishableKey: invalidKey }), /publishable/i);

console.log('PASS finance-read-edge: summary, statement, payment list/detail, accrual, refund and current period; JWT scope and safe errors');
