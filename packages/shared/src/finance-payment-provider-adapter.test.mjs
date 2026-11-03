import assert from 'node:assert/strict';
import { createFinancePaymentProviderAdapter } from './finance-payment-provider-adapter.mjs';

const id = n => `${String(n).padStart(8, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
const request = {
  externalInvoiceId: id(1),
  legalEntityId: id(2),
  dealerAccountId: id(3),
  branchId: id(4),
  amount: '120.00',
  currencyCode: 'TRY',
  returnUrl: 'https://erp.ototr.com/finance/payment-result',
  correlationId: id(5),
};

let received;
const adapter = createFinancePaymentProviderAdapter({
  providerCode: 'PROVIDER_TEST',
  createProviderCheckout: async input => {
    received = input;
    return {
      providerPaymentToken: 'provider-token-000001',
      redirectUrl: 'https://secure.provider.test/3ds/token-000001',
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
    };
  },
});

const checkout = await adapter.createCheckout(request);
assert.equal(received.externalInvoiceId, id(1));
assert.equal(received.amount, '120.00');
assert.equal(checkout.providerCode, 'PROVIDER_TEST');
assert.equal(checkout.cardDataStored, false);
assert.match(checkout.redirectUrl, /^https:/);
assert.deepEqual(Object.keys(checkout).sort(), [
  'cardDataStored', 'expiresAtUtc', 'providerCode', 'providerPaymentToken', 'redirectUrl',
]);

await assert.rejects(
  adapter.createCheckout({ ...request, cardNumber: '4111111111111111' }),
  /raw card data is forbidden/,
);
await assert.rejects(
  adapter.createCheckout({ ...request, amount: '0.00' }),
  /invalid checkout amount/,
);
await assert.rejects(
  adapter.createCheckout({ ...request, returnUrl: 'http://erp.ototr.com/result' }),
  /HTTPS/,
);

const unsafeResponse = createFinancePaymentProviderAdapter({
  providerCode: 'PROVIDER_TEST',
  createProviderCheckout: async () => ({
    providerPaymentToken: 'provider-token-000002',
    redirectUrl: 'http://provider.test/checkout',
    expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
  }),
});
await assert.rejects(unsafeResponse.createCheckout(request), /HTTPS/);

const leakingResponse = createFinancePaymentProviderAdapter({
  providerCode: 'PROVIDER_TEST',
  createProviderCheckout: async () => ({
    providerPaymentToken: 'provider-token-000003',
    redirectUrl: 'https://secure.provider.test/checkout',
    expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
    metadata: { cvv: '123' },
  }),
});
await assert.rejects(leakingResponse.createCheckout(request), /raw card data/);

const expiredResponse = createFinancePaymentProviderAdapter({
  providerCode: 'PROVIDER_TEST',
  createProviderCheckout: async () => ({
    providerPaymentToken: 'provider-token-000004',
    redirectUrl: 'https://secure.provider.test/checkout',
    expiresAtUtc: new Date(Date.now() - 1_000).toISOString(),
  }),
});
await assert.rejects(expiredResponse.createCheckout(request), /expiry/);

assert.throws(
  () => createFinancePaymentProviderAdapter({ providerCode: 'bad', createProviderCheckout: async () => ({}) }),
  /configuration/,
);

console.log('PASS finance payment provider adapter: canonical checkout, token-only response, raw-card rejection, HTTPS and expiry controls');
