export function createCanonicalCheckoutProviderSender({ endpoint, bearerToken, fetchImpl = fetch } = {}) {
  let target;
  try { target = new URL(endpoint); } catch { throw new Error('FINANCE_PAYMENT_PROVIDER_CHECKOUT_ENDPOINT geçersiz.'); }
  if (target.protocol !== 'https:') throw new Error('Ödeme sağlayıcı checkout endpoint HTTPS olmalıdır.');
  if (target.username || target.password) throw new Error('Ödeme sağlayıcı endpoint kimlik bilgisi içeremez.');
  if (typeof bearerToken !== 'string' || bearerToken.length < 32) throw new Error('Ödeme sağlayıcı bearer token zorunludur.');
  return async input => {
    const response = await fetchImpl(target.href, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        'Correlation-Id': input.correlationId,
      },
      body: JSON.stringify(input),
    });
    const payload = (response.headers.get('content-type') || '').includes('application/json')
      ? await response.json().catch(() => null) : null;
    if (!response.ok || !payload) throw new Error('Ödeme sağlayıcı checkout isteği başarısız.');
    return payload;
  };
}
