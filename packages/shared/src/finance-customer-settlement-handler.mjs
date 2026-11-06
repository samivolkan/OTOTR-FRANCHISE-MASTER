import {mapCustomerSettlementEvent} from './finance-customer-settlement-adapter.mjs';

/** Run after ERP confirmation using a scope and fee definition resolved by the server. */
export function createFinanceCustomerSettlementHandler({ingest, calculateAccrual, processRefund}) {
  return async function handleCustomerSettlement(settlement, context) {
    const event = mapCustomerSettlementEvent(settlement, context);
    const receipt = await ingest(event);
    if (!['ACCEPTED', 'DUPLICATE'].includes(receipt?.status) || !receipt.sourceEventId) {
      throw new Error('Finance did not accept the ERP settlement');
    }

    const {headquartersLegalEntityId, dealerLegalEntityId, branchId} = event.scope;
    const command = {
      legalEntityId: headquartersLegalEntityId,
      dealerLegalEntityId,
      dealerAccountId: context.dealerAccountId,
      branchId,
      sourceEventId: receipt.sourceEventId,
      idempotencyKey: event.trace.idempotencyKey,
      correlationId: event.trace.correlationId
    };

    // A duplicate inbox receipt can follow a failed worker attempt. Retry processing
    // against the same stored event so the worker can replay its own committed result.
    const result = settlement.kind === 'refund'
      ? await processRefund({...command, refundId: event.payload.refundId})
      : await calculateAccrual({
        ...command,
        jobType: 'ACCRUAL_CALCULATION_REQUESTED',
        schemaVersion: 1,
        feeDefinitionId: context.feeDefinitionId,
        calculationId: event.eventId,
        runType: context.runType,
        attempt: context.attempt
      });

    return {receipt, result};
  };
}
