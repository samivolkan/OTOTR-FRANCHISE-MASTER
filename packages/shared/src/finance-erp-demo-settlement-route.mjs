/** Record a predefined staging operation, then hand the saved ERP record to finance. */
export function createErpDemoSettlementRoute({
  environment, authenticate, recordAuthorizedDemoOperation, processSettlement
}) {
  return async function handle(request) {
    const reply = (status, body) => Response.json(body, {
      status, headers: {'Cache-Control': 'no-store'}
    });
    if (environment !== 'staging') return reply(404, {code: 'DEMO_UNAVAILABLE'});
    if (request.method !== 'POST') return reply(405, {code: 'METHOD_NOT_ALLOWED'});

    try {
      const actor = await authenticate(request);
      if (!actor?.id) return reply(401, {code: 'AUTH_REQUIRED'});

      const body = await request.json().catch(() => null);
      if (!['collection-600', 'collection-400', 'refund-200'].includes(body?.operation) ||
          Object.keys(body).length !== 1) {
        return reply(400, {code: 'INVALID_DEMO_OPERATION'});
      }

      // The staging writer owns authorization, amounts, refund linkage and
      // replay safety. Retries must return the same committed ERP transaction.
      const record = await recordAuthorizedDemoOperation(actor, body.operation);
      if (!record) return reply(403, {code: 'DEMO_SCOPE_DENIED'});

      const {receipt, result} = await processSettlement(record.settlement, record.context);
      return reply(200, {
        transactionId: record.settlement.transactionId,
        sourceEventId: receipt.sourceEventId,
        outcome: result.outcome
      });
    } catch {
      return reply(502, {code: 'DEMO_PROCESSING_FAILED'});
    }
  };
}
