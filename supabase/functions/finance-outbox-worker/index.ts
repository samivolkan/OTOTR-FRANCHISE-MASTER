import { createFinanceOutboxWorkerHandler } from './core.mjs';
import { createFinanceOutboxPublisher, createFinanceOutboxSupabaseAdapter } from './supabase-adapter.mjs';

const required = (name: string) => {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} required`);
  return value;
};
const response = (status: number, code: string) => new Response(
  JSON.stringify({ error: { code } }),
  { status, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' } },
);

let handler: ((request: Request) => Promise<Response>) | undefined;
function getHandler() {
  if (handler) return handler;
  const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
  const routes = JSON.parse(required('FINANCE_OUTBOX_ROUTES'));
  const publish = createFinanceOutboxPublisher({ routes, deliveryToken: required('FINANCE_OUTBOX_DELIVERY_TOKEN') });
  const adapter = createFinanceOutboxSupabaseAdapter({ supabaseUrl: required('SUPABASE_URL'), serviceRoleKey });
  handler = createFinanceOutboxWorkerHandler({
    serviceRoleKey,
    allowedTopics: Object.keys(routes),
    publish,
    ...adapter,
  });
  return handler;
}

Deno.serve(request => {
  if (!request.headers.get('authorization')?.match(/^Bearer\s+\S+$/i)) {
    return response(401, 'WORKER_AUTH_REQUIRED');
  }
  try {
    return getHandler()(request);
  } catch {
    return response(503, 'CONFIGURATION_UNAVAILABLE');
  }
});
