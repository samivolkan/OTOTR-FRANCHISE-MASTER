import test from 'node:test';
import assert from 'node:assert/strict';
import { createFinanceOutboxWorkerHandler } from './core.mjs';

const key = 's'.repeat(32);
const id = '10000000-0000-4000-8000-000000000001';
const request = () => new Request('https://worker.test', {
  method: 'POST',
  headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', 'correlation-id': id },
  body: '{}',
});
const dependencies = overrides => ({
  serviceRoleKey: key,
  allowedTopics: ['finance.erp'],
  newId: () => id,
  clock: () => new Date('2026-11-07T00:00:00Z'),
  claim: async () => [],
  publish: async () => 'ack-1',
  acknowledge: async () => {},
  fail: async () => ({ outcome: 'RETRYING' }),
  ...overrides,
});
const message = { id, topic: 'finance.erp', attempt_count: 1 };

test('fails closed for malformed claim results and messages before delivery', async () => {
  let published = 0;
  for (const claim of [async () => ({}), async () => [{ ...message, id: 'invalid' }], async () => [{ ...message, topic: 'finance.unknown' }]]) {
    const handler = createFinanceOutboxWorkerHandler(dependencies({ claim, publish: async () => { published++; } }));
    const response = await handler(request());
    assert.equal(response.status, 503);
    assert.match((await response.json()).error.code, /^OUTBOX_(CLAIM_FAILED|MESSAGE_INVALID)$/);
  }
  assert.equal(published, 0);
});

test('records acknowledgement failures as retryable without exposing internals', async () => {
  let failure;
  const handler = createFinanceOutboxWorkerHandler(dependencies({
    claim: async () => [message],
    acknowledge: async () => { throw new Error('database password'); },
    fail: async value => { failure = value; return { outcome: 'RETRYING' }; },
  }));
  const response = await handler(request());
  const text = await response.text();
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(text).data.retrying, 1);
  assert.equal(failure.errorCode, 'ACKNOWLEDGE_FAILED');
  assert.equal(failure.retryable, true);
  assert.doesNotMatch(text, /password/);
});

test('returns a safe 503 when failure persistence is unavailable', async () => {
  const handler = createFinanceOutboxWorkerHandler(dependencies({
    claim: async () => [{ ...message, payload: { secret: 'hidden' } }],
    publish: async () => { throw new Error('private provider token'); },
    fail: async () => { throw new Error('database password'); },
  }));
  const response = await handler(request());
  const text = await response.text();
  assert.equal(response.status, 503);
  assert.equal(JSON.parse(text).error.code, 'OUTBOX_FAILURE_RECORD_FAILED');
  assert.doesNotMatch(text, /hidden|token|password/);
});

test('rejects duplicate topics and invalid dependencies at construction', () => {
  assert.throws(() => createFinanceOutboxWorkerHandler(dependencies({ allowedTopics: ['finance.erp', 'finance.erp'] })));
  assert.throws(() => createFinanceOutboxWorkerHandler(dependencies({ publish: null })));
  assert.throws(() => createFinanceOutboxWorkerHandler(dependencies({ maxAttempts: 0 })));
});
