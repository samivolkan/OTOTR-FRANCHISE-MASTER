import {readErpCustomerSettlement} from './finance-erp-transaction-reader.mjs';

const operations = new Map([
  ['collection-600', {grossAmount: '600.00', completeness: 'PARTIAL'}],
  ['collection-400', {grossAmount: '400.00', completeness: 'FULL'}],
  ['refund-200', {grossAmount: '200.00', completeness: 'PARTIAL', original: 'collection-600'}]
]);

/** Persistence must atomically get or insert by scenario and operation. */
export function createErpDemoSettlementWriter({loadAuthorizedScenario, saveOperation, loadOperation, clock}) {
  return async function record(actor, operation) {
    const spec = operations.get(operation);
    if (!spec) return null;

    const scenario = await loadAuthorizedScenario(actor);
    if (!scenario) return null;

    const original = spec.original && await loadOperation(scenario, spec.original);
    if (spec.original && (!original || original.branch_id !== scenario.erpBranchId ||
        original.status !== 'PAID' || original.transaction_type !== 'SERVICE_REVENUE')) return null;

    const {businessDate, occurredAtUtc} = clock();
    const transaction = await saveOperation(scenario, operation, {
      branch_id: scenario.erpBranchId,
      transaction_type: original ? 'REFUND' : 'SERVICE_REVENUE',
      direction: original ? 'EXPENSE' : 'INCOME',
      currency: 'TRY',
      status: 'PAID',
      amount: spec.grossAmount,
      paid_at: occurredAtUtc,
      metadata: {
        financeSettlement: {
          version: 1,
          grossAmount: spec.grossAmount,
          completeness: spec.completeness,
          businessDate,
          correlationId: scenario.correlationId,
          ...(original && {originalCollectionId: original.id})
        }
      }
    });

    const settlement = readErpCustomerSettlement(transaction, scenario);
    if (!settlement) throw new Error('Invalid persisted demo settlement');
    return {settlement, context: scenario.context};
  };
}
