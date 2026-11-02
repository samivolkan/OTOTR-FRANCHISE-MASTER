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

assert.equal((await handler(makeRequest(requestBody, { origin: 'https://evil.test' }))).status, 403);
assert.equal((await handler(makeRequest(requestBody, { authorization: 'Bearer short' }))).status, 401);
assert.equal((await handler(makeRequest({ ...requestBody, operationId: 'deleteEverything' }))).status, 403);
assert.equal((await handler(makeRequest({ ...requestBody, unexpected: true }))).status, 400);
assert.equal((await handler(makeRequest({ ...requestBody, pathParams: { dealerAccountId: ids.branchId } }))).status, 403);
assert.equal((await handler(makeRequest({ ...requestBody, query: { asOf: '2026-02-30' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { from: '2026-11-30', to: '2026-11-01' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { status: 'INVALID' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { limit: 201 } }))).status, 400);
assert.throws(() => createFinanceReadHandler({ allowedOrigins: ['*'], authenticate() {}, authorizeScope() {}, readSummary() {}, readStatement() {} }), /allowlist/);
assert.throws(() => createFinanceReadHandler({ allowedOrigins: ['http://erp.ototr.test'], authenticate() {}, authorizeScope() {}, readSummary() {}, readStatement() {} }), /allowlist/);
assert.throws(() => createFinanceReadHandler({ allowedOrigins: [origin], authenticate() {}, authorizeScope() {}, readSummary() {}, readStatement() {}, maxBodyBytes: 100 }), /maxBodyBytes/);

const safeHandler = createFinanceReadHandler({ allowedOrigins: [origin], correlationFactory: () => correlationId, authenticate: async () => { throw new Error('database password leaked'); }, authorizeScope: async () => true, readSummary: async () => ({}), readStatement: async () => ({}) });
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
assert.equal(fetchCalls.length, 4);
assert.equal(fetchCalls[0].options.headers.Authorization, `Bearer ${token}`);
assert.equal(fetchCalls[1].options.headers['Accept-Profile'], 'finance_api');
assert.deepEqual(JSON.parse(fetchCalls[2].options.body), { p_legal_entity_id: ids.legalEntityId, p_dealer_account_id: ids.dealerAccountId, p_branch_id: ids.branchId, p_as_of: '2026-11-03' });
assert.deepEqual(JSON.parse(fetchCalls[3].options.body), { p_legal_entity_id: ids.legalEntityId, p_dealer_account_id: ids.dealerAccountId, p_branch_id: ids.branchId, p_from: '2026-11-01', p_to: '2026-11-30', p_status: 'OPEN', p_cursor: 'cursor', p_limit: 25 });
for (const invalidKey of [`ey${'a'.repeat(40)}`, `sb_secret_${'a'.repeat(32)}`]) assert.throws(() => createFinanceSupabaseAdapter({ supabaseUrl: 'https://project.supabase.co', publishableKey: invalidKey }), /publishable/i);

console.log('PASS finance-read-edge: summary + statement, user JWT, explicit origin, branch scope, finance_api RPC, safe errors');
