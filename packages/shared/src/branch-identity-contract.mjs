const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODE = /^[A-Z0-9][A-Z0-9_-]{1,63}$/;

export const BRANCH_OPENING_READY = 'branch.opening.ready';
export const BRANCH_OPENED = 'branch.opened';
export const BRANCH_IDENTITY_VERSION = 1;

function requiredUuid(value, field) {
  if (typeof value !== 'string' || !UUID.test(value)) throw new TypeError(`${field} must be a UUID`);
  return value.toLowerCase();
}

function requiredCode(value, field) {
  if (typeof value !== 'string' || !CODE.test(value)) throw new TypeError(`${field} must be an uppercase code`);
  return value;
}

export function createBranchIdentity(input) {
  const identity = Object.freeze({
    contractVersion: BRANCH_IDENTITY_VERSION,
    branchId: requiredUuid(input?.branchId, 'branchId'),
    branchCode: requiredCode(input?.branchCode, 'branchCode'),
    dealerAccountId: requiredUuid(input?.dealerAccountId, 'dealerAccountId'),
    dealerLegalEntityId: requiredUuid(input?.dealerLegalEntityId, 'dealerLegalEntityId'),
    hqLegalEntityId: requiredUuid(input?.hqLegalEntityId, 'hqLegalEntityId'),
    employerCode: requiredCode(input?.employerCode, 'employerCode'),
  });
  if (identity.dealerLegalEntityId === identity.hqLegalEntityId) {
    throw new TypeError('dealerLegalEntityId and hqLegalEntityId must be distinct');
  }
  return identity;
}

export function assertSameBranchScope(identity, ...scopes) {
  const expected = createBranchIdentity(identity);
  for (const scope of scopes) {
    if (scope?.branchId !== expected.branchId ||
        (scope.dealerAccountId != null && scope.dealerAccountId !== expected.dealerAccountId) ||
        (scope.dealerLegalEntityId != null && scope.dealerLegalEntityId !== expected.dealerLegalEntityId) ||
        (scope.legalEntityId != null && scope.legalEntityId !== expected.hqLegalEntityId)) {
      throw new TypeError('branch identity scope mismatch');
    }
  }
  return expected;
}

export function createOpeningReadyEvent({eventId, correlationId, occurredAtUtc, openingReference, identity, gates}) {
  const normalizedIdentity = createBranchIdentity(identity);
  const timestamp = new Date(occurredAtUtc);
  if (!Number.isFinite(timestamp.getTime()) || typeof occurredAtUtc !== 'string' || !occurredAtUtc.includes('T')) {
    throw new TypeError('occurredAtUtc must be an ISO timestamp');
  }
  if (typeof openingReference !== 'string' || !openingReference.trim()) throw new TypeError('openingReference is required');
  const requiredGates = ['applicationApproved', 'financialQualified', 'locationApproved', 'contractApproved'];
  if (!gates || requiredGates.some((gate) => gates[gate] !== true)) throw new TypeError('opening readiness gates are incomplete');
  return Object.freeze({
    contractVersion: BRANCH_IDENTITY_VERSION,
    eventType: BRANCH_OPENING_READY,
    eventId: requiredUuid(eventId, 'eventId'),
    correlationId: requiredUuid(correlationId, 'correlationId'),
    occurredAtUtc: timestamp.toISOString(),
    openingReference: openingReference.trim(),
    identity: normalizedIdentity,
    gates: Object.freeze({...gates}),
  });
}
