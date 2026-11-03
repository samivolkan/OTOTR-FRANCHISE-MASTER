const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MONEY = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;
const CURRENCY = /^[A-Z]{3}$/;
const digest = async value => [...new Uint8Array(await crypto.subtle.digest(
  'SHA-256', new TextEncoder().encode(value),
))].map(byte => byte.toString(16).padStart(2, '0')).join('');
const responseHeaders = id => ({
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'Correlation-Id': id,
});
const json = (status, id, body) => new Response(JSON.stringify(body), {
  status, headers: responseHeaders(id),
});
const safeUrl = value => {
  let url;
  try { url = new URL(value); } catch { throw Object.assign(new Error('Dönüş adresi geçersiz.'), { status: 400, code: 'INVALID_CHECKOUT_REQUEST' }); }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw Object.assign(new Error('Dönüş adresi HTTPS olmalıdır.'), { status: 400, code: 'INVALID_CHECKOUT_REQUEST' });
  }
  return url.href;
};
const sameSecret = async (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const [a, b] = await Promise.all([digest(left), digest(right)]);
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return mismatch === 0;
};

export function createFinancePaymentCheckoutHandler({
  gatewayToken,
  loadCheckoutContext,
  createProviderCheckout,
  recordCheckoutSession,
  correlationFactory = () => crypto.randomUUID(),
  maxBodyBytes = 4096,
} = {}) {
  if (typeof gatewayToken !== 'string' || gatewayToken.length < 40
    || typeof loadCheckoutContext !== 'function'
    || typeof createProviderCheckout !== 'function'
    || typeof recordCheckoutSession !== 'function') {
    throw new Error('Payment checkout orchestrator yapılandırması geçersiz.');
  }
  return async request => {
    const suppliedCorrelation = request.headers.get('correlation-id');
    const correlationId = UUID.test(suppliedCorrelation || '')
      ? suppliedCorrelation.toLowerCase() : correlationFactory();
    try {
      if (request.method !== 'POST') return json(405, correlationId, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Yalnızca POST desteklenir.' } });
      const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
      if (!await sameSecret(bearer, gatewayToken)) return json(401, correlationId, { error: { code: 'GATEWAY_AUTH_REQUIRED', message: 'Güvenilir ERP geçidi kimliği zorunludur.' } });
      if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return json(415, correlationId, { error: { code: 'CONTENT_TYPE_REQUIRED', message: 'application/json zorunludur.' } });
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > maxBodyBytes) return json(413, correlationId, { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Checkout isteği sınırı aşıldı.' } });
      let body;
      try { body = JSON.parse(raw); } catch { return json(400, correlationId, { error: { code: 'INVALID_JSON', message: 'Geçerli JSON zorunludur.' } }); }
      const allowed = ['actorId', 'externalInvoiceId', 'returnUrl'];
      if (!body || typeof body !== 'object' || Array.isArray(body)
        || Object.keys(body).some(key => !allowed.includes(key))
        || !UUID.test(body.actorId || '') || !UUID.test(body.externalInvoiceId || '')) {
        return json(400, correlationId, { error: { code: 'INVALID_CHECKOUT_REQUEST', message: 'Checkout isteği sözleşmesi geçersiz.' } });
      }
      const input = {
        actorId: body.actorId.toLowerCase(),
        externalInvoiceId: body.externalInvoiceId.toLowerCase(),
        returnUrl: safeUrl(body.returnUrl),
        correlationId,
      };
      const context = await loadCheckoutContext(input);
      if (!context || !UUID.test(context.legalEntityId || '') || !UUID.test(context.dealerAccountId || '')
        || !UUID.test(context.branchId || '') || !MONEY.test(context.openAmount || '')
        || Number(context.openAmount) <= 0 || !CURRENCY.test(context.currencyCode || '')
        || context.invoiceStatus !== 'ISSUED' || context.paymentMethod !== 'CREDIT_CARD') {
        throw new Error('invalid server checkout context');
      }
      const checkout = await createProviderCheckout({
        externalInvoiceId: input.externalInvoiceId,
        legalEntityId: context.legalEntityId,
        dealerAccountId: context.dealerAccountId,
        branchId: context.branchId,
        amount: context.openAmount,
        currencyCode: context.currencyCode,
        returnUrl: input.returnUrl,
        correlationId,
      });
      if (!checkout || typeof checkout.providerPaymentToken !== 'string'
        || typeof checkout.redirectUrl !== 'string' || typeof checkout.expiresAtUtc !== 'string') {
        throw new Error('invalid provider checkout response');
      }
      const tokenHash = await digest(checkout.providerPaymentToken);
      const recorded = await recordCheckoutSession({
        actorId: input.actorId,
        externalInvoiceId: input.externalInvoiceId,
        legalEntityId: context.legalEntityId,
        dealerAccountId: context.dealerAccountId,
        branchId: context.branchId,
        amount: context.openAmount,
        currencyCode: context.currencyCode,
        providerCode: checkout.providerCode,
        providerPaymentTokenHash: tokenHash,
        expiresAtUtc: checkout.expiresAtUtc,
        correlationId,
      });
      if (!recorded || !UUID.test(recorded.checkoutSessionId || '') || !['CREATED', 'REPLAY'].includes(recorded.outcome)) {
        throw new Error('checkout session was not recorded');
      }
      return json(200, correlationId, { data: {
        checkoutSessionId: recorded.checkoutSessionId,
        outcome: recorded.outcome,
        redirectUrl: checkout.redirectUrl,
        expiresAtUtc: checkout.expiresAtUtc,
        amount: context.openAmount,
        currencyCode: context.currencyCode,
        cardDataStored: false,
        correlationId,
      } });
    } catch (error) {
      const known = Number.isInteger(error?.status) && typeof error?.code === 'string';
      return json(known ? error.status : 500, correlationId, { error: {
        code: known ? error.code : 'INTERNAL_ERROR',
        message: known ? error.message : 'Ödeme checkout işlemi tamamlanamadı.',
      } });
    }
  };
}
