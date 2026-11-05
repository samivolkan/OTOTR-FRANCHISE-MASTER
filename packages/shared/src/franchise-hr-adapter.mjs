import {assertSameBranchScope, BRANCH_OPENING_READY} from './branch-identity-contract.mjs';

const STAFF_PLAN = Object.freeze([
  {positionCode: 'BRANCH_OWNER', title: 'Şube Sahibi', productRole: 'BRANCH_OWNER', dbRole: 'BRANCH_MANAGER'},
  {positionCode: 'BRANCH_MANAGER', title: 'Şube Müdürü', productRole: 'BRANCH_MANAGER', dbRole: 'BRANCH_MANAGER'},
  {positionCode: 'BODY_TECHNICIAN', title: 'Kaporta Elemanı', productRole: 'BODY_TECHNICIAN', dbRole: 'INSPECTION_TECHNICIAN'},
  {positionCode: 'BODY_TECHNICIAN', title: 'Kaporta Elemanı', productRole: 'BODY_TECHNICIAN', dbRole: 'INSPECTION_TECHNICIAN'},
  {positionCode: 'RECEPTION_STAFF', title: 'Sekreter', productRole: 'RECEPTION_STAFF', dbRole: 'BRANCH_MANAGER'},
]);

export function createFranchiseHrAdapter({provisionEmployerBranch, writeAudit}) {
  if (typeof provisionEmployerBranch !== 'function' || typeof writeAudit !== 'function') {
    throw new TypeError('HR provisioning and audit ports are required');
  }
  return async function provisionFromOpeningReady(event) {
    if (event?.eventType !== BRANCH_OPENING_READY) return {outcome: 'IGNORED_EVENT'};
    const identity = assertSameBranchScope(event.identity, {branchId: event.identity?.branchId});
    const idempotencyKey = `franchise-hr:${event.eventId}`;
    const request = {
      identity,
      branchId: identity.branchId,
      employerCode: identity.employerCode,
      organizationScope: 'BRANCH',
      parentCentralDepartmentId: null,
      isSynthetic: true,
      realPersonDataAllowed: false,
      staffPlan: STAFF_PLAN.map((item, index) => ({...item, syntheticSequence: index + 1})),
      idempotencyKey,
      correlationId: event.correlationId,
      sourceEventId: event.eventId,
    };
    const result = await provisionEmployerBranch(request);
    await writeAudit({
      action: 'FRANCHISE_HR_BRANCH_PROVISIONED', subjectType: 'BRANCH', subjectId: identity.branchId,
      correlationId: event.correlationId, idempotencyKey, outcome: result.outcome,
      safeContext: {branchCode: identity.branchCode, isSynthetic: true, staffCount: STAFF_PLAN.length},
    });
    return {...result, branchId: identity.branchId, correlationId: event.correlationId};
  };
}

export {STAFF_PLAN as BURSA_OSMANGAZI_SYNTHETIC_STAFF_PLAN};
