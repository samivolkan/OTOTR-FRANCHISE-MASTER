export function createFinancePaymentCheckoutDatabaseAdapter({ supabaseUrl, serviceRoleKey, fetchImpl = fetch } = {}) {
  let base;
  try { base = new URL(supabaseUrl); } catch { throw new Error('SUPABASE_URL geçersiz.'); }
  if (base.protocol !== 'https:' && !(['localhost', '127.0.0.1'].includes(base.hostname) && base.protocol === 'http:')) {
    throw new Error('SUPABASE_URL HTTPS olmalıdır.');
  }
  if (typeof serviceRoleKey !== 'string' || serviceRoleKey.length < 40) throw new Error('SUPABASE_SERVICE_ROLE_KEY zorunludur.');
  const post = async (rpc, body) => {
    const response = await fetchImpl(`${base.origin}/rest/v1/rpc/${rpc}`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Accept-Profile': 'finance_api',
        'Content-Profile': 'finance_api',
      },
      body: JSON.stringify(body),
    });
    const payload = (response.headers.get('content-type') || '').includes('application/json')
      ? await response.json().catch(() => null) : null;
    if (!response.ok) throw new Error('payment checkout database operation failed');
    return payload;
  };
  return Object.freeze({
    loadCheckoutContext: input => post('prepare_provider_card_checkout', {
      p_actor_id: input.actorId,
      p_external_invoice_id: input.externalInvoiceId,
      p_correlation_id: input.correlationId,
    }),
    recordCheckoutSession: input => post('record_provider_card_checkout', {
      p_actor_id: input.actorId,
      p_external_invoice_id: input.externalInvoiceId,
      p_provider_code: input.providerCode,
      p_provider_payment_token_hash: input.providerPaymentTokenHash,
      p_amount: input.amount,
      p_currency_code: input.currencyCode,
      p_expires_at_utc: input.expiresAtUtc,
      p_correlation_id: input.correlationId,
    }),
  });
}
