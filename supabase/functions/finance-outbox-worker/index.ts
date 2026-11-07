import {createFinanceOutboxWorkerHandler} from './core.mjs';
import {createFinanceOutboxPublisher,createFinanceOutboxSupabaseAdapter} from './supabase-adapter.mjs';
const required=(name:string)=>{const value=Deno.env.get(name)?.trim();if(!value)throw new Error(`${name} required`);return value;};
const serviceRoleKey=required('SUPABASE_SERVICE_ROLE_KEY');
const routes=JSON.parse(required('FINANCE_OUTBOX_ROUTES'));
const allowedTopics=Object.keys(routes);
const adapter=createFinanceOutboxSupabaseAdapter({supabaseUrl:required('SUPABASE_URL'),serviceRoleKey});
const publish=createFinanceOutboxPublisher({routes,deliveryToken:required('FINANCE_OUTBOX_DELIVERY_TOKEN')});
Deno.serve(createFinanceOutboxWorkerHandler({serviceRoleKey,allowedTopics,publish,...adapter}));
