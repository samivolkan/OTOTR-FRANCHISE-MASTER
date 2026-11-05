import assert from 'node:assert/strict';
import {createOpeningReadyEvent} from '../../../../packages/shared/src/branch-identity-contract.mjs';
import {createFranchiseHrAdapter} from '../../../../packages/shared/src/franchise-hr-adapter.mjs';
import {createFranchiseFinanceAdapter} from '../../../../packages/shared/src/franchise-finance-adapter.mjs';
import {createFinanceBranchOpeningAdapter} from '../../../../packages/shared/src/finance-branch-opening-adapter.mjs';

const identity = {
  branchId: 'b0000000-0000-4000-8000-000000000001', branchCode: 'BURSA-OSM',
  dealerAccountId: 'b0000000-0000-4000-8000-000000000002',
  dealerLegalEntityId: 'b0000000-0000-4000-8000-000000000003',
  hqLegalEntityId: 'b0000000-0000-4000-8000-000000000004', employerCode: 'OTOTR-BURSA-OSM',
};
const event = createOpeningReadyEvent({
  eventId: 'b0000000-0000-4000-8000-000000000005',
  correlationId: 'b0000000-0000-4000-8000-000000000006',
  occurredAtUtc: '2026-12-01T08:00:00Z', openingReference: 'FR-DEMO-20261104-OSMANGAZI', identity,
  gates: {applicationApproved:true, financialQualified:true, locationApproved:true, contractApproved:true},
});

const audit = [];
const hrRequests = new Map();
const financeEvents = new Map();
const accruals = new Map();
const writeAudit = async (record) => audit.push(record);
const provisionEmployerBranch = async (request) => {
  if (hrRequests.has(request.idempotencyKey)) return hrRequests.get(request.idempotencyKey);
  assert.equal(request.organizationScope, 'BRANCH');
  assert.equal(request.parentCentralDepartmentId, null);
  assert.equal(request.isSynthetic, true);
  assert.equal(request.realPersonDataAllowed, false);
  assert.equal(request.staffPlan.length, 5);
  assert.equal(request.staffPlan.filter((person) => person.positionCode === 'BODY_TECHNICIAN').length, 2);
  const result = {outcome:'PROVISIONED', employerId:'b0000000-0000-4000-8000-000000000007', staffCount:5};
  hrRequests.set(request.idempotencyKey, result);
  return result;
};
const ingest = async (scope, financeEvent) => {
  assert.equal(scope.branchId, identity.branchId);
  assert.equal(scope.dealerAccountId, identity.dealerAccountId);
  assert.equal(scope.dealerLegalEntityId, identity.dealerLegalEntityId);
  assert.equal(scope.legalEntityId, identity.hqLegalEntityId);
  if (financeEvents.has(financeEvent.eventId)) return {outcome:'IDEMPOTENT_REPLAY', accrualId:financeEvents.get(financeEvent.eventId)};
  if (accruals.has(scope.branchId)) return {outcome:'ENTRY_FRANCHISE_ALREADY_EXISTS'};
  const accrualId = 'b0000000-0000-4000-8000-000000000008';
  financeEvents.set(financeEvent.eventId, accrualId);
  accruals.set(scope.branchId, {accrualId, feeFamily:'ENTRY_FRANCHISE', openingReference:financeEvent.payload.branchOpeningReference});
  return {outcome:'ACCEPTED', accrualId};
};

const deliverBranchOpened = createFinanceBranchOpeningAdapter({cutoverDate:'2026-12-01', ingest});
const toHr = createFranchiseHrAdapter({provisionEmployerBranch, writeAudit});
const toFinance = createFranchiseFinanceAdapter({deliverBranchOpened, writeAudit});

const firstHr = await toHr(event);
const firstFinance = await toFinance(event);
const replayHr = await toHr(event);
const replayFinance = await toFinance(event);

assert.equal(firstHr.outcome, 'PROVISIONED');
assert.equal(firstFinance.outcome, 'ACCEPTED');
assert.equal(replayHr.outcome, 'PROVISIONED');
assert.equal(replayFinance.outcome, 'IDEMPOTENT_REPLAY');
assert.equal(hrRequests.size, 1);
assert.equal(financeEvents.size, 1);
assert.equal(accruals.size, 1);
assert.equal(accruals.get(identity.branchId).feeFamily, 'ENTRY_FRANCHISE');
assert.ok(audit.length === 4 && audit.every((entry) => entry.correlationId === event.correlationId));
assert.ok(audit.every((entry) => entry.subjectId === identity.branchId));

console.log(JSON.stringify({
  result:'PASS', scenario:event.openingReference, branchId:identity.branchId, hrStaff:5,
  entryFranchiseAccruals:accruals.size, auditRecords:audit.length,
  privacyGate:'EXCLUDED_BY_SCOPE', productionGate:'BLOCKED', franchiseRuntimeGate:'CONTRACT_ONLY',
}, null, 2));
