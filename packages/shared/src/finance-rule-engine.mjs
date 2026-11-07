import {
  addDecimal,
  compareDecimal,
  decimalToString,
  divideDecimal,
  multiplyDecimal,
  parseDecimal,
  quantizeDecimal,
  subtractDecimal,
} from './finance-decimal.mjs';

const CALCULABLE_STATUSES = new Set(['ACTIVE']);
const PREVIEW_STATUSES = new Set(['APPROVED', 'ACTIVE']);
const DECIMAL_TEXT = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]{1,8})?$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class FinanceRuleError extends Error {
  constructor(code, message, details = undefined) {
    super(message);
    this.name = 'FinanceRuleError';
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details) {
  throw new FinanceRuleError(code, message, details);
}

function assertIsoDate(value, label) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) {
    fail('INVALID_DATE', `${label} must be an ISO date (YYYY-MM-DD)`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    fail('INVALID_DATE', `${label} is not a valid calendar date`);
  }
}

function requireDecimalText(value, label, { nonNegative = false, positive = false } = {}) {
  if (typeof value !== 'string' || !DECIMAL_TEXT.test(value)) {
    fail('INVALID_DECIMAL', `${label} must be an exact decimal string with at most 8 fractional digits`);
  }
  const decimal = parseDecimal(value);
  const zero = parseDecimal('0');
  if (nonNegative && compareDecimal(decimal, zero) < 0) {
    fail('NEGATIVE_AMOUNT', `${label} cannot be negative`);
  }
  if (positive && compareDecimal(decimal, zero) <= 0) {
    fail('NON_POSITIVE_AMOUNT', `${label} must be greater than zero`);
  }
  return decimal;
}

function valueAtPath(root, path) {
  if (typeof path !== 'string' || path.length === 0) {
    fail('INVALID_CONDITION', 'Condition field must be a non-empty string');
  }
  return path.split('.').reduce((current, segment) => {
    if (current === null || typeof current !== 'object' || !(segment in current)) {
      fail('MISSING_CONDITION_VALUE', `Condition field is missing: ${path}`);
    }
    return current[segment];
  }, root);
}

function valuesEqual(actual, expected) {
  if (typeof actual === 'string' && typeof expected === 'string' && DECIMAL_TEXT.test(actual) && DECIMAL_TEXT.test(expected)) {
    return compareDecimal(parseDecimal(actual), parseDecimal(expected)) === 0;
  }
  return Object.is(actual, expected);
}

function evaluateCondition(condition, variables) {
  const actual = valueAtPath(variables, condition.field);
  const operator = condition.operator;
  const expected = condition.value;

  switch (operator) {
    case 'EQ':
      return valuesEqual(actual, expected);
    case 'NEQ':
      return !valuesEqual(actual, expected);
    case 'IN':
    case 'NOT_IN': {
      if (!Array.isArray(expected)) fail('INVALID_CONDITION', `${operator} expects an array value`);
      const included = expected.some((candidate) => valuesEqual(actual, candidate));
      return operator === 'IN' ? included : !included;
    }
    case 'GT':
    case 'GTE':
    case 'LT':
    case 'LTE': {
      const left = requireDecimalText(actual, `condition ${condition.field}`);
      const right = requireDecimalText(expected, `condition ${condition.field} expected value`);
      const comparison = compareDecimal(left, right);
      if (operator === 'GT') return comparison > 0;
      if (operator === 'GTE') return comparison >= 0;
      if (operator === 'LT') return comparison < 0;
      return comparison <= 0;
    }
    default:
      fail('UNSUPPORTED_CONDITION_OPERATOR', `Unsupported condition operator: ${operator}`);
  }
}

function amountFromInput(input, field, label = field) {
  return requireDecimalText(input[field], label, { nonNegative: true });
}

function requireParameters(calculation) {
  if (calculation === null || typeof calculation !== 'object') {
    fail('INVALID_CALCULATION', 'Calculation descriptor is required');
  }
  if (calculation.parameters === null || typeof calculation.parameters !== 'object' || Array.isArray(calculation.parameters)) {
    fail('INVALID_CALCULATION', 'Calculation parameters must be an object');
  }
  return calculation.parameters;
}

function calculateTiered(parameters, input) {
  const basis = amountFromInput(input, 'basisAmount');
  if (!Array.isArray(parameters.tiers) || parameters.tiers.length === 0) {
    fail('INVALID_TIERS', 'TIERED calculation requires at least one tier');
  }
  if (!['PROGRESSIVE', 'VOLUME'].includes(parameters.mode)) {
    fail('INVALID_TIER_MODE', 'TIERED mode must be PROGRESSIVE or VOLUME');
  }

  const tiers = parameters.tiers.map((tier, index) => {
    if (tier === null || typeof tier !== 'object') fail('INVALID_TIERS', `Tier ${index + 1} is invalid`);
    return {
      upTo: tier.upTo === null ? null : requireDecimalText(tier.upTo, `tier ${index + 1} upTo`, { positive: true }),
      rate: requireDecimalText(tier.rate, `tier ${index + 1} rate`, { nonNegative: true }),
    };
  });

  let previousLimit = parseDecimal('0');
  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    if (tier.upTo === null && index !== tiers.length - 1) {
      fail('INVALID_TIERS', 'Only the last tier may be open-ended');
    }
    if (tier.upTo !== null && compareDecimal(tier.upTo, previousLimit) <= 0) {
      fail('INVALID_TIERS', 'Tier upper limits must be strictly ascending');
    }
    if (tier.upTo !== null) previousLimit = tier.upTo;
  }

  if (parameters.mode === 'VOLUME') {
    const selected = tiers.find((tier) => tier.upTo === null || compareDecimal(basis, tier.upTo) <= 0);
    if (!selected) fail('TIER_RANGE_EXHAUSTED', 'No tier covers the basis amount');
    return multiplyDecimal(basis, selected.rate);
  }

  let total = parseDecimal('0');
  let lowerBound = parseDecimal('0');
  let covered = false;
  for (const tier of tiers) {
    if (compareDecimal(basis, lowerBound) <= 0) {
      covered = true;
      break;
    }
    const upperBound = tier.upTo === null || compareDecimal(basis, tier.upTo) < 0 ? basis : tier.upTo;
    const portion = subtractDecimal(upperBound, lowerBound);
    total = addDecimal(total, multiplyDecimal(portion, tier.rate));
    lowerBound = upperBound;
    if (compareDecimal(lowerBound, basis) >= 0) {
      covered = true;
      break;
    }
  }
  if (!covered) fail('TIER_RANGE_EXHAUSTED', 'No open-ended tier covers the remaining basis amount');
  return total;
}

function calculateRaw(calculation, input, depth = 0) {
  if (depth > 5) fail('CONDITIONAL_DEPTH_EXCEEDED', 'Conditional calculation nesting exceeds 5 levels');
  const parameters = requireParameters(calculation);

  switch (calculation.method) {
    case 'FIXED':
      return requireDecimalText(parameters.amount, 'FIXED amount', { nonNegative: true });
    case 'PERCENTAGE':
      return multiplyDecimal(
        amountFromInput(input, 'basisAmount'),
        requireDecimalText(parameters.rate, 'PERCENTAGE rate', { nonNegative: true }),
      );
    case 'PER_UNIT':
      return multiplyDecimal(
        amountFromInput(input, 'quantity'),
        requireDecimalText(parameters.unitAmount, 'PER_UNIT unitAmount', { nonNegative: true }),
      );
    case 'TIERED':
      return calculateTiered(parameters, input);
    case 'COST_PLUS': {
      const cost = requireDecimalText(input.costAmount ?? parameters.costAmount, 'COST_PLUS costAmount', { nonNegative: true });
      const hasAmount = parameters.markupAmount !== undefined;
      const hasRate = parameters.markupRate !== undefined;
      if (hasAmount === hasRate) {
        fail('INVALID_COST_PLUS', 'COST_PLUS requires exactly one of markupAmount or markupRate');
      }
      const markup = hasAmount
        ? requireDecimalText(parameters.markupAmount, 'COST_PLUS markupAmount', { nonNegative: true })
        : multiplyDecimal(cost, requireDecimalText(parameters.markupRate, 'COST_PLUS markupRate', { nonNegative: true }));
      return addDecimal(cost, markup);
    }
    case 'FIXED_PLUS_VARIABLE':
      return addDecimal(
        requireDecimalText(parameters.fixedAmount, 'FIXED_PLUS_VARIABLE fixedAmount', { nonNegative: true }),
        multiplyDecimal(
          amountFromInput(input, 'basisAmount'),
          requireDecimalText(parameters.rate, 'FIXED_PLUS_VARIABLE rate', { nonNegative: true }),
        ),
      );
    case 'CONDITIONAL': {
      if (!Array.isArray(parameters.conditions) || parameters.conditions.length === 0) {
        fail('INVALID_CONDITIONAL', 'CONDITIONAL requires conditions');
      }
      const matchMode = parameters.match ?? 'ALL';
      if (!['ALL', 'ANY'].includes(matchMode)) fail('INVALID_CONDITIONAL', 'CONDITIONAL match must be ALL or ANY');
      const results = parameters.conditions.map((condition) => evaluateCondition(condition, input.variables ?? {}));
      const matched = matchMode === 'ALL' ? results.every(Boolean) : results.some(Boolean);
      const branch = matched ? parameters.whenTrue : parameters.whenFalse;
      if (!branch) fail('CONDITIONAL_BRANCH_MISSING', `CONDITIONAL ${matched ? 'whenTrue' : 'whenFalse'} branch is missing`);
      return calculateRaw(branch, input, depth + 1);
    }
    default:
      fail('UNSUPPORTED_METHOD', `Unsupported calculation method: ${calculation.method}`);
  }
}

function validateRule(rule, input) {
  if (rule === null || typeof rule !== 'object') fail('INVALID_RULE', 'Fee rule is required');
  if (rule.configurationStatus !== 'CONFIGURED') fail('RULE_UNCONFIGURED', 'Fee rule is not configured');

  const preview = input.mode === 'PREVIEW';
  const allowedStatuses = preview ? PREVIEW_STATUSES : CALCULABLE_STATUSES;
  if (!allowedStatuses.has(rule.status)) fail('RULE_NOT_ACTIVE', `Rule status ${rule.status} cannot be calculated`);

  assertIsoDate(input.occurredOn, 'input.occurredOn');
  assertIsoDate(rule.validity?.validFrom, 'rule.validity.validFrom');
  if (rule.validity.validTo !== null && rule.validity.validTo !== undefined) {
    assertIsoDate(rule.validity.validTo, 'rule.validity.validTo');
  }
  if (
    input.occurredOn < rule.validity.validFrom ||
    (rule.validity.validTo && input.occurredOn > rule.validity.validTo)
  ) {
    fail('RULE_OUTSIDE_VALIDITY', 'Rule is not effective on the source event date');
  }

  if (
    !rule.trigger ||
    !rule.basis ||
    !rule.calculation ||
    !rule.tax ||
    !rule.due ||
    !rule.cancellationPolicy
  ) {
    fail(
      'RULE_INCOMPLETE',
      'Trigger, basis, calculation, tax, due and cancellation policy are required',
    );
  }
  if (typeof rule.createdBy?.actorId !== 'string' || rule.createdBy.actorId.length === 0) {
    fail('RULE_APPROVAL_INCOMPLETE', 'Calculable rule must identify its creator');
  }
  if (typeof rule.createdAtUtc !== 'string' || rule.createdAtUtc.length === 0) {
    fail('RULE_APPROVAL_INCOMPLETE', 'Calculable rule must identify its creation time');
  }
  if (
    typeof rule.approvedBy?.actorId !== 'string' ||
    rule.approvedBy.actorId.length === 0 ||
    typeof rule.approvedAtUtc !== 'string' ||
    rule.approvedAtUtc.length === 0
  ) {
    fail('RULE_APPROVAL_INCOMPLETE', 'Calculable rule must have a distinct approver and approval time');
  }
  if (typeof rule.tax.taxCodeVersionId !== 'string' || rule.tax.taxCodeVersionId.length === 0) {
    fail('RULE_TAX_VERSION_MISSING', 'Calculable rule must reference an approved tax code version');
  }
  if (typeof rule.feeDefinitionId !== 'string' || rule.feeDefinitionId.length === 0) {
    fail('RULE_FEE_DEFINITION_MISSING', 'Calculable rule must reference a fee definition');
  }
  if (typeof rule.trigger?.eventType !== 'string' || rule.trigger.eventType.length === 0) {
    fail('RULE_TRIGGER_MISSING', 'Calculable rule must define its source event type');
  }
  if (typeof rule.evidenceDocumentId !== 'string' || rule.evidenceDocumentId.length === 0) {
    fail('RULE_APPROVAL_INCOMPLETE', 'Calculable rule must reference its approval evidence document');
  }
  if (typeof input.taxRateVersionId !== 'string' || input.taxRateVersionId.length === 0) {
    fail('TAX_VERSION_REQUIRED', 'Resolved tax rate version is required');
  }
  if (input.taxRateVersionId !== rule.tax.taxCodeVersionId) {
    fail('TAX_VERSION_MISMATCH', 'Resolved tax rate version does not match the fee rule tax code version');
  }
  if (input.currency !== undefined && input.currency !== rule.calculation.currency) {
    fail('CURRENCY_MISMATCH', 'Input currency does not match the fee rule currency');
  }
  if (rule.approvedBy.actorId === rule.createdBy.actorId) {
    fail('MAKER_CHECKER_VIOLATION', 'Rule creator and approver cannot be the same actor');
  }
}

function applyLimits(rawAmount, calculation) {
  let result = rawAmount;
  const minimum = calculation.minimumAmount === null || calculation.minimumAmount === undefined
    ? null
    : requireDecimalText(calculation.minimumAmount, 'minimumAmount', { nonNegative: true });
  const maximum = calculation.maximumAmount === null || calculation.maximumAmount === undefined
    ? null
    : requireDecimalText(calculation.maximumAmount, 'maximumAmount', { nonNegative: true });

  if (minimum && maximum && compareDecimal(minimum, maximum) > 0) {
    fail('INVALID_LIMITS', 'minimumAmount cannot exceed maximumAmount');
  }
  if (minimum && compareDecimal(result, minimum) < 0) result = minimum;
  if (maximum && compareDecimal(result, maximum) > 0) result = maximum;
  return result;
}

function matchesScopedList(configuredValues, queryValue) {
  if (!Array.isArray(configuredValues) || configuredValues.length === 0) return true;
  return queryValue !== null && queryValue !== undefined && configuredValues.includes(queryValue);
}

function ruleMatchesScope(rule, query) {
  const scope = rule.scope ?? {};
  if (query.headquartersLegalEntityId && scope.headquartersLegalEntityId !== query.headquartersLegalEntityId) return false;
  if (query.dealerLegalEntityId && scope.dealerLegalEntityId !== query.dealerLegalEntityId) return false;
  if (!matchesScopedList(scope.branchIds, query.branchId)) return false;
  if (!matchesScopedList(scope.packageIds, query.packageId)) return false;
  if (!matchesScopedList(scope.serviceIds, query.serviceId)) return false;
  return true;
}

function ruleMatchesTrigger(rule, query) {
  if (!rule.trigger || typeof rule.trigger.eventType !== 'string') return false;
  if (rule.trigger.eventType !== query.eventType) return false;
  const conditions = rule.trigger.conditions ?? [];
  if (!Array.isArray(conditions)) fail('INVALID_TRIGGER', 'Trigger conditions must be an array');
  return conditions.every((condition) => evaluateCondition(condition, query.triggerVariables ?? {}));
}

export function selectEffectiveRule(rules, query) {
  if (!Array.isArray(rules)) fail('INVALID_RULE_SET', 'rules must be an array');
  assertIsoDate(query?.occurredOn, 'query.occurredOn');

  const matches = rules.filter((rule) =>
    rule?.status === 'ACTIVE' &&
    rule.configurationStatus === 'CONFIGURED' &&
    (!query.category || rule.category === query.category) &&
    (!query.feeDefinitionId || rule.feeDefinitionId === query.feeDefinitionId) &&
    rule.validity?.validFrom <= query.occurredOn &&
    (!rule.validity?.validTo || rule.validity.validTo >= query.occurredOn) &&
    ruleMatchesScope(rule, query) &&
    ruleMatchesTrigger(rule, query),
  );

  if (matches.length === 0) fail('NO_EFFECTIVE_RULE', 'No active rule matches the event date and scope');
  if (matches.length > 1) {
    fail('AMBIGUOUS_ACTIVE_RULE', 'More than one active rule matches the event date and scope', {
      feeRuleIds: matches.map((rule) => rule.feeRuleId),
    });
  }
  return matches[0];
}

function addDays(isoDate, days) {
  assertIsoDate(isoDate, 'due base date');
  if (!Number.isInteger(days) || days < 0) {
    fail('INVALID_DUE_RULE', 'Due day offset must be a non-negative integer');
  }
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function resolveDueDate(rule, input) {
  if (!rule?.due || typeof rule.due !== 'object' || !rule.due.parameters || typeof rule.due.parameters !== 'object') {
    fail('RULE_DUE_MISSING', 'Configured fee rule must define a due policy');
  }
  assertIsoDate(input?.businessDate, 'input.businessDate');
  switch (rule.due.ruleType) {
    case 'IMMEDIATE':
      return input.businessDate;
    case 'EVENT_PLUS_DAYS':
      return addDays(input.businessDate, rule.due.parameters.days);
    case 'INVOICE_PLUS_DAYS':
      assertIsoDate(input.invoiceDate, 'input.invoiceDate');
      return addDays(input.invoiceDate, rule.due.parameters.days);
    case 'FIXED_DAY_OF_MONTH':
      fail(
        'DUE_RULE_POLICY_NOT_APPROVED',
        'FIXED_DAY_OF_MONTH month rollover policy must be approved before calculation',
      );
      break;
    default:
      fail('INVALID_DUE_RULE', `Unsupported due rule type: ${rule.due.ruleType}`);
  }
}

export function evaluateFeeRule(rule, input) {
  validateRule(rule, input);

  const scale = rule.calculation.decimalScale;
  if (!Number.isInteger(scale) || scale < 0 || scale > 8) fail('INVALID_SCALE', 'decimalScale must be between 0 and 8');
  const roundingMode = rule.calculation.roundingMode;
  const taxRate = requireDecimalText(input.taxRate, 'input.taxRate', { nonNegative: true });

  const rawAmount = calculateRaw(rule.calculation, input);
  if (compareDecimal(rawAmount, parseDecimal('0')) < 0) fail('NEGATIVE_RESULT', 'Calculated fee amount cannot be negative');
  const limitedAmount = applyLimits(rawAmount, rule.calculation);
  const roundedAmount = quantizeDecimal(limitedAmount, scale, roundingMode);

  let netAmount;
  let taxAmount;
  let grossAmount;
  if (rule.tax.priceIncludesTax === true) {
    grossAmount = roundedAmount;
    netAmount = divideDecimal(grossAmount, addDecimal(parseDecimal('1'), taxRate), scale, roundingMode);
    taxAmount = quantizeDecimal(subtractDecimal(grossAmount, netAmount), scale, roundingMode);
  } else if (rule.tax.priceIncludesTax === false) {
    netAmount = roundedAmount;
    taxAmount = quantizeDecimal(multiplyDecimal(netAmount, taxRate), scale, roundingMode);
    grossAmount = quantizeDecimal(addDecimal(netAmount, taxAmount), scale, roundingMode);
  } else {
    fail('TAX_CONFIGURATION_MISSING', 'priceIncludesTax must be explicitly true or false');
  }

  const roundingDelta = subtractDecimal(roundedAmount, limitedAmount);
  const currency = rule.calculation.currency;
  const format = (value) => decimalToString(value, scale);

  return {
    calculationId: input.calculationId ?? null,
    status: input.mode === 'PREVIEW' ? 'PREVIEW' : 'CALCULATED',
    feeRule: {
      feeRuleId: rule.feeRuleId,
      feeRuleVersion: rule.version,
      feeDefinitionId: rule.feeDefinitionId,
      contractVersionId: rule.validity.contractVersionId,
      code: rule.code,
      category: rule.category,
    },
    source: input.source ?? null,
    scope: structuredClone(rule.scope),
    occurredOn: input.occurredOn,
    basisSnapshot: {
      basisAmount: input.basisAmount ?? null,
      quantity: input.quantity ?? null,
      costAmount: input.costAmount ?? null,
      components: structuredClone(input.basisComponents ?? []),
      currency,
    },
    amounts: {
      calculatedAmount: format(roundedAmount),
      netAmount: format(netAmount),
      taxAmount: format(taxAmount),
      grossAmount: format(grossAmount),
      currency,
    },
    tax: {
      taxCodeVersionId: rule.tax.taxCodeVersionId,
      rate: input.taxRate,
      priceIncludesTax: rule.tax.priceIncludesTax,
      source: input.taxRateSource ?? null,
    },
    rounding: {
      scale,
      mode: roundingMode,
      roundingDelta: decimalToString(roundingDelta, scale),
    },
    explanation: [
      `SYNTHETIC_REFERENCE_METHOD:${rule.calculation.method}`,
      `RULE_VERSION:${rule.version}`,
      `TAX_RATE_SOURCE:${input.taxRateSource ?? 'EXPLICIT_TEST_INPUT'}`,
    ],
    trace: structuredClone(input.trace ?? null),
  };
}

