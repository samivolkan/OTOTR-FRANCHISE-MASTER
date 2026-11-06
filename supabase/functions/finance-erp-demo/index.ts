import {createClient} from 'npm:@supabase/supabase-js@2';
import {createErpDemoFinanceApplication} from '../../../packages/shared/src/finance-erp-demo-application.mjs';
import {createStagingFinanceWorkerTokenProvider} from '../../../packages/shared/src/finance-erp-demo-worker-token.mjs';
import {createFinanceSupabaseAdapter} from '../finance-read/supabase-adapter.mjs';
import {createFinanceRefundWorkerAdapter} from '../finance-refund-worker/supabase-adapter.mjs';
import {createSourceEventIngestionService} from './engine/target-candidate/src/finance/source-event-ingestion.mjs';
import {createSourceEventSupabaseDependencies} from './engine/target-candidate/supabase/functions/finance-source-event/supabase-dependencies.mjs';
import {createAccrualCalculationWorkerRuntime} from './engine/target-candidate/supabase/functions/finance-accrual-calculation/runtime.mjs';

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(name + ' is required');
  return value;
}

const supabaseUrl = required('SUPABASE_URL');
const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
const publishableKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')?.trim() ||
  JSON.parse(required('SUPABASE_PUBLISHABLE_KEYS')).default;
const connection = {supabaseUrl, publishableKey};
const identity = createFinanceSupabaseAdapter(connection);
const {processRefund} = createFinanceRefundWorkerAdapter({supabaseUrl, serviceRoleKey});
const getWorkerAccessToken = createStagingFinanceWorkerTokenProvider({
  ...connection,
  email: required('OTOTR_FINANCE_DEMO_WORKER_EMAIL'),
  password: required('OTOTR_FINANCE_DEMO_WORKER_PASSWORD')
});

Deno.serve(createErpDemoFinanceApplication({
  ...connection, serviceRoleKey, createClient, identity, processRefund, getWorkerAccessToken,
  createSourceEventIngestionService,
  sourceEventDependencies: createSourceEventSupabaseDependencies({...connection, createClient}),
  createAccrualWorker: createAccrualCalculationWorkerRuntime,
  scenario: JSON.parse(required('OTOTR_FINANCE_DEMO_SCENARIO')),
  allowedOrigins: ['https://samivolkan.github.io'],
  clock() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now);
    const part = (type: string) => parts.find(value => value.type === type)?.value;
    return {businessDate: [part('year'), part('month'), part('day')].join('-'), occurredAtUtc: now.toISOString()};
  }
}));
