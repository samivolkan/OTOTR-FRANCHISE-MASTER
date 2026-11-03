import {createFinanceCustomerRevenueWorkerHandler} from './core.mjs';import {createFinanceCustomerRevenueWorkerAdapter} from './supabase-adapter.mjs';
function required(name:string):string{const value=Deno.env.get(name)?.trim();if(!value)throw new Error(`${name} zorunludur.`);return value;}
const serviceRoleKey=required('SUPABASE_SERVICE_ROLE_KEY');const adapter=createFinanceCustomerRevenueWorkerAdapter({supabaseUrl:required('SUPABASE_URL'),serviceRoleKey});Deno.serve(createFinanceCustomerRevenueWorkerHandler({serviceRoleKey,...adapter}));
