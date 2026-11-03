const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MONEY = /^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$/;

const validHttpsUrl = (value, field) => {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${field} is invalid`); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`${field} must use HTTPS`);
  return url.href;
};

const unavailable = correlationId => Object.freeze({
  outcome: 'UNAVAILABLE', redirectUrl: null, correlationId,
});

export function createFinancePaymentCheckoutBffClient({
  endpoint,
  gatewayToken,
  fetchImpl = fetch,
  correlationFactory = () => crypto.randomUUID(),
  timeoutMs = 5000,
  allowedReturnOrigins,
} = {}) {
  const target = validHttpsUrl(endpoint, 'finance checkout endpoint');
  if (typeof gatewayToken !== 'string' || gatewayToken.length < 40) throw new Error('server-only checkout gateway token is required');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 15000) throw new Error('finance checkout timeout must be 500-15000 ms');
  if (!Array.isArray(allowedReturnOrigins) || !allowedReturnOrigins.length) throw new Error('checkout return origin allowlist is required');
  const origins = new Set(allowedReturnOrigins.map(value => new URL(validHttpsUrl(value, 'allowed checkout return origin')).origin));
  return Object.freeze({
    async createCheckout(input = {}) {
      if (!input || typeof input !== 'object' || Array.isArray(input)
        || Object.keys(input).some(key => !['actorId', 'externalInvoiceId', 'returnUrl'].includes(key))) {
        throw new Error('invalid checkout request');
      }
      const { actorId, externalInvoiceId, returnUrl } = input;
      if (!UUID.test(actorId || '') || !UUID.test(externalInvoiceId || '')) throw new Error('invalid checkout identity');
      const safeReturnUrl = validHttpsUrl(returnUrl, 'finance checkout returnUrl');
      if (!origins.has(new URL(safeReturnUrl).origin)) throw new Error('finance checkout returnUrl origin is not allowed');
      const correlationId = correlationFactory();
      if (!UUID.test(correlationId || '')) return unavailable(null);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(target, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${gatewayToken}`,
            'Content-Type': 'application/json',
            'Correlation-Id': correlationId,
          },
          body: JSON.stringify({
            actorId: actorId.toLowerCase(),
            externalInvoiceId: externalInvoiceId.toLowerCase(),
            returnUrl: safeReturnUrl,
          }),
          signal: controller.signal,
        });
        const payload = (response.headers.get('content-type') || '').includes('application/json')
          ? await response.json().catch(() => null) : null;
        const data = payload?.data;
        if (response.status !== 200 || !UUID.test(data?.checkoutSessionId || '')
          || !['CREATED', 'REPLAY'].includes(data?.outcome) || !MONEY.test(data?.amount || '')
          || !/^[A-Z]{3}$/.test(data?.currencyCode || '') || data?.cardDataStored !== false
          || typeof data?.expiresAtUtc !== 'string' || new Date(data.expiresAtUtc).valueOf() <= Date.now()) {
          return unavailable(correlationId);
        }
        return Object.freeze({
          outcome: data.outcome,
          checkoutSessionId: data.checkoutSessionId.toLowerCase(),
          redirectUrl: validHttpsUrl(data.redirectUrl, 'provider checkout redirectUrl'),
          expiresAtUtc: new Date(data.expiresAtUtc).toISOString(),
          amount: data.amount,
          currencyCode: data.currencyCode,
          correlationId: data.correlationId || correlationId,
        });
      } catch {
        return unavailable(correlationId);
      } finally {
        clearTimeout(timer);
      }
    },
  });
}
