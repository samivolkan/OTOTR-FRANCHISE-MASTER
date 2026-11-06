import assert from 'node:assert/strict';
import test from 'node:test';
import {createErpDemoSettlementHandler} from './finance-erp-demo-settlement-handler.mjs';

test('ERP demo retries keep the transaction and refund reference', async () => {
  const rows = new Map();
  const posted = [];
  const scenario = {
    erpBranchId: crypto.randomUUID(),
    financeBranchId: crypto.randomUUID(),
    correlationId: crypto.randomUUID()
  };
  let clockTick = 0;
  const handle = createErpDemoSettlementHandler({
    environment: 'staging',
    authenticate: async () => ({id: 'demo'}),
    loadAuthorizedScenario: async () => scenario,
    clock: () => ({
      businessDate: '2026-11-06',
      occurredAtUtc: new Date(Date.UTC(2026, 10, 6, 12, clockTick++)).toISOString()
    }),
    async requestErpTransactions(path, options) {
      if (options) {
        const row = JSON.parse(options.body);
        if (!rows.has(row.transaction_no)) {
          rows.set(row.transaction_no, {...row, id: crypto.randomUUID()});
        }
        return;
      }
      const query = new URLSearchParams(path.split('?')[1]);
      const row = rows.get(query.get('transaction_no').slice(3));
      return row ? [row] : [];
    },
    async processSettlement(settlement, context) {
      assert.ok([...rows.values()].some(row => row.id === settlement.transactionId));
      posted.push({settlement, context});
      if (posted.length === 1) throw new Error('Simulated worker failure');
      return {receipt: {sourceEventId: settlement.transactionId}, result: {outcome: 'CREATED'}};
    }
  });
  const submit = operation => handle(new Request('https://erp.invalid', {
    method: 'POST',
    body: JSON.stringify({operation})
  }));

  assert.equal((await submit('refund-200')).status, 403);
  assert.equal((await submit('collection-600')).status, 502);
  assert.equal((await submit('collection-600')).status, 200);
  assert.equal((await submit('collection-400')).status, 200);
  assert.equal((await submit('refund-200')).status, 200);
  assert.deepEqual(posted[0], posted[1]);
  assert.equal(posted[3].settlement.originalCollectionId, posted[1].settlement.transactionId);
  assert.equal(rows.size, 3);
});

test('staging demo does not write when worker login fails', async () => {
  const {createStagingErpDemoSettlementService} = await import('./finance-erp-demo-staging-service.mjs');
  const id = crypto.randomUUID();
  const handle = createStagingErpDemoSettlementService({
    supabaseUrl: 'https://bsjkohwbtrfwrqcyhsfz.supabase.co',
    serviceRoleKey: 'test-only',
    allowedOrigins: [],
    identity: {
      authenticate: async () => ({id}),
      authorizeScope: async () => true
    },
    scenario: {
      actorIds: [id], erpBranchId: id, financeBranchId: id, correlationId: id,
      context: {
        runType: 'LIVE', attempt: 1, dealerAccountId: id, feeDefinitionId: id,
        scope: {branchId: id, headquartersLegalEntityId: id, dealerLegalEntityId: id}
      }
    },
    verifyWorker: async () => { throw new Error('Worker sign-in failed'); },
    fetchImpl: async () => { writes++; },
    processSettlement: async () => { postings++; }
  });
  let writes = 0;
  let postings = 0;
  const response = await handle(new Request('https://erp.invalid', {
    method: 'POST',
    headers: {Authorization: 'Bearer demo'},
    body: JSON.stringify({operation: 'collection-600'})
  }));
  assert.equal(response.status, 502);
  assert.equal(writes, 0);
  assert.equal(postings, 0);
});
