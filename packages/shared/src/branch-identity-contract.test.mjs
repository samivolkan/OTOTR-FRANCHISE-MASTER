import assert from 'node:assert/strict';
import test from 'node:test';
import {assertSameBranchScope, createBranchIdentity, createOpeningReadyEvent} from './branch-identity-contract.mjs';

const identity = {
  branchId: '10000000-0000-4000-8000-000000000001', branchCode: 'BURSA-OSM',
  dealerAccountId: '10000000-0000-4000-8000-000000000002',
  dealerLegalEntityId: '10000000-0000-4000-8000-000000000003',
  hqLegalEntityId: '10000000-0000-4000-8000-000000000004', employerCode: 'OTOTR-BURSA-OSM',
};

test('common identity accepts one branch scope and freezes the contract', () => {
  const value = createBranchIdentity(identity);
  assert.ok(Object.isFrozen(value));
  assert.deepEqual(assertSameBranchScope(value, {branchId: value.branchId, dealerAccountId: value.dealerAccountId}), value);
});

test('scope mismatch and incomplete opening readiness fail closed', () => {
  assert.throws(() => assertSameBranchScope(identity, {branchId: '20000000-0000-4000-8000-000000000001'}), /scope mismatch/);
  assert.throws(() => createOpeningReadyEvent({
    eventId: identity.branchId, correlationId: identity.dealerAccountId, occurredAtUtc: '2026-12-01T08:00:00Z',
    openingReference: 'FR-DEMO', identity, gates: {applicationApproved: true},
  }), /gates are incomplete/);
});
