const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

/** Resolve one server-configured pilot scenario, with no client-provided scope. */
export function createErpDemoScenarioLoader({scenario, authorizeBranch}) {
  const {actorIds, erpBranchId, financeBranchId, correlationId, context} = scenario;
  const {scope, dealerAccountId, feeDefinitionId} = context;
  if (!Array.isArray(actorIds) || !actorIds.length ||
      ![...actorIds, erpBranchId, financeBranchId, correlationId, dealerAccountId,
        feeDefinitionId, scope.headquartersLegalEntityId, scope.dealerLegalEntityId].every(id =>
        typeof id === 'string' && UUID.test(id)) ||
      scope.branchId !== financeBranchId || context.runType !== 'LIVE') {
    throw new Error('Invalid staging ERP demo scenario');
  }
  const permittedActors = new Set(actorIds);
  const serverScenario = {
    erpBranchId, financeBranchId, correlationId,
    context: {...context, scope: {...scope}}
  };

  return async function loadAuthorizedScenario(actor) {
    if (!permittedActors.has(actor?.id)) return null;
    const allowed = await authorizeBranch(actor, {
      legalEntityId: scope.headquartersLegalEntityId,
      dealerAccountId,
      branchId: financeBranchId
    });
    return allowed === true ? serverScenario : null;
  };
}
