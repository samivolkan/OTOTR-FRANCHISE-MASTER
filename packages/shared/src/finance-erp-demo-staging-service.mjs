import {createErpDemoSettlementHandler} from './finance-erp-demo-settlement-handler.mjs';
import {createErpDemoSettlementTransport} from './finance-erp-demo-settlement-transport.mjs';
import {createErpDemoSupabaseBindings} from './finance-erp-demo-supabase-bindings.mjs';
import {createErpDemoScenarioLoader} from './finance-erp-demo-scenario.mjs';

export function createStagingErpDemoSettlementService({
  supabaseUrl, serviceRoleKey, identity, scenario, allowedOrigins,
  processSettlement, clock, fetchImpl
}) {
  const bindings = createErpDemoSupabaseBindings({
    supabaseUrl, serviceRoleKey, identity, fetchImpl
  });
  const loadAuthorizedScenario = createErpDemoScenarioLoader({
    scenario,
    authorizeBranch: (actor, scope) => identity.authorizeScope({
      actor, scope, operationId: 'getDealerFinanceSummary'
    })
  });
  const handle = createErpDemoSettlementHandler({
    ...bindings, environment: 'staging', loadAuthorizedScenario, processSettlement, clock
  });
  return createErpDemoSettlementTransport({handle, allowedOrigins});
}

