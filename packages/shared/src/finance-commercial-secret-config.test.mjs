import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createFinanceCommercialSecretConfig,
  createFinanceCommercialRuleMaterializer,
  FINANCE_COMMERCIAL_SECRET_NAMES,
} from './finance-commercial-secret-config.mjs';
import {evaluateFeeRule} from './finance-rule-engine.mjs';

const secrets = new Map([
  ['FINANCE_ROYALTY_DEFAULT_RATE_PERCENT', '10'],
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
  const result = evaluateFeeRule(rule(config.materializeQueryCalculation('TRAMER_QUERY'), 'QUERY'), input());
  assert.deepEqual(result.amounts, {calculatedAmount: '250.00', netAmount: '250.00', taxAmount: '50.00', grossAmount: '300.00', currency: 'TRY'});
  assert.deepEqual(requested, ['FINANCE_QUERY_TRAMER_TRY_AMOUNT']);
  const status = JSON.stringify(config.publicStatus());
  for (const value of secrets.values()) assert.equal(status.includes(value), false);
  assert.equal(config.publicStatus().productionValuesExposed, false);
});

test('missing unrelated commercial secrets do not block an available rule family', () => {
  const queryOnly = createFinanceCommercialSecretConfig({getSecret: name => name === 'FINANCE_QUERY_KM_TRY_AMOUNT' ? '350' : undefined});
  assert.deepEqual(queryOnly.materializeQueryCalculation('KM_QUERY').parameters, {amount: '350.00'});
  assert.throws(() => queryOnly.materializeDefaultRoyaltyCalculation(), {code: 'COMMERCIAL_SECRET_INVALID'});
  assert.throws(() => queryOnly.materializePassThroughCalculation(), {code: 'COMMERCIAL_SECRET_INVALID'});
  assert.deepEqual(queryOnly.publicStatus(), {
    queryServiceCodes: ['TRAMER_QUERY','KM_QUERY','TRAMER_360_QUERY'],
    queryAmountsConfigured: false,
    passThroughMarkupConfigured: false,
    royaltyDefaultConfigured: false,
    currency: 'TRY',
    productionValuesExposed: false,
  });
});

test('default royalty percentage is materialized only from server configuration', () => {
  const config = createFinanceCommercialSecretConfig({getSecret: name => secrets.get(name)});
  const result = evaluateFeeRule(
    rule(config.materializeDefaultRoyaltyCalculation(), 'ROYALTY'),
    input({basisAmount: '1000'}),
  );
  assert.deepEqual(result.amounts, {calculatedAmount: '100.00', netAmount: '100.00', taxAmount: '20.00', grossAmount: '120.00', currency: 'TRY'});
});

test('secure pass-through markup materializes COST_PLUS and adds tax separately', () => {
  const config = createFinanceCommercialSecretConfig({getSecret: name => secrets.get(name)});
  const result = evaluateFeeRule(rule(config.materializePassThroughCalculation(), 'PASS_THROUGH_EXPENSE'), input({costAmount: '1000'}));
  assert.deepEqual(result.amounts, {calculatedAmount: '1100.00', netAmount: '1100.00', taxAmount: '220.00', grossAmount: '1320.00', currency: 'TRY'});
});

test('missing, invalid, out-of-range and unknown service configuration fail closed without leaking values', () => {
  for (const invalid of [undefined, 'abc', '0', '100']) {
    assert.throws(
      () => createFinanceCommercialSecretConfig({getSecret: name => name === FINANCE_COMMERCIAL_SECRET_NAMES.passThroughMarkupPercent ? invalid : '1'}).materializePassThroughCalculation(),
      error => error.code?.startsWith('COMMERCIAL_SECRET_') && !String(error.message).includes(String(invalid)),
    );
  }
  const config = createFinanceCommercialSecretConfig({getSecret: name => secrets.get(name)});
  assert.throws(() => config.materializeQueryCalculation('UNKNOWN_QUERY'), {code: 'QUERY_SERVICE_NOT_CONFIGURED'});
});

test('server materializer replaces only approved descriptors and rejects browser supplied parameters', () => {
  const materialize = createFinanceCommercialRuleMaterializer({getSecret: name => secrets.get(name)});
  const base = rule({source: 'SERVER_COMMERCIAL_CONFIG', family: 'QUERY', serviceCode: 'KM_QUERY'}, 'QUERY');
  const materialized = materialize(base);
  assert.deepEqual(materialized.calculation, {
    method: 'FIXED', parameters: {amount: '350.00'}, minimumAmount: null, maximumAmount: null,
    currency: 'TRY', decimalScale: 2, roundingMode: 'HALF_UP',
  });
  assert.deepEqual(base.calculation, {source: 'SERVER_COMMERCIAL_CONFIG', family: 'QUERY', serviceCode: 'KM_QUERY'});
  assert.throws(() => materialize({...base, calculation: {...base.calculation, amount: '1'}}), {code: 'COMMERCIAL_RULE_DESCRIPTOR_INVALID'});
  assert.throws(() => materialize({...base, calculation: {source: 'BROWSER', family: 'QUERY', serviceCode: 'KM_QUERY'}}), {code: 'COMMERCIAL_RULE_SOURCE_INVALID'});
  const royalty = rule({source: 'SERVER_COMMERCIAL_CONFIG', family: 'ROYALTY'}, 'ROYALTY');
  assert.deepEqual(materialize(royalty).calculation, {
    method: 'PERCENTAGE', parameters: {rate: '0.10000000'}, minimumAmount: null, maximumAmount: null,
    currency: 'TRY', decimalScale: 2, roundingMode: 'HALF_UP',
  });
  assert.throws(() => materialize({...royalty, calculation: {...royalty.calculation, rate: '0.01'}}), {code: 'COMMERCIAL_RULE_DESCRIPTOR_INVALID'});
});
