import {createErpDemoSettlementHandler} from './finance-erp-demo-settlement-handler.mjs';
import {createErpDemoSettlementTransport} from './finance-erp-demo-settlement-transport.mjs';
import {createErpDemoSupabaseBindings} from './finance-erp-demo-supabase-bindings.mjs';
import {createErpDemoScenarioLoader} from './finance-erp-demo-scenario.mjs';

export function createStagingErpDemoSettlementService({
  supabaseUrl, serviceRoleKey, identity, scenario, allowedOrigins,
  processSettlement, verifyWorker, clock, fetchImpl
}) {
  const bindings = createErpDemoSupabaseBindings({
    supabaseUrl, serviceRoleKey, identity, fetchImpl
  });
  const resolveScenario = createErpDemoScenarioLoader({
    scenario,
    authorizeBranch: (actor, scope) => identity.authorizeScope({
      actor, scope, operationId: 'getDealerFinanceSummary'
    })
  });
  const handle = createErpDemoSettlementHandler({
    async loadAuthorizedScenario(actor) {
      const authorized = await resolveScenario(actor);
      if (authorized) await verifyWorker();
      return authorized;
    },
    ...bindings, environment: 'staging', processSettlement, clock
  });
  return createErpDemoSettlementTransport({handle, allowedOrigins});
}

