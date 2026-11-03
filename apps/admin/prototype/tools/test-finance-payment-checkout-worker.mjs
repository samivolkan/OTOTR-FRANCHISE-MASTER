import assert from 'node:assert/strict';
import { createFinancePaymentCheckoutHandler } from '../../../../packages/shared/src/finance-payment-checkout-orchestrator.mjs';
import { createFinancePaymentProviderAdapter } from '../../../../packages/shared/src/finance-payment-provider-adapter.mjs';
import { createFinancePaymentCheckoutDatabaseAdapter } from '../../../../supabase/functions/finance-payment-checkout/supabase-adapter.mjs';
import { createCanonicalCheckoutProviderSender } from '../../../../supabase/functions/finance-payment-checkout/provider-sender.mjs';

const id = n => `${String(n).padStart(8, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
const serviceRoleKey = 'service-role-key-longer-than-forty-characters-for-test';
const gatewayToken = 'gateway-token-longer-than-forty-characters-for-test';
const calls = [];
const fetchImpl = async (url, options) => {
  calls.push({ url, options });
  if (url.endsWith('/prepare_provider_card_checkout')) return new Response(JSON.stringify({
    externalInvoiceId: id(2), legalEntityId: id(3), dealerAccountId: id(4), branchId: id(5),
    openAmount: '120.00', currencyCode: 'TRY', invoiceStatus: 'ISSUED', paymentMethod: 'CREDIT_CARD',
  }), { status: 200, headers: { 'content-type': 'application/json' } });
  if (url === 'https://provider.test/canonical-checkout') return new Response(JSON.stringify({
    providerPaymentToken: 'provider-token-000001',
    redirectUrl: 'https://secure.provider.test/3ds/token-000001',
    expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
  }), { status: 200, headers: { 'content-type': 'application/json' } });
  if (url.endsWith('/record_provider_card_checkout')) return new Response(JSON.stringify({
    outcome: 'CREATED', checkoutSessionId: id(6), rawCardDataStored: false, providerTokenStored: false,
  }), { status: 200, headers: { 'content-type': 'application/json' } });
  throw new Error(`unexpected URL ${url}`);
};
const database = createFinancePaymentCheckoutDatabaseAdapter({
  supabaseUrl: 'https://project.test', serviceRoleKey, fetchImpl,
});
const provider = createFinancePaymentProviderAdapter({
  providerCode: 'PROVIDER_TEST',
  createProviderCheckout: createCanonicalCheckoutProviderSender({
    endpoint: 'https://provider.test/canonical-checkout',
    bearerToken: 'provider-bearer-token-longer-than-thirty-two-characters',
    fetchImpl,
  }),
});
const handler = createFinancePaymentCheckoutHandler({
  gatewayToken, ...database, createProviderCheckout: input => provider.createCheckout(input), correlationFactory: () => id(9),
});
const response = await handler(new Request('https://project.test/functions/v1/finance-payment-checkout', {
  method: 'POST',
  headers: { authorization: `Bearer ${gatewayToken}`, 'content-type': 'application/json' },
  body: JSON.stringify({ actorId: id(1), externalInvoiceId: id(2), returnUrl: 'https://erp.ototr.com/payment-result' }),
}));
assert.equal(response.status, 200);
const result = await response.json();
assert.equal(result.data.checkoutSessionId, id(6));
assert.equal(result.data.providerPaymentToken, undefined);
assert.equal(calls.length, 3);
const providerBody = JSON.parse(calls[1].options.body);
assert.equal(providerBody.amount, '120.00');
assert.equal(providerBody.branchId, id(5));
assert.equal(providerBody.cardNumber, undefined);
const recordBody = JSON.parse(calls[2].options.body);
assert.match(recordBody.p_provider_payment_token_hash, /^[a-f0-9]{64}$/);
assert.equal(recordBody.p_provider_payment_token, undefined);
assert.match(calls[0].options.headers.Authorization, /^Bearer /);
assert.match(calls[1].options.headers.Authorization, /^Bearer /);

assert.throws(() => createCanonicalCheckoutProviderSender({
  endpoint: 'http://provider.test/checkout', bearerToken: 'x'.repeat(40), fetchImpl,
}), /HTTPS/);
assert.throws(() => createFinancePaymentCheckoutDatabaseAdapter({
  supabaseUrl: 'http://project.test', serviceRoleKey, fetchImpl,
}), /HTTPS/);

console.log('PASS finance-payment-checkout: trusted gateway, server-derived canonical provider request, service-role RPCs and token-hash-only record');
