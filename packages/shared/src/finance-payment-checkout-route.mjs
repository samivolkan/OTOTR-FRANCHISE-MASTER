const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers });

export function createFinancePaymentCheckoutRoute({ resolveActorId, checkoutClient, maxBodyBytes = 2048 } = {}) {
  if (typeof resolveActorId !== 'function' || !checkoutClient || typeof checkoutClient.createCheckout !== 'function') {
    throw new Error('finance checkout route ports are required');
  }
  return async request => {
    try {
      if (request.method !== 'POST') return json(405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Yalnızca POST desteklenir.' } });
      if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return json(415, { error: { code: 'CONTENT_TYPE_REQUIRED', message: 'application/json zorunludur.' } });
      const actorId = await resolveActorId(request);
      if (!UUID.test(actorId || '')) return json(401, { error: { code: 'AUTH_REQUIRED', message: 'Geçerli ERP kullanıcı oturumu zorunludur.' } });
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > maxBodyBytes) return json(413, { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Checkout isteği sınırı aşıldı.' } });
      let body;
      try { body = JSON.parse(raw); } catch { return json(400, { error: { code: 'INVALID_JSON', message: 'Geçerli JSON zorunludur.' } }); }
      const allowed = ['externalInvoiceId', 'returnUrl'];
      if (!body || typeof body !== 'object' || Array.isArray(body)
        || Object.keys(body).some(key => !allowed.includes(key)) || !UUID.test(body.externalInvoiceId || '')
        || typeof body.returnUrl !== 'string') {
        return json(400, { error: { code: 'INVALID_CHECKOUT_REQUEST', message: 'Fatura ve dönüş adresi zorunludur.' } });
      }
      const result = await checkoutClient.createCheckout({
        actorId: actorId.toLowerCase(), externalInvoiceId: body.externalInvoiceId.toLowerCase(), returnUrl: body.returnUrl,
      });
      if (!result || !['CREATED', 'REPLAY'].includes(result.outcome) || typeof result.redirectUrl !== 'string') {
        return json(503, { error: { code: 'CHECKOUT_UNAVAILABLE', message: 'Ödeme sayfası şu anda başlatılamadı.' } });
      }
      return json(200, { data: result });
    } catch {
      return json(503, { error: { code: 'CHECKOUT_UNAVAILABLE', message: 'Ödeme sayfası şu anda başlatılamadı.' } });
    }
  };
}
