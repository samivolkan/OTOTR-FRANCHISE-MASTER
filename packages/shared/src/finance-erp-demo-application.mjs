import {createFinanceCustomerSettlementHandler} from './finance-customer-settlement-handler.mjs';
import {createErpSettlementFinanceRuntime} from './finance-erp-settlement-runtime.mjs';
import {createStagingErpDemoSettlementService} from './finance-erp-demo-staging-service.mjs';

import {createErpDemoSupabaseBindings} from './finance-erp-demo-supabase-bindings.mjs';
import {resolveRoyaltyCollectionInput} from './finance-royalty-collection-input.mjs';

export function createErpDemoFinanceApplication({
  createSourceEventIngestionService, sourceEventDependencies, createAccrualWorker,
  processRefund, getWorkerAccessToken, createClient, publishableKey, ...staging
}) {
  const {trustedCommit} = createErpDemoSupabaseBindings(staging);
  const accrualWorker = {
    async process(command) {
      const worker = createAccrualWorker({
        createClient, publishableKey, supabaseUrl: staging.supabaseUrl,
        trustedCommit, resolveCalculationInput: resolveRoyaltyCollectionInput,
        workerAccessToken: await getWorkerAccessToken()
      });
      return worker.process(command);
    }
  };
  const processSettlement = createErpSettlementFinanceRuntime({
    createSettlementHandler: createFinanceCustomerSettlementHandler,
    createSourceEventIngestionService,
    sourceEventDependencies,
    accrualWorker,
    refundWorker: processRefund,
    getWorkerAccessToken,
    readsCurrentRoyaltyBalance: true
  });
  return createStagingErpDemoSettlementService({
    ...staging, processSettlement, verifyWorker: getWorkerAccessToken
  });
}
