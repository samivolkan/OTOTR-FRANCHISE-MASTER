import assert from 'node:assert/strict';
import { createFinancePaymentCheckoutHandler } from './finance-payment-checkout-orchestrator.mjs';
import { createFinancePaymentProviderAdapter } from './finance-payment-provider-adapter.mjs';

const id = n => `${String(n).padStart(8, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
const gatewayToken = 'server-only-gateway-token-longer-than-forty-characters';
const requestBody = { actorId: id(1), externalInvoiceId: id(2), returnUrl: 'https://erp.ototr.com/finance/result' };
const calls = [];
const provider = createFinancePaymentProviderAdapter({
  providerCode: 'PROVIDER_TEST',
  createProviderCheckout: async input => {
    calls.push(input);
    return {
      providerPaymentToken: 'provider-token-000001',
      redirectUrl: 'https://secure.provider.test/3ds/token-000001',
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
    };
  },
});
const handler = createFinancePaymentCheckoutHandler({
  gatewayToken,
  correlationFactory: () => id(9),
  loadCheckoutContext: async input => {
    calls.push(input);
    return {
      legalEntityId: id(3), dealerAccountId: id(4), branchId: id(5),
      openAmount: '240.00', currencyCode: 'TRY', invoiceStatus: 'ISSUED', paymentMethod: 'CREDIT_CARD',
    };
  },
  createProviderCheckout: input => provider.createCheckout(input),
  recordCheckoutSession: async input => {
    calls.push(input);
    return { outcome: 'CREATED', checkoutSessionId: id(6) };
  },
});
const invoke = (body = requestBody, token = gatewayToken) => handler(new Request('https://api.ototr.com/finance/checkout', {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'correlation-id': id(9) },
  body: JSON.stringify(body),
}));

let response = await invoke();
assert.equal(response.status, 200);
let payload = await response.json();
assert.equal(payload.data.checkoutSessionId, id(6));
assert.equal(payload.data.amount, '240.00');
assert.equal(payload.data.cardDataStored, false);
assert.equal(payload.data.providerPaymentToken, undefined);
assert.equal(calls[1].amount, '240.00');
assert.equal(calls[2].providerPaymentToken, undefined);
assert.match(calls[2].providerPaymentTokenHash, /^[a-f0-9]{64}$/);

response = await invoke({ ...requestBody, amount: '1.00' });
assert.equal(response.status, 400);
assert.equal((await response.json()).error.code, 'INVALID_CHECKOUT_REQUEST');

response = await invoke({ ...requestBody, cardNumber: '4111111111111111' });
assert.equal(response.status, 400);

response = await invoke(requestBody, 'wrong-token-that-is-still-longer-than-forty-characters');
assert.equal(response.status, 401);

const invalidContextHandler = createFinancePaymentCheckoutHandler({
  gatewayToken,
  correlationFactory: () => id(9),
  loadCheckoutContext: async () => ({
    legalEntityId: id(3), dealerAccountId: id(4), branchId: id(5), openAmount: '0.00',
    currencyCode: 'TRY', invoiceStatus: 'ISSUED', paymentMethod: 'CREDIT_CARD',
  }),
  createProviderCheckout: () => { throw new Error('must not be called'); },
  recordCheckoutSession: () => { throw new Error('must not be called'); },
});
response = await invalidContextHandler(new Request('https://api.ototr.com/finance/checkout', {
  method: 'POST', headers: { authorization: `Bearer ${gatewayToken}`, 'content-type': 'application/json' },
  body: JSON.stringify(requestBody),
}));
assert.equal(response.status, 500);
assert.equal((await response.json()).error.code, 'INTERNAL_ERROR');

console.log('PASS finance payment checkout orchestrator: server-derived amount/scope, gateway auth, token hashing, no raw-card or provider-token exposure');
