const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODE = /^[A-Z][A-Z0-9_]{1,63}$/;
const MONEY = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;
const CURRENCY = /^[A-Z]{3}$/;
const TOKEN = /^[A-Za-z0-9._:-]{8,200}$/;
const FORBIDDEN = /(^|_)(pan|cardNumber|card_number|cvv|cvc|expiry|holderName|holder_name)($|_)/i;

const ownKeysDeep = (value, result = []) => {
  if (!value || typeof value !== 'object') return result;
  for (const [key, child] of Object.entries(value)) {
    result.push(key);
    ownKeysDeep(child, result);
  }
  return result;
};

const httpsUrl = (value, field) => {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${field} is invalid`); }
  if (url.protocol !== 'https:') throw new Error(`${field} must use HTTPS`);
  if (url.username || url.password) throw new Error(`${field} must not contain credentials`);
  return url.href;
};

const validateRequest = request => {
  if (!request || typeof request !== 'object' || Array.isArray(request)) throw new Error('checkout request is required');
  if (ownKeysDeep(request).some(key => FORBIDDEN.test(key))) throw new Error('raw card data is forbidden');
  const allowed = ['externalInvoiceId', 'legalEntityId', 'dealerAccountId', 'branchId', 'amount', 'currencyCode', 'returnUrl', 'correlationId'];
  if (Object.keys(request).some(key => !allowed.includes(key))) throw new Error('checkout request contains unsupported fields');
  for (const field of ['externalInvoiceId', 'legalEntityId', 'dealerAccountId', 'branchId', 'correlationId']) {
    if (!UUID.test(request[field] || '')) throw new Error(`invalid checkout ${field}`);
  }
  if (!MONEY.test(request.amount || '') || Number(request.amount) <= 0) throw new Error('invalid checkout amount');
  if (!CURRENCY.test(request.currencyCode || '')) throw new Error('invalid checkout currencyCode');
  return Object.freeze({
    externalInvoiceId: request.externalInvoiceId.toLowerCase(),
    legalEntityId: request.legalEntityId.toLowerCase(),
    dealerAccountId: request.dealerAccountId.toLowerCase(),
    branchId: request.branchId.toLowerCase(),
    amount: request.amount,
    currencyCode: request.currencyCode,
    returnUrl: httpsUrl(request.returnUrl, 'checkout returnUrl'),
    correlationId: request.correlationId.toLowerCase(),
  });
};

const validateResponse = (providerCode, response) => {
  if (!response || typeof response !== 'object' || Array.isArray(response)) throw new Error('invalid provider checkout response');
  if (ownKeysDeep(response).some(key => FORBIDDEN.test(key))) throw new Error('provider returned raw card data');
  const allowed = ['providerPaymentToken', 'redirectUrl', 'expiresAtUtc'];
  if (Object.keys(response).some(key => !allowed.includes(key))) throw new Error('provider checkout response contains unsupported fields');
  if (!TOKEN.test(response.providerPaymentToken || '')) throw new Error('invalid provider payment token');
  const expiresAt = new Date(response.expiresAtUtc);
  if (Number.isNaN(expiresAt.valueOf()) || expiresAt.valueOf() <= Date.now()) throw new Error('provider checkout expiry is invalid');
  return Object.freeze({
    providerCode,
    providerPaymentToken: response.providerPaymentToken,
    redirectUrl: httpsUrl(response.redirectUrl, 'provider redirectUrl'),
    expiresAtUtc: expiresAt.toISOString(),
    cardDataStored: false,
  });
};

export function createFinancePaymentProviderAdapter({ providerCode, createProviderCheckout } = {}) {
  if (!CODE.test(providerCode || '') || typeof createProviderCheckout !== 'function') {
    throw new Error('payment provider adapter configuration is invalid');
  }
  return Object.freeze({
    providerCode,
    async createCheckout(request) {
      const input = validateRequest(request);
      const response = await createProviderCheckout(input);
      return validateResponse(providerCode, response);
    },
  });
}
