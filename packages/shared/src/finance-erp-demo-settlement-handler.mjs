import {createErpDemoSettlementRoute} from './finance-erp-demo-settlement-route.mjs';
import {createErpDemoSettlementStore} from './finance-erp-demo-settlement-store.mjs';
import {createErpDemoSettlementWriter} from './finance-erp-demo-settlement-writer.mjs';

export function createErpDemoSettlementHandler({
  environment, authenticate, loadAuthorizedScenario, requestErpTransactions,
  processSettlement, clock
}) {
  const store = createErpDemoSettlementStore({request: requestErpTransactions});
  const recordAuthorizedDemoOperation = createErpDemoSettlementWriter({
    ...store, loadAuthorizedScenario, clock
  });
  return createErpDemoSettlementRoute({
    environment, authenticate, recordAuthorizedDemoOperation, processSettlement
  });
}
