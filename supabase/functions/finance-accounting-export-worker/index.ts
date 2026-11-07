import { createFinanceAccountingExportWorkerHandler, createHttpsAccountingProviderSender } from './core.mjs';
import { createFinanceAccountingExportAdapter } from './supabase-adapter.mjs';

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
  const adapter = createFinanceAccountingExportAdapter({ supabaseUrl: required('SUPABASE_URL'), serviceRoleKey });
  handler = createFinanceAccountingExportWorkerHandler({
    serviceRoleKey,
    providerId: required('ACCOUNTING_PROVIDER_ID'),
    providerEndpoint: required('ACCOUNTING_PROVIDER_ENDPOINT'),
    providerBearerToken: required('ACCOUNTING_PROVIDER_BEARER_TOKEN'),
    ...adapter,
    sendProvider: createHttpsAccountingProviderSender(),
  });
  return handler;
}

Deno.serve(request => {
  if (!request.headers.get('authorization')?.match(/^Bearer\s+\S+$/i)) {
    return response(401, 'WORKER_AUTH_REQUIRED', 'Güvenilir finans worker kimliği zorunludur.');
  }
  try {
    return getHandler()(request);
  } catch {
    return response(503, 'CONFIGURATION_UNAVAILABLE', 'Muhasebe export yapılandırması henüz hazır değildir.');
  }
});
