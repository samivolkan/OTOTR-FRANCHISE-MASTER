import { createFinancePaymentCallbackHandler } from './core.mjs';
import { createFinancePaymentCallbackAdapter } from './supabase-adapter.mjs';

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
  const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
  const adapter = createFinancePaymentCallbackAdapter({ supabaseUrl: required('SUPABASE_URL'), serviceRoleKey });
  handler = createFinancePaymentCallbackHandler({
    providerCode: required('FINANCE_PAYMENT_PROVIDER_CODE'),
    callbackSecret: required('FINANCE_PAYMENT_PROVIDER_CALLBACK_SECRET'),
    preparedActorId: required('FINANCE_PAYMENT_PREPARED_ACTOR_ID'),
    verifiedActorId: required('FINANCE_PAYMENT_VERIFIED_ACTOR_ID'),
    ...adapter,
  });
  return handler;
}

Deno.serve(request => {
  if (!request.headers.get('x-ototr-callback-signature')) {
    return response(401, 'INVALID_SIGNATURE', 'Ödeme callback imzası doğrulanamadı.');
  }
  try {
    return getHandler()(request);
  } catch {
    return response(503, 'CONFIGURATION_UNAVAILABLE', 'Ödeme callback yapılandırması henüz hazır değildir.');
  }
});
