/** Resolve royalty basis from the persisted ERP collection, never from the job payload. */
export function resolveRoyaltyCollectionInput({command, rawContext}) {
  const {sourceEvent, sourcePayload, scope} = rawContext;
  const invalid = () => Object.assign(new Error('Kesinleşmiş tahsilat matrahı doğrulanamadı.'), {
    code: 'CALCULATION_CONTEXT_INVALID'
  });

  if (sourceEvent?.id !== command.sourceEventId ||
      sourceEvent?.eventType !== 'customer-payment.settled' ||
      scope?.branchId !== command.branchId ||
      sourceEvent.branchId !== command.branchId ||
      sourcePayload?.branchId !== command.branchId ||
      sourcePayload.collectionStatus !== 'SETTLED' ||
      sourcePayload.transactionType !== 'COLLECTION' ||
      !['PARTIAL', 'FULL'].includes(sourcePayload.collectionCompleteness)) throw invalid();

  const {collectedGrossAmount, currency, collectionId} = sourcePayload;
  if (typeof collectedGrossAmount !== 'string' ||
      !/^(?:0|[1-9]\d{0,15})(?:\.\d{1,8})?$/.test(collectedGrossAmount) ||
      !/[1-9]/.test(collectedGrossAmount) ||
      typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency) ||
      typeof collectionId !== 'string' || !collectionId) throw invalid();

  return {
    basisAmount: collectedGrossAmount,
    currency,
    basisComponents: [{type: 'SETTLED_GROSS_COLLECTION', includesTax: true, amount: collectedGrossAmount}],
    triggerVariables: {collectionId}
  };
}
