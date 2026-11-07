const RPC = Object.freeze({
  authorize: 'authorize_source_event_scope',
  find: 'find_source_event_fingerprint',
  ingest: 'ingest_source_event',
});

function dependencyError(code, message, causeCode = null) {
  const error = new Error(message); error.code = code; error.causeCode = causeCode; return error;
}

function required(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw dependencyError('CONFIGURATION_ERROR', `${field} zorunludur.`);
  return value.trim();
}

export function createSourceEventSupabaseDependencies({ createClient, supabaseUrl, publishableKey } = {}) {
  if (typeof createClient !== 'function') throw dependencyError('CONFIGURATION_ERROR', 'createClient zorunludur.');
  const url = required(supabaseUrl, 'supabaseUrl');
  const key = required(publishableKey, 'publishableKey');
  if (!key.startsWith('sb_publishable_')) throw dependencyError('CONFIGURATION_ERROR', 'Yalnız publishable key kabul edilir.');

  function clientForToken(token) {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
    if (!client?.auth?.getUser || typeof client.schema !== 'function') throw dependencyError('CONFIGURATION_ERROR', 'Supabase client sözleşmesi karşılanmıyor.');
    return client;
  }

  async function rpc(client, name, args) {
    const api = client.schema('finance_api');
    if (!api || typeof api.rpc !== 'function') throw dependencyError('CONFIGURATION_ERROR', 'finance_api RPC istemcisi bulunamadı.');
    const result = await api.rpc(name, args);
    if (result?.error) throw dependencyError('DATABASE_ERROR', `Finance RPC başarısız: ${name}`, result.error.code || null);
    return result?.data ?? null;
  }

  async function authenticate(token) {
    const client = clientForToken(token);
    const result = await client.auth.getUser(token);
    if (result?.error || !result?.data?.user?.id) return null;
    return Object.freeze({ id: result.data.user.id, client });
  }

  async function authorizeSourceEvent({ actor, scope, permission }) {
    if (!actor?.client || permission !== 'finance.source-events.ingest') return false;
    const data = await rpc(actor.client, RPC.authorize, {
      p_headquarters_legal_entity_id: scope?.headquartersLegalEntityId || null,
      p_dealer_legal_entity_id: scope?.dealerLegalEntityId || null,
      p_branch_id: scope?.branchId || null,
      p_permission: permission,
    });
    return data === true || data?.allowed === true;
  }

  function repositoryForActor(actor) {
    if (!actor?.client) throw dependencyError('CONFIGURATION_ERROR', 'Doğrulanmış actor client zorunludur.');
    return Object.freeze({
      async findBySourceAndEvent(sourceSystem, eventId, scope) {
        return rpc(actor.client, RPC.find, {
          p_source_system: sourceSystem, p_event_id: eventId,
          p_headquarters_legal_entity_id: scope?.headquartersLegalEntityId || null,
          p_dealer_legal_entity_id: scope?.dealerLegalEntityId || null,
          p_branch_id: scope?.branchId || null,
        });
      },
      async insertInboxAndSourceEvent({ event, payloadHash }) {
        return rpc(actor.client, RPC.ingest, {
          p_event: event,
          p_payload_hash: payloadHash,
          p_idempotency_key: event.trace.idempotencyKey,
          p_correlation_id: event.trace.correlationId,
        });
      },
    });
  }

  return Object.freeze({ authenticate, authorizeSourceEvent, repositoryForActor, rpcNames: RPC });
}

