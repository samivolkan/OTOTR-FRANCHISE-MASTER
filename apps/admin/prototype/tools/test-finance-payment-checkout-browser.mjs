import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  bindFinancePaymentCheckoutForm,
  createFinancePaymentCheckoutBrowserClient,
} from '../bayi-portal/assets/finance-payment-checkout-browser.mjs';

const id = n => `${String(n).padStart(8, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
let captured;
const client = createFinancePaymentCheckoutBrowserClient({
  endpoint: '/api/finance/card-checkout',
  returnUrlFactory: () => 'https://erp.ototr.com/apps/admin#finance',
  fetchImpl: async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ data: {
      outcome: 'CREATED', checkoutSessionId: id(2), redirectUrl: 'https://secure.provider.test/3ds/token',
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(), amount: '120.00', currencyCode: 'TRY',
    } }), { status: 200, headers: { 'content-type': 'application/json' } });
  },
});
const field = { value: id(1) };
const listeners = {};
const form = {
  dataset: {},
  elements: { namedItem: name => name === 'externalInvoiceId' ? field : null },
  addEventListener: (name, handler) => { listeners[name] = handler; },
};
const state = { textContent: '' };
const submit = { disabled: false };
let navigated = null;
bindFinancePaymentCheckoutForm({ form, state, submit, client, navigate: url => { navigated = url; } });
await listeners.submit({ preventDefault() {} });
assert.equal(form.dataset.outcome, 'CREATED');
assert.equal(navigated, 'https://secure.provider.test/3ds/token');
assert.match(state.textContent, /120.00 TRY/);
assert.equal(captured.url, '/api/finance/card-checkout');
assert.equal(captured.options.credentials, 'same-origin');
assert.deepEqual(JSON.parse(captured.options.body), {
  externalInvoiceId: id(1), returnUrl: 'https://erp.ototr.com/apps/admin#finance',
});
assert.equal(JSON.parse(captured.options.body).actorId, undefined);
assert.equal(JSON.parse(captured.options.body).amount, undefined);

const unsafe = createFinancePaymentCheckoutBrowserClient({
  returnUrlFactory: () => 'https://erp.ototr.com/#finance',
  fetchImpl: async () => new Response(JSON.stringify({ data: {
    outcome: 'CREATED', checkoutSessionId: id(2), redirectUrl: 'http://provider.test/checkout',
  } }), { status: 200, headers: { 'content-type': 'application/json' } }),
});
await assert.rejects(unsafe.createCheckout(id(1)), /Güvensiz/);

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'bayi-portal');
const html = await readFile(join(root, 'index.html'), 'utf8');
assert.match(html, /data-finance-card-checkout/);
assert.match(html, /GM Faturasını Kredi Kartıyla Öde/);
assert.match(html, /finance-payment-checkout-browser\.mjs/);
assert.doesNotMatch(html, /FINANCE_PAYMENT_CHECKOUT_GATEWAY_TOKEN/);

console.log('PASS finance checkout browser: visible card form, same-origin BFF request, no actor/amount/secret and HTTPS redirect enforcement');
