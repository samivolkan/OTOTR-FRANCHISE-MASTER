import assert from 'node:assert/strict';
import { createFinanceErpOperationGuardRegistry, createSessionBoundFinanceGuard } from './finance-erp-operation-guard-registry.mjs';

const routeCapabilities = {
  'work-order.create': 'WORK_ORDER_WRITE',
  'finance.payment': 'PAYMENT',
  'finance.statement': 'STATEMENT_READ',
};
const observed = [];
const routeGuardFactory = ({ capability, resolveContext }) => handler => async request => {
  const context = await resolveContext(request);
  observed.push(context);
  if (request.denied) return { status: 423, code: 'BRANCH_FINANCE_LOCKED' };
  return handler(request, { allowed: true });
};
const guard = createSessionBoundFinanceGuard({
  routeGuardFactory,
  resolveVerifiedSessionScope: async request => request.verifiedSession,
  businessDate: () => '2026-11-07',
});
const registry = createFinanceErpOperationGuardRegistry({ guard, routeCapabilities });
registry.register('work-order.create', async () => ({ status: 201 }));
registry.register('finance.payment', async () => ({ status: 200 }));
assert.throws(() => registry.assertComplete(), /finance.statement/);
assert.throws(() => registry.resolve('finance.statement'), /unprotected/);
assert.throws(() => registry.resolve('unknown.route'), /undeclared/);
registry.register('finance.statement', async () => ({ status: 200 }));
assert.equal(registry.assertComplete().length, 3);
assert.throws(() => registry.register('finance.payment', async () => ({})), /duplicate/);
const brokenRegistry = createFinanceErpOperationGuardRegistry({ guard: () => null, routeCapabilities: { 'finance.payment': 'PAYMENT' } });
assert.throws(() => brokenRegistry.register('finance.payment', async () => ({})), /did not wrap/);

const verifiedSession = {
  actorId: '00000001-1111-4111-8111-000000000001',
  legalEntityId: '00000002-1111-4111-8111-000000000002',
  dealerAccountId: '00000003-1111-4111-8111-000000000003',
  branchId: '00000004-1111-4111-8111-000000000004',
};
let result = await registry.resolve('work-order.create')({
  verifiedSession,
  body: { branchId: 'attacker-controlled', capability: 'PAYMENT' },
});
assert.equal(result.status, 201);
assert.equal(observed[0].branchId, verifiedSession.branchId);
assert.equal(observed[0].capability, 'WORK_ORDER_WRITE');
result = await registry.resolve('work-order.create')({ verifiedSession, denied: true });
assert.deepEqual(result, { status: 423, code: 'BRANCH_FINANCE_LOCKED' });

console.log('PASS finance ERP operation guard registry: complete declaration, fixed capability, verified-session scope, unknown/unprotected rejection and locked denial');
