const ROUTE_ID = /^[a-z][a-z0-9.-]{2,79}$/;
const CAPABILITY = /^[A-Z][A-Z0-9_]{1,63}$/;

/**
 * Creates a closed ERP route registry. Every declared branch operation is wrapped
 * by the finance access guard before it can be resolved by the server framework.
 */
export function createFinanceErpOperationGuardRegistry({ guard, routeCapabilities } = {}) {
  if (typeof guard !== 'function' || !routeCapabilities || typeof routeCapabilities !== 'object'
    || Array.isArray(routeCapabilities)) throw new Error('finance ERP route registry ports are required');

  const capabilityByRoute = new Map();
  for (const [routeId, capability] of Object.entries(routeCapabilities)) {
    if (!ROUTE_ID.test(routeId) || !CAPABILITY.test(capability || '') || capabilityByRoute.has(routeId)) {
      throw new Error(`invalid finance ERP route declaration: ${routeId}`);
    }
    capabilityByRoute.set(routeId, capability);
  }
  if (capabilityByRoute.size === 0) throw new Error('at least one finance-protected ERP route is required');

  const handlers = new Map();
  return Object.freeze({
    register(routeId, handler) {
      const capability = capabilityByRoute.get(routeId);
      if (!capability) throw new Error(`undeclared finance ERP route: ${routeId}`);
      if (handlers.has(routeId)) throw new Error(`duplicate finance ERP route handler: ${routeId}`);
      if (typeof handler !== 'function') throw new Error(`invalid finance ERP route handler: ${routeId}`);
      const guarded = guard(handler, Object.freeze({ routeId, capability }));
      if (typeof guarded !== 'function') throw new Error(`finance guard did not wrap ERP route: ${routeId}`);
      handlers.set(routeId, guarded);
    },
    resolve(routeId) {
      if (!capabilityByRoute.has(routeId)) throw new Error(`undeclared finance ERP route: ${routeId}`);
      const handler = handlers.get(routeId);
      if (!handler) throw new Error(`unprotected finance ERP route: ${routeId}`);
      return handler;
    },
    assertComplete() {
      const missing = [...capabilityByRoute.keys()].filter(routeId => !handlers.has(routeId));
      if (missing.length) throw new Error(`unprotected finance ERP routes: ${missing.join(',')}`);
      return Object.freeze([...capabilityByRoute.entries()].map(([routeId, capability]) => Object.freeze({ routeId, capability })));
    },
  });
}

/** Adapts createBranchFinanceRouteGuard without accepting scope from request data. */
export function createSessionBoundFinanceGuard({ routeGuardFactory, resolveVerifiedSessionScope, businessDate } = {}) {
  if (typeof routeGuardFactory !== 'function' || typeof resolveVerifiedSessionScope !== 'function'
    || typeof businessDate !== 'function') throw new Error('session-bound finance guard ports are required');
  return (handler, declaration) => routeGuardFactory({
    capability: declaration.capability,
    async resolveContext(requestContext) {
      const scope = await resolveVerifiedSessionScope(requestContext);
      return {
        actorId: scope?.actorId,
        legalEntityId: scope?.legalEntityId,
        dealerAccountId: scope?.dealerAccountId,
        branchId: scope?.branchId,
        capability: declaration.capability,
        businessDate: businessDate(),
      };
    },
  })(handler);
}
