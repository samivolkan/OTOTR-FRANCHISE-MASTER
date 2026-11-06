/** Bind the ERP settlement flow to the existing finance ingestion and worker runtimes. */
export function createErpSettlementFinanceRuntime({
  createSettlementHandler,
  createSourceEventIngestionService,
  sourceEventDependencies,
  accrualWorker,
  refundWorker,
  getWorkerAccessToken
}) {
  return async function processErpSettlement(settlement, context) {
    const token = await getWorkerAccessToken();
    const actor = await sourceEventDependencies.authenticate(token);
    if (!actor?.id) throw new Error('ERP finance worker could not authenticate');

    const service = createSourceEventIngestionService({
      repository: sourceEventDependencies.repositoryForActor(actor)
    });
    const processSettlement = createSettlementHandler({
      async ingest(event) {
        const allowed = await sourceEventDependencies.authorizeSourceEvent({
          actor, scope: event.scope, permission: 'finance.source-events.ingest'
        });
        if (allowed !== true) throw new Error('ERP finance worker scope denied');
        return service.ingest(event);
      },
      async calculateAccrual(job) {
        const result = await accrualWorker.process(job);
        if (result?.status !== 'SUCCEEDED') {
          throw Object.assign(new Error('Royalty calculation did not complete'), {
            code: result?.errorCode, disposition: result?.disposition
          });
        }
        return result;
      },
      processRefund: refundWorker
    });
    return processSettlement(settlement, {...context, actorId: actor.id});
  };
}
