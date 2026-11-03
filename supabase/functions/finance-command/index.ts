import {createFinanceCommandHandler} from './core.mjs';
import {createFinanceCommandSupabaseAdapter} from './supabase-adapter.mjs';
function required(name:string):string{const value=Deno.env.get(name)?.trim();if(!value)throw new Error(`${name} zorunludur.`);return value;}
const allowedOrigins=required('OTOTR_FINANCE_ALLOWED_ORIGINS').split(',').map(value=>value.trim()).filter(Boolean);
const adapter=createFinanceCommandSupabaseAdapter({supabaseUrl:required('SUPABASE_URL'),publishableKey:required('SUPABASE_PUBLISHABLE_KEY'),serviceRoleKey:required('SUPABASE_SERVICE_ROLE_KEY')});
Deno.serve(createFinanceCommandHandler({allowedOrigins,...adapter}));
