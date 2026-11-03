import { createFinancePaymentCheckoutHandler } from '../../../packages/shared/src/finance-payment-checkout-orchestrator.mjs';
import { createFinancePaymentProviderAdapter } from '../../../packages/shared/src/finance-payment-provider-adapter.mjs';
import { createFinancePaymentCheckoutDatabaseAdapter } from './supabase-adapter.mjs';
import { createCanonicalCheckoutProviderSender } from './provider-sender.mjs';

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} zorunludur.`);
  return value;
}

const database = createFinancePaymentCheckoutDatabaseAdapter({
  supabaseUrl: required('SUPABASE_URL'),
  serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
});
const provider = createFinancePaymentProviderAdapter({
  providerCode: required('FINANCE_PAYMENT_PROVIDER_CODE'),
  createProviderCheckout: createCanonicalCheckoutProviderSender({
    endpoint: required('FINANCE_PAYMENT_PROVIDER_CHECKOUT_ENDPOINT'),
    bearerToken: required('FINANCE_PAYMENT_PROVIDER_CHECKOUT_BEARER_TOKEN'),
  }),
});

Deno.serve(createFinancePaymentCheckoutHandler({
  gatewayToken: required('FINANCE_PAYMENT_CHECKOUT_GATEWAY_TOKEN'),
  ...database,
  createProviderCheckout: input => provider.createCheckout(input),
}));
