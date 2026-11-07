import test from 'node:test';
import assert from 'node:assert/strict';
import { createFinanceOutboxPublisher } from './supabase-adapter.mjs';

const token = 'd'.repeat(40);
const message = {
  id: '10000000-0000-4000-8000-000000000001',
  topic: 'finance.erp',
  event_type: 'ERP_SYNC',
  aggregate_type: 'branch',
  aggregate_id: '20000000-0000-4000-8000-000000000002',
  aggregate_version: 1,
  payload: { safe: true },
  payload_hash: 'a'.repeat(64),
  correlation_id: '30000000-0000-4000-8000-000000000003',
};

test('rejects every invalid route set before any delivery can start', () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return new Response(); };
  for (const routes of [
    null,
    {},
    { 'Finance ERP': { endpoint: 'https://erp.example.test/events' } },
    { 'finance.erp': { endpoint: 'http://erp.example.test/events' } },
    { 'finance.erp': { endpoint: 'https://user:pass@erp.example.test/events' } },
    { 'finance.erp': { endpoint: 'https://erp.example.test/events#secret' } },
  ]) {
    assert.throws(() => createFinanceOutboxPublisher({ routes, deliveryToken: token, fetchImpl }));
  }
  assert.equal(calls, 0);
});

test('publishes only to the prevalidated HTTPS route', async () => {
  let call;
  const publish = createFinanceOutboxPublisher({
    routes: { 'finance.erp': { endpoint: 'https://erp.example.test/events' } },
    deliveryToken: token,
    fetchImpl: async (url, options) => {
      call = { url, options };
      return new Response('', { status: 200, headers: { 'x-external-ack-id': 'ack-1' } });
    },
  });
  assert.equal(await publish(message), 'ack-1');
  assert.equal(call.url, 'https://erp.example.test/events');
  assert.equal(call.options.redirect, 'error');
  assert.equal(call.options.headers.authorization, `Bearer ${token}`);
  assert.equal(JSON.parse(call.options.body).payload.safe, true);
});

test('rejects an unconfigured topic without a network call', async () => {
  let calls = 0;
  const publish = createFinanceOutboxPublisher({
    routes: { 'finance.erp': { endpoint: 'https://erp.example.test/events' } },
    deliveryToken: token,
    fetchImpl: async () => { calls++; return new Response(); },
  });
  await assert.rejects(() => publish({ ...message, topic: 'finance.unknown' }), error => {
    assert.equal(error.code, 'ROUTE_NOT_CONFIGURED');
    assert.equal(error.retryable, false);
    return true;
  });
  assert.equal(calls, 0);
});
