import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createFinanceCommercialSecretConfig,
  FINANCE_COMMERCIAL_SECRET_NAMES,
} from './finance-commercial-secret-config.mjs';
import {evaluateFeeRule} from './finance-rule-engine.mjs';

const secrets = new Map([
  ['FINANCE_QUERY_TRAMER_TRY_AMOUNT', '250'],
  ['FINANCE_QUERY_KM_TRY_AMOUNT', '350'],
  ['FINANCE_QUERY_TRAMER_360_TRY_AMOUNT', '750'],
  ['FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT', '10'],
]);

function rule(calculation, category) {
  return {
    feeRuleId: `fee-rule-${category}`,
    feeDefinitionId: `fee-definition-${category}`,
    version: 1,
    code: `${category}_SECURE_CONFIG`,
    category,
    status: 'ACTIVE',
    configurationStatus: 'CONFIGURED',
    scope: {headquartersLegalEntityId: 'hq', dealerLegalEntityId: 'dealer', branchIds: ['branch'], packageIds: [], serviceIds: []},
    trigger: {eventType: category === 'QUERY' ? 'query.completed' : 'expense.approved', conditions: []},
    basis: {type: category === 'QUERY' ? 'FIXED_CATALOG' : 'SOURCE_COST'},
    calculation,
    tax: {taxCodeVersionId: 'tax-v1', priceIncludesTax: false},
    due: {ruleType: 'EVENT_PLUS_DAYS', parameters: {days: 1}},
    cancellationPolicy: {mode: 'REVERSAL'},
    validity: {contractVersionId: 'contract-v1', validFrom: '2026-11-01', validTo: null},
    createdBy: {actorId: 'maker'},
    createdAtUtc: '2026-11-01T00:00:00Z',
    approvedBy: {actorId: 'checker'},
    approvedAtUtc: '2026-11-01T01:00:00Z',
    evidenceDocumentId: 'evidence-v1',
  };
}

function input(extra = {}) {
  return {
    occurredOn: '2026-11-07',
    businessDate: '2026-11-07',
    taxRateVersionId: 'tax-v1',
    taxRate: '0.20',
    taxRateSource: 'SYNTHETIC_APPROVED_TEST_RATE',
    currency: 'TRY',
    ...extra,
  };
}

test('secure catalog materializes fixed query amounts without public value exposure', () => {
  const requested = [];
  const config = createFinanceCommercialSecretConfig({getSecret(name) { requested.push(name); return secrets.get(name); }});
  assert.deepEqual(requested, [
    ...Object.values(FINANCE_COMMERCIAL_SECRET_NAMES.queryAmounts),
    FINANCE_COMMERCIAL_SECRET_NAMES.passThroughMarkupPercent,
  ]);
  const result = evaluateFeeRule(rule(config.materializeQueryCalculation('TRAMER_QUERY'), 'QUERY'), input());
  assert.deepEqual(result.amounts, {calculatedAmount: '250.00', netAmount: '250.00', taxAmount: '50.00', grossAmount: '300.00', currency: 'TRY'});
  const status = JSON.stringify(config.publicStatus());
  for (const value of secrets.values()) assert.equal(status.includes(value), false);
  assert.equal(config.publicStatus().productionValuesExposed, false);
});

test('secure pass-through markup materializes COST_PLUS and adds tax separately', () => {
  const config = createFinanceCommercialSecretConfig({getSecret: name => secrets.get(name)});
  const result = evaluateFeeRule(rule(config.materializePassThroughCalculation(), 'PASS_THROUGH_EXPENSE'), input({costAmount: '1000'}));
  assert.deepEqual(result.amounts, {calculatedAmount: '1100.00', netAmount: '1100.00', taxAmount: '220.00', grossAmount: '1320.00', currency: 'TRY'});
});

test('missing, invalid, out-of-range and unknown service configuration fail closed without leaking values', () => {
  for (const invalid of [undefined, 'abc', '0', '100']) {
    assert.throws(
      () => createFinanceCommercialSecretConfig({getSecret: name => name === FINANCE_COMMERCIAL_SECRET_NAMES.passThroughMarkupPercent ? invalid : '1'}),
      error => error.code?.startsWith('COMMERCIAL_SECRET_') && !String(error.message).includes(String(invalid)),
    );
  }
  const config = createFinanceCommercialSecretConfig({getSecret: name => secrets.get(name)});
  assert.throws(() => config.materializeQueryCalculation('UNKNOWN_QUERY'), {code: 'QUERY_SERVICE_NOT_CONFIGURED'});
});
