import {
  compareDecimal,
  decimalToString,
  divideDecimal,
  parseDecimal,
} from './finance-decimal.mjs';

const DECIMAL = /^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,8})?$/;
const ZERO = parseDecimal('0');
const ONE_HUNDRED = parseDecimal('100');

export const FINANCE_COMMERCIAL_SECRET_NAMES = Object.freeze({
  queryAmounts: Object.freeze({
    TRAMER_QUERY: 'FINANCE_QUERY_TRAMER_TRY_AMOUNT',
    KM_QUERY: 'FINANCE_QUERY_KM_TRY_AMOUNT',
    TRAMER_360_QUERY: 'FINANCE_QUERY_TRAMER_360_TRY_AMOUNT',
  }),
  passThroughMarkupPercent: 'FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT',
});

export class FinanceCommercialConfigError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'FinanceCommercialConfigError';
    this.code = code;
  }
}

function readDecimal(getSecret, secretName, {maximumExclusive = null} = {}) {
  const raw = getSecret(secretName);
  if (typeof raw !== 'string' || !DECIMAL.test(raw.trim())) {
    throw new FinanceCommercialConfigError('COMMERCIAL_SECRET_INVALID', `Commercial secret is missing or invalid: ${secretName}`);
  }
  const value = parseDecimal(raw.trim());
  if (compareDecimal(value, ZERO) <= 0 || maximumExclusive && compareDecimal(value, maximumExclusive) >= 0) {
    throw new FinanceCommercialConfigError('COMMERCIAL_SECRET_OUT_OF_RANGE', `Commercial secret is outside its allowed range: ${secretName}`);
  }
  return value;
}

function immutableCalculation(method, parameters) {
  return Object.freeze({
    method,
    parameters: Object.freeze(parameters),
    minimumAmount: null,
    maximumAmount: null,
    currency: 'TRY',
    decimalScale: 2,
    roundingMode: 'HALF_UP',
  });
}

export function createFinanceCommercialSecretConfig({getSecret} = {}) {
  if (typeof getSecret !== 'function') {
    throw new FinanceCommercialConfigError('COMMERCIAL_SECRET_PROVIDER_REQUIRED', 'Server-side commercial secret provider is required.');
  }

  const queryAmounts = new Map(Object.entries(FINANCE_COMMERCIAL_SECRET_NAMES.queryAmounts).map(([serviceCode, secretName]) => [
    serviceCode,
    decimalToString(readDecimal(getSecret, secretName), 2),
  ]));
  const markupPercent = readDecimal(getSecret, FINANCE_COMMERCIAL_SECRET_NAMES.passThroughMarkupPercent, {maximumExclusive: ONE_HUNDRED});
  const markupRate = decimalToString(divideDecimal(markupPercent, ONE_HUNDRED, 8, 'HALF_UP'));

  return Object.freeze({
    materializeQueryCalculation(serviceCode) {
      if (!queryAmounts.has(serviceCode)) {
        throw new FinanceCommercialConfigError('QUERY_SERVICE_NOT_CONFIGURED', 'Query service code is not configured.');
      }
      return immutableCalculation('FIXED', {amount: queryAmounts.get(serviceCode)});
    },
    materializePassThroughCalculation() {
      return immutableCalculation('COST_PLUS', {markupRate});
    },
    publicStatus() {
      return Object.freeze({
        queryServiceCodes: Object.freeze([...queryAmounts.keys()]),
        queryAmountsConfigured: queryAmounts.size === Object.keys(FINANCE_COMMERCIAL_SECRET_NAMES.queryAmounts).length,
        passThroughMarkupConfigured: true,
        currency: 'TRY',
        productionValuesExposed: false,
      });
    },
  });
}
