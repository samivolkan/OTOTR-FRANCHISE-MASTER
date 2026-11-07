const RPC = Object.freeze({
  authorize: 'authorize_accrual_calculation_scope',
  context: 'load_accrual_calculation_context',
  intent: 'find_accrual_calculation_intent',
  commit: 'commit_accrual_calculation',
});

function failure(code, message, causeCode = null) {
  const error = new Error(message); error.code = code; error.causeCode = causeCode; return error;
}
function required(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw failure('CONFIGURATION_ERROR', `${field} zorunludur.`);
  return value.trim();
}

export function createAccrualCalculationSupabaseDependencies({ createClient, supabaseUrl, publishableKey, trustedCommit, resolveCalculationInput } = {}) {
  if (typeof createClient !== 'function') throw failure('CONFIGURATION_ERROR', 'createClient zorunludur.');
  if (typeof trustedCommit !== 'function') throw failure('CONFIGURATION_ERROR', 'Sunucu tarafı güvenilir commit portu zorunludur.');
  if (typeof resolveCalculationInput !== 'function') throw failure('CONFIGURATION_ERROR', 'Onaylı matrah tanımını uygulayan sunucu çözümleyicisi zorunludur.');
  const url = required(supabaseUrl, 'supabaseUrl'); const key = required(publishableKey, 'publishableKey');
  if (!key.startsWith('sb_publishable_')) throw failure('CONFIGURATION_ERROR', 'Yalnız publishable key kabul edilir.');

  function clientForToken(token) {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
    if (!client?.auth?.getUser || typeof client.schema !== 'function') throw failure('CONFIGURATION_ERROR', 'Supabase client sözleşmesi karşılanmıyor.');
    return client;
  }
  async function rpc(client, name, args) {
    const api = client.schema('finance_api'); if (!api || typeof api.rpc !== 'function') throw failure('CONFIGURATION_ERROR', 'finance_api RPC istemcisi bulunamadı.');
    const result = await api.rpc(name, args); if (result?.error) throw failure('DATABASE_ERROR', `Finance RPC başarısız: ${name}`, result.error.code || null);
    return result?.data ?? null;
  }
  async function authenticate(token) {
    const client = clientForToken(token); const result = await client.auth.getUser(token);
    if (result?.error || !result?.data?.user?.id) return null;
    return Object.freeze({ id: result.data.user.id, client });
  }
  async function authorizeAccrualCalculation({ actor, legalEntityId, dealerLegalEntityId, branchId, permission }) {
    if (!actor?.client || permission !== 'finance.accruals.calculate') return false;
    const data = await rpc(actor.client, RPC.authorize, {
      p_legal_entity_id: legalEntityId || null, p_dealer_legal_entity_id: dealerLegalEntityId || null,
      p_branch_id: branchId || null, p_permission: permission,
    });
    return data === true || data?.allowed === true;
  }
  function repositoryForActor(actor) {
    if (!actor?.client) throw failure('CONFIGURATION_ERROR', 'Doğrulanmış actor client zorunludur.');
    return Object.freeze({
      async loadCalculationContext(command) {
        const rawContext = await rpc(actor.client, RPC.context, {
          p_legal_entity_id: command.legalEntityId, p_dealer_legal_entity_id: command.dealerLegalEntityId,
          p_dealer_account_id: command.dealerAccountId, p_branch_id: command.branchId,
          p_source_event_id: command.sourceEventId, p_fee_definition_id: command.feeDefinitionId,
          p_run_type: command.runType,
        });
        if (!rawContext) return null;
        const calculationInput = await resolveCalculationInput({ command, rawContext });
        if (!calculationInput || typeof calculationInput !== 'object') throw failure('CALCULATION_CONTEXT_INVALID', 'Sunucu matrah çözümleyicisi geçerli girdi üretmedi.');
        return Object.freeze({ ...rawContext, calculationInput });
      },
      async findCalculationIntent(intent) {
        return rpc(actor.client, RPC.intent, {
          p_source_event_id: intent.sourceEventId, p_contract_fee_rule_id: intent.contractFeeRuleId,
          p_fee_definition_id: intent.feeDefinitionId, p_run_type: intent.runType,
        });
      },
      async commitCalculation(value) {
        const response = await trustedCommit(RPC.commit, {
          p_actor_id: actor.id, p_command: value.command, p_context: value.context, p_rule: value.rule,
          p_calculation: value.calculation, p_due_date: value.dueDate, p_input_hash: value.inputHash,
          p_result_hash: value.resultHash, p_intent: value.intent,
        });
        if (!response || !['CREATED', 'REPLAY', 'CONFLICT'].includes(response.outcome)) throw failure('INVALID_PERSISTENCE_RESULT', 'Tahakkuk commit sonucu tanınmıyor.');
        if (response.outcome === 'CONFLICT') throw failure('CALCULATION_IDEMPOTENCY_CONFLICT', 'Tahakkuk niyeti farklı içerikle kayıtlı.');
        return response;
      },
    });
  }
  return Object.freeze({ authenticate, authorizeAccrualCalculation, repositoryForActor, rpcNames: RPC });
}

