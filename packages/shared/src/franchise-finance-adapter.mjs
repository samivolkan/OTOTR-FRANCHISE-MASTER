import {assertSameBranchScope, BRANCH_OPENED, BRANCH_OPENING_READY} from './branch-identity-contract.mjs';

export function createFranchiseFinanceAdapter({deliverBranchOpened, writeAudit}) {
  if (typeof deliverBranchOpened !== 'function' || typeof writeAudit !== 'function') {
    throw new TypeError('Finance opening delivery and audit ports are required');
  }
  return async function deliverFromOpeningReady(event) {
    if (event?.eventType !== BRANCH_OPENING_READY) return {outcome: 'IGNORED_EVENT'};
    const identity = assertSameBranchScope(event.identity, {
      branchId: event.identity?.branchId,
      dealerAccountId: event.identity?.dealerAccountId,
      dealerLegalEntityId: event.identity?.dealerLegalEntityId,
      legalEntityId: event.identity?.hqLegalEntityId,
    });
    const scope = {
      legalEntityId: identity.hqLegalEntityId,
      dealerAccountId: identity.dealerAccountId,
      dealerLegalEntityId: identity.dealerLegalEntityId,
      branchId: identity.branchId,
    };
    const financeEvent = {
      eventType: BRANCH_OPENED,
      eventId: event.eventId,
      branchId: identity.branchId,
      branchOpeningReference: event.openingReference,
      occurredAtUtc: event.occurredAtUtc,
      correlationId: event.correlationId,
    };
    const result = await deliverBranchOpened(financeEvent, scope);
    await writeAudit({
      action: 'FRANCHISE_FINANCE_OPENING_DELIVERED', subjectType: 'BRANCH', subjectId: identity.branchId,
      correlationId: event.correlationId, idempotencyKey: `franchise-finance:${event.eventId}`,
      outcome: result.outcome,
      safeContext: {branchCode: identity.branchCode, feeFamily: 'ENTRY_FRANCHISE'},
    });
    return {...result, branchId: identity.branchId, correlationId: event.correlationId};
  };
}
