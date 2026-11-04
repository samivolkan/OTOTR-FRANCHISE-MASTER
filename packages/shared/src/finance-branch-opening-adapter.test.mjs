import assert from 'node:assert/strict';
import test from 'node:test';
import {createFinanceBranchOpeningAdapter} from './finance-branch-opening-adapter.mjs';

const scope = {branchId: 'branch-a'};
const event = {
  eventId: 'opening-1',
  branchId: scope.branchId,
  eventType: 'branch.opened',
  branchOpeningReference: 'opening-ref-1',
  occurredAtUtc: '2026-11-04T21:00:00Z',
  amount: '999'
};

test('the Istanbul cutover boundary uses occurrence time and preserves the ERP event ID', async () => {
  const calls = [];
  const deliver = createFinanceBranchOpeningAdapter({
    cutoverDate: '2026-11-05',
    ingest: async (...args) => { calls.push(args); return {outcome: 'ACCEPTED'}; }
  });
  assert.deepEqual(await deliver({...event, occurredAtUtc: '2026-11-04T20:59:59Z'}, scope),
    {outcome: 'BEFORE_CUTOVER'});
  assert.deepEqual(await deliver(event, scope), {outcome: 'ACCEPTED'});
  assert.deepEqual(calls, [[scope, {
    eventId: 'opening-1',
    eventType: 'branch.opened',
    occurredAtUtc: '2026-11-04T21:00:00.000Z',
    businessDate: '2026-11-05',
    payload: {branchOpeningReference: 'opening-ref-1'}
  }]]);
});

test('missing cutover, invalid timestamps, missing references and scope mismatches never ingest', async () => {
  const ingest = () => assert.fail('unexpected ingestion');
  for (const cutoverDate of [undefined, '2026-02-30']) {
    const deliver = createFinanceBranchOpeningAdapter({cutoverDate, ingest});
    assert.deepEqual(await deliver(event, scope), {outcome: 'CUTOVER_NOT_CONFIGURED'});
  }
  const deliver = createFinanceBranchOpeningAdapter({cutoverDate: '2026-11-05', ingest});
  for (const invalid of [
    {branchOpeningReference: ''},
    {branchId: 'other-branch'},
    {occurredAtUtc: '2026-11-05T00:00:00'},
    {occurredAtUtc: '2026-11-31T00:00:00Z'}
  ]) {
    assert.deepEqual(await deliver({...event, ...invalid}, scope), {outcome: 'INVALID_OPENING_EVENT'});
  }
});
