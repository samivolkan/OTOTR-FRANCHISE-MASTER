/**
 * Map a confirmed ERP settlement to the finance source event contract.
 * The ERP server supplies scope, service identity and stable transaction IDs.
 */
export function mapCustomerSettlementEvent(settlement, {scope, actorId, receivedAtUtc}) {
  const {kind, transactionId, originalCollectionId, branchId, currency, grossAmount,
    businessDate, occurredAtUtc, correlationId, completeness} = settlement;
  if (kind !== 'collection' && kind !== 'refund') throw new Error('Unsupported settlement kind');
  if (settlement.status !== 'SETTLED' || branchId !== scope.branchId || !['PARTIAL', 'FULL'].includes(completeness)) {
    throw new Error('A confirmed settlement in the authorized branch is required');
  }
  if (typeof grossAmount !== 'string' || !/^\d{1,16}(?:\.\d{1,8})?$/.test(grossAmount) ||
      !/[1-9]/.test(grossAmount)) throw new Error('A positive decimal amount is required');

  const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
  const refund = kind === 'refund';
  if (![transactionId, correlationId].every(id => uuid.test(id)) ||
      (refund && !uuid.test(originalCollectionId))) throw new Error('Settlement identifiers must be UUIDs');

  const payload = refund
    ? {refundId: transactionId, originalCollectionId, refundedGrossAmount: grossAmount, refundStatus: 'SETTLED', transactionType: 'REFUND', refundCompleteness: completeness, refundedAtUtc: occurredAtUtc}
    : {collectionId: transactionId, collectedGrossAmount: grossAmount, collectionStatus: 'SETTLED', transactionType: 'COLLECTION', collectionCompleteness: completeness, settledAtUtc: occurredAtUtc};
  return {
    eventId: transactionId,
    eventType: refund ? 'customer-payment.refunded' : 'customer-payment.settled',
    schemaVersion: 1,
    businessDate,
    occurredAtUtc,
    receivedAtUtc,
    sourceSystem: 'OTOTR_ERP',
    aggregateType: refund ? 'CUSTOMER_PAYMENT_REFUND' : 'CUSTOMER_PAYMENT',
    aggregateId: transactionId,
    aggregateVersion: 1,
    scope,
    trace: {correlationId, causationId: refund ? originalCollectionId : null,
      idempotencyKey: 'erp:customer-payment:' + kind + ':' + transactionId},
    actor: {actorType: 'SERVICE', actorId},
    payload: {...payload, branchId, currency},
    metadata: {}
  };
}
