import assert from 'node:assert/strict';
import { createFinancePaymentCheckoutBffClient } from './finance-payment-checkout-bff-client.mjs';

const id = n => `${String(n).padStart(8, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
const gatewayToken = 'server-only-checkout-gateway-token-longer-than-forty-characters';
const input = { actorId: id(1), externalInvoiceId: id(2), returnUrl: 'https://erp.ototr.com/payment-result' };
let captured;
const client = createFinancePaymentCheckoutBffClient({
  endpoint: 'https://project.test/functions/v1/finance-payment-checkout',
  gatewayToken,
  allowedReturnOrigins: ['https://erp.ototr.com'],
  correlationFactory: () => id(9),
  fetchImpl: async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ data: {
      outcome: 'CREATED', checkoutSessionId: id(3), redirectUrl: 'https://secure.provider.test/3ds/token',
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(), amount: '120.00', currencyCode: 'TRY',
      cardDataStored: false, correlationId: id(9),
    } }), { status: 200, headers: { 'content-type': 'application/json' } });
  },
});
let result = await client.createCheckout(input);
assert.equal(result.outcome, 'CREATED');
assert.equal(result.checkoutSessionId, id(3));
assert.match(result.redirectUrl, /^https:/);
assert.equal(captured.url, 'https://project.test/functions/v1/finance-payment-checkout');
assert.match(captured.options.headers.Authorization, /^Bearer /);
assert.deepEqual(JSON.parse(captured.options.body), input);

const serverError = createFinancePaymentCheckoutBffClient({
  endpoint: 'https://project.test/functions/v1/finance-payment-checkout', gatewayToken,
  allowedReturnOrigins: ['https://erp.ototr.com'],
  correlationFactory: () => id(9),
  fetchImpl: async () => new Response(JSON.stringify({ data: {
    outcome: 'CREATED', checkoutSessionId: id(3), redirectUrl: 'https://secure.provider.test/3ds/token',
    expiresAtUtc: new Date(Date.now() + 300_000).toISOString(), amount: '120.00', currencyCode: 'TRY', cardDataStored: false,
  } }), { status: 500, headers: { 'content-type': 'application/json' } }),
});
result = await serverError.createCheckout(input);
assert.equal(result.outcome, 'UNAVAILABLE');
assert.equal(result.redirectUrl, null);

const unsafeRedirect = createFinancePaymentCheckoutBffClient({
  endpoint: 'https://project.test/functions/v1/finance-payment-checkout', gatewayToken,
  allowedReturnOrigins: ['https://erp.ototr.com'],
  correlationFactory: () => id(9),
  fetchImpl: async () => new Response(JSON.stringify({ data: {
    outcome: 'CREATED', checkoutSessionId: id(3), redirectUrl: 'http://provider.test/checkout',
    expiresAtUtc: new Date(Date.now() + 300_000).toISOString(), amount: '120.00', currencyCode: 'TRY', cardDataStored: false,
  } }), { status: 200, headers: { 'content-type': 'application/json' } }),
});
result = await unsafeRedirect.createCheckout(input);
assert.equal(result.outcome, 'UNAVAILABLE');

assert.throws(() => createFinancePaymentCheckoutBffClient({
  endpoint: 'http://project.test/checkout', gatewayToken,
  allowedReturnOrigins: ['https://erp.ototr.com'],
}), /HTTPS/);
assert.throws(() => createFinancePaymentCheckoutBffClient({
  endpoint: 'https://project.test/checkout', gatewayToken: 'public',
  allowedReturnOrigins: ['https://erp.ototr.com'],
}), /server-only/);
await assert.rejects(client.createCheckout({ ...input, amount: '1.00' }), /invalid checkout request/);
await assert.rejects(client.createCheckout({ ...input, returnUrl: 'https://evil.example/payment-result' }), /origin is not allowed/);

console.log('PASS finance payment checkout BFF client: server-only token, exact request, HTTPS redirects and fail-closed response validation');
