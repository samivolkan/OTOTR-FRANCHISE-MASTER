import {createFinanceCustomerSettlementHandler} from './finance-customer-settlement-handler.mjs';
import {createErpSettlementFinanceRuntime} from './finance-erp-settlement-runtime.mjs';
import {createStagingErpDemoSettlementService} from './finance-erp-demo-staging-service.mjs';

export function createErpDemoFinanceApplication({
  createSourceEventIngestionService, sourceEventDependencies, accrualWorker,
  processRefund, getWorkerAccessToken, ...staging
}) {
  const processSettlement = createErpSettlementFinanceRuntime({
    createSettlementHandler: createFinanceCustomerSettlementHandler,
    createSourceEventIngestionService,
    sourceEventDependencies,
    accrualWorker,
    refundWorker: processRefund,
    getWorkerAccessToken,
    readsCurrentRoyaltyBalance: true
  });
  return createStagingErpDemoSettlementService({...staging, processSettlement});
}
