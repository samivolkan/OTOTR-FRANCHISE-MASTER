/** Accept an ERP record ID and load the confirmed settlement on the server. */
export function createErpSettlementFinanceRoute({authenticate, loadAuthorizedSettlement, processSettlement}) {
  return async function handle(request) {
    const reply = (status, body) => Response.json(body, {
      status, headers: {'Cache-Control': 'no-store'}
    });
    if (request.method !== 'POST') return reply(405, {code: 'METHOD_NOT_ALLOWED'});

    try {
      const actor = await authenticate(request);
      if (!actor?.id) return reply(401, {code: 'AUTH_REQUIRED'});

      const body = await request.json().catch(() => null);
      const transactionId = body?.transactionId;
      if (typeof transactionId !== 'string' ||
          !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(transactionId) ||
          Object.keys(body).length !== 1) {
        return reply(400, {code: 'INVALID_SETTLEMENT_REFERENCE'});
      }

      const record = await loadAuthorizedSettlement(actor, transactionId);
      if (!record || record.settlement.transactionId !== transactionId) {
        return reply(403, {code: 'SETTLEMENT_SCOPE_DENIED'});
      }
      if (record.settlement.status !== 'SETTLED') {
        return reply(409, {code: 'SETTLEMENT_NOT_CONFIRMED'});
      }

      const {receipt, result} = await processSettlement(record.settlement, record.context);
      return reply(200, {sourceEventId: receipt.sourceEventId, outcome: result.outcome});
    } catch {
      return reply(502, {code: 'FINANCE_PROCESSING_FAILED'});
    }
  };
}
