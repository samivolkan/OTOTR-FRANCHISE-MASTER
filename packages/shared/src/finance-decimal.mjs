const INPUT_PATTERN = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]{1,8})?$/;
const ROUNDING_MODES = new Set(['HALF_UP', 'HALF_EVEN', 'DOWN', 'UP']);
const POWERS_OF_TEN = [1n];

function powerOfTen(exponent) {
  assertScale(exponent, 'exponent', 64);
  while (POWERS_OF_TEN.length <= exponent) {
    POWERS_OF_TEN.push(POWERS_OF_TEN.at(-1) * 10n);
  }
  return POWERS_OF_TEN[exponent];
}

function assertScale(value, label, maximum = 32) {
  if (!Number.isInteger(value) || value < 0 || value > maximum) {
    throw new RangeError(`${label} must be an integer between 0 and ${maximum}`);
  }
}

function assertDecimal(value, label = 'decimal') {
  if (
    value === null ||
    typeof value !== 'object' ||
    typeof value.coefficient !== 'bigint' ||
    !Number.isInteger(value.scale) ||
    value.scale < 0 ||
    value.scale > 32
  ) {
    throw new TypeError(`${label} must be a decimal returned by parseDecimal or a decimal operation`);
  }
}

function makeDecimal(coefficient, scale, { normalize = true } = {}) {
  assertScale(scale, 'scale');
  if (typeof coefficient !== 'bigint') {
    throw new TypeError('coefficient must be a bigint');
  }

  if (!normalize) {
    return Object.freeze({ coefficient, scale });
  }

  if (coefficient === 0n) {
    return Object.freeze({ coefficient: 0n, scale: 0 });
  }

  let normalizedCoefficient = coefficient;
  let normalizedScale = scale;
  while (normalizedScale > 0 && normalizedCoefficient % 10n === 0n) {
    normalizedCoefficient /= 10n;
    normalizedScale -= 1;
  }

  return Object.freeze({ coefficient: normalizedCoefficient, scale: normalizedScale });
}

function align(a, b) {
  assertDecimal(a, 'a');
  assertDecimal(b, 'b');
  const scale = a.scale >= b.scale ? a.scale : b.scale;
  return {
    a: a.coefficient * powerOfTen(scale - a.scale),
    b: b.coefficient * powerOfTen(scale - b.scale),
    scale,
  };
}

function assertRoundingMode(roundingMode) {
  if (!ROUNDING_MODES.has(roundingMode)) {
    throw new RangeError(`Unsupported rounding mode: ${roundingMode}`);
  }
}

function divideAndRound(numerator, denominator, roundingMode) {
  assertRoundingMode(roundingMode);
  if (denominator === 0n) {
    throw new RangeError('Division by zero');
  }

  let normalizedNumerator = numerator;
  let normalizedDenominator = denominator;
  if (normalizedDenominator < 0n) {
    normalizedNumerator = -normalizedNumerator;
    normalizedDenominator = -normalizedDenominator;
  }

  const quotient = normalizedNumerator / normalizedDenominator;
  const remainder = normalizedNumerator % normalizedDenominator;
  if (remainder === 0n) {
    return quotient;
  }

  const sign = normalizedNumerator < 0n ? -1n : 1n;
  const absoluteRemainder = remainder < 0n ? -remainder : remainder;
  let increment = false;

  switch (roundingMode) {
    case 'DOWN':
      increment = false;
      break;
    case 'UP':
      increment = true;
      break;
    case 'HALF_UP':
      increment = absoluteRemainder * 2n >= normalizedDenominator;
      break;
    case 'HALF_EVEN': {
      const doubledRemainder = absoluteRemainder * 2n;
      increment =
        doubledRemainder > normalizedDenominator ||
        (doubledRemainder === normalizedDenominator && (quotient < 0n ? -quotient : quotient) % 2n === 1n);
      break;
    }
  }

  return increment ? quotient + sign : quotient;
}

export function parseDecimal(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Decimal input must be a string');
  }
  if (!INPUT_PATTERN.test(value)) {
    throw new RangeError(`Invalid decimal string: ${value}`);
  }

  const negative = value.startsWith('-');
  const unsigned = negative ? value.slice(1) : value;
  const [integerPart, fractionalPart = ''] = unsigned.split('.');
  const coefficient = BigInt(`${integerPart}${fractionalPart}`) * (negative ? -1n : 1n);
  return makeDecimal(coefficient, fractionalPart.length);
}

export function decimalToString(decimal, minimumScale = 0) {
  assertDecimal(decimal);
  assertScale(minimumScale, 'minimumScale');

  const scale = decimal.scale >= minimumScale ? decimal.scale : minimumScale;
  const coefficient = decimal.coefficient * powerOfTen(scale - decimal.scale);
  const negative = coefficient < 0n;
  let digits = (negative ? -coefficient : coefficient).toString();

  if (scale === 0) {
    return `${negative ? '-' : ''}${digits}`;
  }

  digits = digits.padStart(scale + 1, '0');
  const splitAt = digits.length - scale;
  return `${negative ? '-' : ''}${digits.slice(0, splitAt)}.${digits.slice(splitAt)}`;
}

export function addDecimal(a, b) {
  const aligned = align(a, b);
  return makeDecimal(aligned.a + aligned.b, aligned.scale);
}

export function subtractDecimal(a, b) {
  const aligned = align(a, b);
  return makeDecimal(aligned.a - aligned.b, aligned.scale);
}

export function multiplyDecimal(a, b) {
  assertDecimal(a, 'a');
  assertDecimal(b, 'b');
  return makeDecimal(a.coefficient * b.coefficient, a.scale + b.scale);
}

export function divideDecimal(a, b, targetScale, roundingMode) {
  assertDecimal(a, 'a');
  assertDecimal(b, 'b');
  assertScale(targetScale, 'targetScale', 8);
  assertRoundingMode(roundingMode);
  if (b.coefficient === 0n) {
    throw new RangeError('Division by zero');
  }

  const exponent = targetScale + b.scale - a.scale;
  let numerator = a.coefficient;
  let denominator = b.coefficient;
  if (exponent >= 0) {
    numerator *= powerOfTen(exponent);
  } else {
    denominator *= powerOfTen(-exponent);
  }

  return makeDecimal(divideAndRound(numerator, denominator, roundingMode), targetScale, { normalize: false });
}

export function quantizeDecimal(decimal, targetScale, roundingMode) {
  assertDecimal(decimal);
  assertScale(targetScale, 'targetScale', 8);
  assertRoundingMode(roundingMode);

  if (decimal.scale === targetScale) {
    return makeDecimal(decimal.coefficient, targetScale, { normalize: false });
  }
  if (decimal.scale < targetScale) {
    return makeDecimal(decimal.coefficient * powerOfTen(targetScale - decimal.scale), targetScale, { normalize: false });
  }

  const divisor = powerOfTen(decimal.scale - targetScale);
  return makeDecimal(divideAndRound(decimal.coefficient, divisor, roundingMode), targetScale, { normalize: false });
}

export function compareDecimal(a, b) {
  const aligned = align(a, b);
  if (aligned.a < aligned.b) return -1;
  if (aligned.a > aligned.b) return 1;
  return 0;
}

