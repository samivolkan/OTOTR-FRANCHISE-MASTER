function configuration(message) { const error = new Error(message); error.code = 'CONFIGURATION_ERROR'; return error; }
function database(operation) { const error = new Error(`Finance database operation failed: ${operation}`); error.code = 'DATABASE_ERROR'; return error; }

export function createFinanceSupabaseAdapter({ supabaseUrl, publishableKey, fetchImpl = fetch } = {}) {
  let base;
  try { base = new URL(supabaseUrl); } catch { throw configuration('SUPABASE_URL geçersiz.'); }
  if (base.protocol !== 'https:' && !(['localhost', '127.0.0.1'].includes(base.hostname) && base.protocol === 'http:')) throw configuration('SUPABASE_URL HTTPS olmalıdır.');
  if (typeof publishableKey !== 'string' || !publishableKey.startsWith('sb_publishable_')) throw configuration('SUPABASE_PUBLISHABLE_KEY zorunludur; legacy veya secret key kabul edilmez.');
  if (typeof fetchImpl !== 'function') throw configuration('fetch zorunludur.');

  function requestHeaders(token, profile) {
    return { apikey: publishableKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(profile ? { 'Accept-Profile': profile, 'Content-Profile': profile } : {}) };
  }
  async function post(path, token, payload, profile) {
    const response = await fetchImpl(`${base.origin}${path}`, { method: 'POST', headers: requestHeaders(token, profile), body: JSON.stringify(payload) });
    let result = null;
    if ((response.headers?.get?.('content-type') || '').includes('application/json')) { try { result = await response.json(); } catch { result = null; } }
    if (!response.ok) throw database(path);
    return result;
  }
  async function authenticate(token) {
    const response = await fetchImpl(`${base.origin}/auth/v1/user`, { headers: requestHeaders(token) });
    if (!response.ok) return null;
    const user = await response.json().catch(() => null);
    return typeof user?.id === 'string' ? Object.freeze({ id: user.id, token }) : null;
  }
  async function authorizeScope({ actor, scope, operationId }) {
    const result = await post('/rest/v1/rpc/authorize_scope', actor.token, { p_legal_entity_id: scope.legalEntityId, p_dealer_account_id: scope.dealerAccountId, p_branch_id: scope.branchId, p_operation_id: operationId }, 'finance_api');
    return result === true || result?.allowed === true;
  }
  async function readSummary({ actor, scope, dealerAccountId, asOf }) {
    return post('/rest/v1/rpc/get_dealer_finance_summary', actor.token, { p_legal_entity_id: scope.legalEntityId, p_dealer_account_id: dealerAccountId, p_branch_id: scope.branchId, p_as_of: asOf || null }, 'finance_api');
  }
  async function readStatement({ actor, scope, dealerAccountId, from, to, status, cursor, limit }) {
    return post('/rest/v1/rpc/get_dealer_statement', actor.token, {
      p_legal_entity_id: scope.legalEntityId,
      p_dealer_account_id: dealerAccountId,
      p_branch_id: scope.branchId,
      p_from: from || null,
      p_to: to || null,
      p_status: status || null,
      p_cursor: cursor || null,
      p_limit: limit || 50,
    }, 'finance_api');
  }
  async function readPayment({ actor, scope, dealerAccountId, paymentId }) {
    return post('/rest/v1/rpc/get_payment', actor.token, {
      p_legal_entity_id: scope.legalEntityId,
      p_dealer_account_id: dealerAccountId,
      p_branch_id: scope.branchId,
      p_payment_id: paymentId,
    }, 'finance_api');
  }
  async function readAccrualDetail({ actor, scope, dealerAccountId, accrualId }) {
    return post('/rest/v1/rpc/get_accrual_detail', actor.token, {
      p_legal_entity_id: scope.legalEntityId,
      p_dealer_account_id: dealerAccountId,
      p_branch_id: scope.branchId,
      p_accrual_id: accrualId,
    }, 'finance_api');
  }
  async function readRefundTrace({ actor, scope, dealerAccountId, reversalAccrualId }) {
    return post('/rest/v1/rpc/get_royalty_refund_trace_by_accrual', actor.token, {
      p_legal_entity_id:scope.legalEntityId,
      p_dealer_account_id:dealerAccountId,
      p_branch_id:scope.branchId,
      p_reversal_accrual_id:reversalAccrualId,
    }, 'finance_api');
  }
  async function readCurrentPeriod({actor,scope,dealerAccountId,asOf}) {
    return post('/rest/v1/rpc/get_current_finance_period',actor.token,{
      p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_as_of:asOf,
    },'finance_api');
  }
  return Object.freeze({ authenticate, authorizeScope, readSummary, readStatement, readPayment, readAccrualDetail, readRefundTrace, readCurrentPeriod });
}
