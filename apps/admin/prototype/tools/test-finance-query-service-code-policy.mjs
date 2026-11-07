import assert from 'node:assert/strict';
import { createFinanceServiceUsageWorkerHandler } from '../../../../supabase/functions/finance-service-usage-worker/core.mjs';

const id = value => `${String(value).padStart(8, '0')}-1111-4111-8111-${String(value).padStart(12, '0')}`;
const serviceRoleKey = 'service-role-secret-that-is-longer-than-forty-characters';
const baseEvent = {
  actorId: id(1),
  legalEntityId: id(2),
  dealerLegalEntityId: id(3),
  dealerAccountId: id(4),
  branchId: id(5),
  sourceSystem: 'ERP_TEST',
  eventId: id(6),
  eventType: 'query.completed',
  businessDate: '2026-11-07',
  occurredAtUtc: '2026-11-07T06:00:00Z',
  serviceCode: 'TRAMER_QUERY',
  providerCode: 'PROVIDER_A',
  externalReference: 'QUERY-0001',
  providerCostAmount: '50.00',
  currency: 'TRY',
  freeEntitlementApplied: false,
  technicalRepeat: false,
};
const handler = createFinanceServiceUsageWorkerHandler({
  serviceRoleKey,
  correlationFactory: () => id(8),
  commitUsage: async () => ({ outcome: 'ACCEPTED', sourceEventId: id(9), status: 'RECEIVED' }),
});
const send = event => handler(new Request('https://worker.test', {
  method: 'POST',
  headers: { authorization: `Bearer ${serviceRoleKey}`, 'content-type': 'application/json' },
  body: JSON.stringify(event),
}));

for (const serviceCode of ['TRAMER_QUERY', 'KM_QUERY', 'TRAMER_360_QUERY']) {
  const response = await send({ ...baseEvent, serviceCode });
  assert.equal(response.status, 200, `${serviceCode} katalog sorgusu kabul edilmelidir.`);
}

const unknownQuery = await send({ ...baseEvent, serviceCode: 'UNKNOWN_QUERY' });
assert.equal(unknownQuery.status, 400, 'Katalog dışı query.completed olayı reddedilmelidir.');
assert.equal((await unknownQuery.json()).error.code, 'INVALID_EVENT');

const externalService = await send({
  ...baseEvent,
  eventType: 'external-service.delivered',
  serviceCode: 'EXTERNAL_REPORT',
});
assert.equal(externalService.status, 200, 'Harici hizmet kodları ayrı olay tipinde çalışmaya devam etmelidir.');

console.log('PASS finance query service code policy: catalog allowlist and external-service separation');
