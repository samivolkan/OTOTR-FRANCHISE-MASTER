import assert from 'node:assert/strict';
import { createFinancePaymentCheckoutRoute } from './finance-payment-checkout-route.mjs';

const id = n => `${String(n).padStart(8, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
const calls = [];
const route = createFinancePaymentCheckoutRoute({
  resolveActorId: async request => {
    calls.push({ sessionCookie: request.headers.get('cookie') });
    return id(1);
  },
  checkoutClient: { createCheckout: async input => {
    calls.push(input);
    return {
      outcome: 'CREATED', checkoutSessionId: id(3), redirectUrl: 'https://secure.provider.test/3ds/token',
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(), amount: '120.00', currencyCode: 'TRY', correlationId: id(9),
    };
  } },
});
const request = body => new Request('https://erp.ototr.com/api/finance/card-checkout', {
  method: 'POST', headers: { 'content-type': 'application/json', cookie: 'session=opaque' }, body: JSON.stringify(body),
});
let response = await route(request({ externalInvoiceId: id(2), returnUrl: 'https://erp.ototr.com/payment-result' }));
assert.equal(response.status, 200);
assert.equal((await response.json()).data.checkoutSessionId, id(3));
assert.equal(calls[1].actorId, id(1));
assert.equal(calls[1].externalInvoiceId, id(2));

response = await route(request({ actorId: id(8), externalInvoiceId: id(2), returnUrl: 'https://erp.ototr.com/payment-result' }));
assert.equal(response.status, 400);
assert.equal(calls.length, 3);

const unauthenticated = createFinancePaymentCheckoutRoute({
  resolveActorId: async () => null,
  checkoutClient: { createCheckout: async () => { throw new Error('must not be called'); } },
});
response = await unauthenticated(request({ externalInvoiceId: id(2), returnUrl: 'https://erp.ototr.com/payment-result' }));
assert.equal(response.status, 401);

const unavailable = createFinancePaymentCheckoutRoute({
  resolveActorId: async () => id(1), checkoutClient: { createCheckout: async () => ({ outcome: 'UNAVAILABLE' }) },
});
response = await unavailable(request({ externalInvoiceId: id(2), returnUrl: 'https://erp.ototr.com/payment-result' }));
assert.equal(response.status, 503);
assert.equal((await response.json()).error.code, 'CHECKOUT_UNAVAILABLE');

console.log('PASS finance payment checkout route: actor from server session, strict browser payload and fail-closed BFF handoff');
