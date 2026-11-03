import assert from 'node:assert/strict';
import {
  createBranchFinanceAccessClient,
  createBranchFinanceRouteGuard,
} from './finance-branch-access-middleware.mjs';

const id = n => `${String(n).padStart(8, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
const serviceToken = 'server-only-service-token-longer-than-forty-characters';
const context = {
  actorId: id(1),
  legalEntityId: id(2),
  dealerAccountId: id(3),
  branchId: id(4),
  capability: 'WORK_ORDER_WRITE',
  businessDate: '2026-11-03',
};

let captured;
const client = createBranchFinanceAccessClient({
  endpoint: 'https://example.test/functions/v1/finance-branch-access',
  serviceToken,
  correlationFactory: () => id(5),
  fetchImpl: async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ data: {
      allowed: false,
      accessState: 'LOCKED_OVERDUE',
      denialCode: 'BRANCH_FINANCE_LOCKED',
      reasonCode: 'ROYALTY_INVOICE_OVERDUE',
      capability: 'WORK_ORDER_WRITE',
      correlationId: id(5),
    } }), { status: 423, headers: { 'content-type': 'application/json' } });
  },
});

let decision = await client.authorize(context);
assert.equal(decision.allowed, false);
assert.equal(decision.denialCode, 'BRANCH_FINANCE_LOCKED');
assert.equal(captured.url, 'https://example.test/functions/v1/finance-branch-access');
assert.equal(JSON.parse(captured.options.body).branchId, id(4));
assert.match(captured.options.headers.Authorization, /^Bearer /);

const denied = [];
const guard = createBranchFinanceRouteGuard({
  accessClient: client,
  resolveContext: async () => context,
  onDenied: async (_, value) => {
    denied.push(value);
    return { status: value.denialCode === 'BRANCH_FINANCE_LOCKED' ? 423 : 503 };
  },
});
let called = 0;
let result = await guard(async () => {
  called++;
  return { status: 200 };
})({ route: 'work-order' });
assert.equal(result.status, 423);
assert.equal(called, 0);
assert.equal(denied.length, 1);

const allowClient = { authorize: async value => ({
  allowed: value.capability === 'PAYMENT', accessState: 'LOCKED_OVERDUE',
}) };
const paymentGuard = createBranchFinanceRouteGuard({
  accessClient: allowClient,
  resolveContext: async () => ({ ...context, capability: 'PAYMENT' }),
  onDenied: async () => ({ status: 423 }),
});
result = await paymentGuard(async (_, value) => {
  called++;
  return { status: 200, state: value.accessState };
})({ route: 'payment' });
assert.deepEqual(result, { status: 200, state: 'LOCKED_OVERDUE' });
assert.equal(called, 1);

const unavailable = createBranchFinanceAccessClient({
  endpoint: 'https://example.test/functions/v1/finance-branch-access',
  serviceToken,
  correlationFactory: () => id(5),
  fetchImpl: async () => { throw new Error('network down'); },
});
decision = await unavailable.authorize(context);
assert.equal(decision.allowed, false);
assert.equal(decision.denialCode, 'ACCESS_DECISION_UNAVAILABLE');

const invalidStatus = createBranchFinanceAccessClient({
  endpoint: 'https://example.test/functions/v1/finance-branch-access',
  serviceToken,
  correlationFactory: () => id(5),
  fetchImpl: async () => new Response(JSON.stringify({ data: {
    allowed: true,
    accessState: 'OPEN',
    capability: 'WORK_ORDER_WRITE',
    correlationId: id(5),
  } }), { status: 500, headers: { 'content-type': 'application/json' } }),
});
decision = await invalidStatus.authorize(context);
assert.equal(decision.allowed, false);
assert.equal(decision.denialCode, 'ACCESS_DECISION_UNAVAILABLE');

assert.throws(
  () => createBranchFinanceAccessClient({ endpoint: 'http://example.test/access', serviceToken }), /HTTPS/,
);
assert.throws(
  () => createBranchFinanceAccessClient({ endpoint: 'https://example.test/access', serviceToken: 'public' }),
  /server-only/,
);

console.log('PASS finance branch access middleware: locked denial, payment allowance, fail-closed outage/status mismatch, HTTPS and server-only credential contract');
