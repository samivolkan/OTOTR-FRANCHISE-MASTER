/** Read the explicit settlement contract attached by the ERP writer. */
export function readErpCustomerSettlement(transaction, {erpBranchId, financeBranchId}) {
  if (!transaction || transaction.branch_id !== erpBranchId ||
      transaction.status !== 'PAID' || !transaction.paid_at) return null;

  const isCollection = transaction.transaction_type === 'SERVICE_REVENUE' && transaction.direction === 'INCOME';
  const isRefund = transaction.transaction_type === 'REFUND' && transaction.direction === 'EXPENSE';
  if (!isCollection && !isRefund) return null;

  const settlement = transaction.metadata?.financeSettlement;
  if (settlement?.version !== 1 ||
      typeof settlement.grossAmount !== 'string' ||
      !['PARTIAL', 'FULL'].includes(settlement.completeness) ||
      (isRefund && !settlement.originalCollectionId)) return null;

  return {
    kind: isRefund ? 'refund' : 'collection',
    transactionId: transaction.id,
    originalCollectionId: isRefund ? settlement.originalCollectionId : undefined,
    branchId: financeBranchId,
    currency: transaction.currency,
    grossAmount: settlement.grossAmount,
    status: 'SETTLED',
    completeness: settlement.completeness,
    businessDate: settlement.businessDate,
    occurredAtUtc: transaction.paid_at,
    correlationId: settlement.correlationId
  };
}
