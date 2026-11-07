import { createFinancePaymentCheckoutHandler } from '../../../packages/shared/src/finance-payment-checkout-orchestrator.mjs';
import { createFinancePaymentProviderAdapter } from '../../../packages/shared/src/finance-payment-provider-adapter.mjs';
import { createFinancePaymentCheckoutDatabaseAdapter } from './supabase-adapter.mjs';
import { createCanonicalCheckoutProviderSender } from './provider-sender.mjs';

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} zorunludur.`);
  return value;
}

const response = (status: number, code: string, message: string) => new Response(
  JSON.stringify({ error: { code, message } }),
  { status, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' } },
);

let handler: ((request: Request) => Promise<Response>) | undefined;
function getHandler() {
  if (handler) return handler;
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
  handler = createFinancePaymentCheckoutHandler({
    gatewayToken: required('FINANCE_PAYMENT_CHECKOUT_GATEWAY_TOKEN'),
    ...database,
    createProviderCheckout: input => provider.createCheckout(input),
  });
  return handler;
}

Deno.serve(request => {
  if (!request.headers.get('authorization')?.match(/^Bearer\s+\S+$/i)) {
    return response(401, 'GATEWAY_AUTH_REQUIRED', 'Güvenilir ERP geçidi kimliği zorunludur.');
  }
  try {
    return getHandler()(request);
  } catch {
    return response(503, 'CONFIGURATION_UNAVAILABLE', 'Ödeme checkout yapılandırması henüz hazır değildir.');
  }
});
