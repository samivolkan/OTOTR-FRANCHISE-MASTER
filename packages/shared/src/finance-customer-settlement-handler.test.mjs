import assert from 'node:assert/strict';
import test from 'node:test';
import {createFinanceCustomerSettlementHandler} from './finance-customer-settlement-handler.mjs';
import {createFinanceRefundWorkerAdapter} from '../../../supabase/functions/finance-refund-worker/supabase-adapter.mjs';

test('ERP refund forwards the trusted actor and persisted finance event to the refund RPC', async () => {
  const actorId = crypto.randomUUID();
  const sourceEventId = crypto.randomUUID();
  const branchId = crypto.randomUUID();
  const originalCollectionId = crypto.randomUUID();
  const transactionId = crypto.randomUUID();
  const timestamp = '2026-11-06T12:00:00.000Z';
  const {processRefund} = createFinanceRefundWorkerAdapter({
    supabaseUrl: 'https://staging.invalid',
    serviceRoleKey: 'test'.repeat(12),
    async fetchImpl(url, options) {
      assert.equal(new URL(url).pathname, '/rest/v1/rpc/process_royalty_refund_reversal');
      const body = JSON.parse(options.body);
      assert.equal(body.p_actor_id, actorId);
      assert.equal(body.p_source_event_id, sourceEventId);
      assert.equal(body.p_refund_id, transactionId);
      assert.equal(body.p_branch_id, branchId);
      return Response.json({outcome: 'CREATED'});
    }
  });
  const handle = createFinanceCustomerSettlementHandler({
    async ingest(event) {
      assert.equal(event.payload.originalCollectionId, originalCollectionId);
      assert.equal(event.payload.refundedGrossAmount, '200.00');
      return {status: 'ACCEPTED', sourceEventId};
    },
    processRefund
  });
  const result = await handle({
    kind: 'refund', transactionId, originalCollectionId, branchId, currency: 'TRY',
    grossAmount: '200.00', status: 'SETTLED', completeness: 'PARTIAL',
    businessDate: '2026-11-06', occurredAtUtc: timestamp, correlationId: crypto.randomUUID()
  }, {
    actorId, receivedAtUtc: timestamp, dealerAccountId: crypto.randomUUID(),
    scope: {branchId, headquartersLegalEntityId: crypto.randomUUID(), dealerLegalEntityId: crypto.randomUUID()}
  });
  assert.equal(result.result.outcome, 'CREATED');
});
