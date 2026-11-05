import { createFinanceReadHandler } from './core.mjs';
import { createFinanceSupabaseAdapter } from './supabase-adapter.mjs';

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} zorunludur.`);
  return value;
}

const allowedOrigins = required('OTOTR_FINANCE_ALLOWED_ORIGINS').split(',').map(value => value.trim()).filter(Boolean);
const publishableKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')?.trim() ||
  JSON.parse(required('SUPABASE_PUBLISHABLE_KEYS')).default;
const adapter = createFinanceSupabaseAdapter({ supabaseUrl: required('SUPABASE_URL'), publishableKey });
const handler = createFinanceReadHandler({ allowedOrigins, ...adapter });

Deno.serve(handler);
