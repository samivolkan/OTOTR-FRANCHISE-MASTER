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
  async function authorizeHeadquartersScope({actor,legalEntityId,operationId}) {
    const result=await post('/rest/v1/rpc/authorize_headquarters_scope',actor.token,{p_legal_entity_id:legalEntityId,p_operation_id:operationId},'finance_api');
    return result===true||result?.allowed===true;
  }
  async function readHeadquartersSummary({actor,scope,asOf,currency}) {
    return post('/rest/v1/rpc/get_headquarters_finance_summary',actor.token,{p_legal_entity_id:scope.legalEntityId,p_as_of:asOf,p_currency_code:currency},'finance_api');
  }
  async function readOperationalHealth({actor,scope}) {return post('/rest/v1/rpc/get_finance_operational_health',actor.token,{p_legal_entity_id:scope.legalEntityId},'finance_api');}
  async function readExpenses({actor,scope,from,to,status,cursor,limit}) {return post('/rest/v1/rpc/list_pass_through_expenses',actor.token,{p_legal_entity_id:scope.legalEntityId,p_from:from||null,p_to:to||null,p_status:status||null,p_cursor:cursor||null,p_limit:limit||50},'finance_api');}
  async function readExpense({actor,scope,expenseId}) {return post('/rest/v1/rpc/get_pass_through_expense',actor.token,{p_legal_entity_id:scope.legalEntityId,p_expense_id:expenseId},'finance_api');}
  async function readExportPackages({actor,scope,packageType,status,cursor,limit}) {return post('/rest/v1/rpc/list_finance_export_packages',actor.token,{p_legal_entity_id:scope.legalEntityId,p_package_type:packageType||null,p_status:status||null,p_cursor:cursor||null,p_limit:limit||50},'finance_api');}
  async function readExportPackage({actor,scope,packageType,packageId}) {return post('/rest/v1/rpc/get_finance_export_package',actor.token,{p_legal_entity_id:scope.legalEntityId,p_package_type:packageType,p_package_id:packageId},'finance_api');}
  async function readIntegrationErrors({actor,scope,dealerAccountId,status,sourceSystem,cursor,limit}) {return post('/rest/v1/rpc/list_integration_errors',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_status:status||null,p_source_system:sourceSystem||null,p_cursor:cursor||null,p_limit:limit||50},'finance_api');}
  async function readApprovalWorkItems({actor,scope,dealerAccountId,status,subjectType,cursor,limit}) {return post('/rest/v1/rpc/list_approval_work_items',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_status:status||null,p_subject_type:subjectType||null,p_cursor:cursor||null,p_limit:limit||50},'finance_api');}
  async function readApprovalWorkItem({actor,scope,dealerAccountId,requestId}) {return post('/rest/v1/rpc/get_approval_work_item',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_request_id:requestId},'finance_api');}
  async function readAuditEvents({actor,scope,dealerAccountId,actionCode,subjectType,cursor,limit}) {return post('/rest/v1/rpc/list_audit_events',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_action_code:actionCode||null,p_subject_type:subjectType||null,p_cursor:cursor||null,p_limit:limit||50},'finance_api');}
  async function exportAuditEvents({actor,scope,dealerAccountId,from,to,actionCode,subjectType,limit}) {return post('/rest/v1/rpc/export_audit_events',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_from:from?`${from}T00:00:00Z`:null,p_to:to?`${to}T00:00:00Z`:null,p_action_code:actionCode||null,p_subject_type:subjectType||null,p_limit:limit||10000},'finance_api');}
  async function readAuditCorrelationTrace({actor,scope,dealerAccountId,correlationId}) {return post('/rest/v1/rpc/get_audit_correlation_trace',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_correlation_id:correlationId},'finance_api');}
  async function readIntegrationError({actor,scope,dealerAccountId,errorId}) {return post('/rest/v1/rpc/get_integration_error',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_error_id:errorId},'finance_api');}
  async function readDisputes({actor,scope,dealerAccountId,status,cursor,limit}) {return post('/rest/v1/rpc/list_disputes',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_status:status||null,p_cursor:cursor||null,p_limit:limit||50},'finance_api');}
  async function readDispute({actor,scope,dealerAccountId,disputeId}) {return post('/rest/v1/rpc/get_dispute',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_dispute_id:disputeId},'finance_api');}
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
  async function readStatementControl({actor,scope,dealerAccountId,from,to,currency}){return post('/rest/v1/rpc/get_dealer_statement_control',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_from:from,p_to:to,p_currency:currency},'finance_api');}
  async function exportDealerStatement({actor,scope,dealerAccountId,from,to,currency,status,limit}){return post('/rest/v1/rpc/export_dealer_statement',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_from:from,p_to:to,p_currency:currency,p_status:status||null,p_limit:limit||10000},'finance_api');}
  async function readPayment({ actor, scope, dealerAccountId, paymentId }) {
    return post('/rest/v1/rpc/get_payment', actor.token, {
      p_legal_entity_id: scope.legalEntityId,
      p_dealer_account_id: dealerAccountId,
      p_branch_id: scope.branchId,
      p_payment_id: paymentId,
    }, 'finance_api');
  }
  async function readPayments({ actor, scope, dealerAccountId, from, to, status, cursor, limit }) {
    return post('/rest/v1/rpc/list_payments', actor.token, {
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
  async function readAccrualDetail({ actor, scope, dealerAccountId, accrualId }) {
    const payload={
      p_legal_entity_id: scope.legalEntityId,
      p_dealer_account_id: dealerAccountId,
      p_branch_id: scope.branchId,
      p_accrual_id: accrualId,
    };
    const [detail,calculationTrace]=await Promise.all([
      post('/rest/v1/rpc/get_accrual_detail',actor.token,payload,'finance_api'),
      post('/rest/v1/rpc/get_accrual_calculation_trace',actor.token,payload,'finance_api')
    ]);
    return detail===null?null:{...detail,calculationTrace};
  }
  async function readRoyaltyRefunds({ actor, scope, dealerAccountId, from, to, cursor, limit }) {
    return post('/rest/v1/rpc/list_royalty_refunds', actor.token, {
      p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,
      p_from:from||null,p_to:to||null,p_cursor:cursor||null,p_limit:limit||50,
    }, 'finance_api');
  }
  async function readServiceUsages({actor,scope,dealerAccountId,from,to,family,chargeStatus,cursor,limit}) {
    return post('/rest/v1/rpc/list_service_usages',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_from:from||null,p_to:to||null,p_family:family||null,p_charge_status:chargeStatus||null,p_cursor:cursor||null,p_limit:limit||50},'finance_api');
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
  async function readPeriodReconciliations({actor,scope,dealerAccountId,periodId}){return post('/rest/v1/rpc/get_finance_period_reconciliations',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_period_id:periodId},'finance_api');}
  async function readCurrentContract({actor,scope,dealerAccountId,asOf}) {
    return post('/rest/v1/rpc/get_current_franchise_contract',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_as_of:asOf},'finance_api');
  }
  async function readContractVersions({actor,scope,dealerAccountId,contractId,cursor,limit}) {return post('/rest/v1/rpc/list_contract_versions',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_contract_id:contractId,p_cursor:cursor||null,p_limit:limit||50},'finance_api');}
  async function readContractFeeRules({actor,scope,dealerAccountId,contractVersionId,status,cursor,limit}) {
    return post('/rest/v1/rpc/list_contract_fee_rules',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_contract_version_id:contractVersionId,p_status:status||null,p_cursor:cursor||null,p_limit:limit||50},'finance_api');
  }
  async function readContractFeeRule({actor,scope,dealerAccountId,contractVersionId,feeRuleId}) {
    return post('/rest/v1/rpc/get_contract_fee_rule_projection',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_contract_version_id:contractVersionId,p_fee_rule_id:feeRuleId},'finance_api');
  }
  async function readContractVersionComparison({actor,scope,dealerAccountId,activeVersionId,candidateVersionId}) {
    return post('/rest/v1/rpc/get_contract_version_comparison',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_active_version_id:activeVersionId,p_candidate_version_id:candidateVersionId},'finance_api');
  }
  async function simulateContractVersionImpact({actor,scope,dealerAccountId,activeVersionId,candidateVersionId,scenario}) {return post('/rest/v1/rpc/simulate_contract_version_impact',actor.token,{p_legal_entity_id:scope.legalEntityId,p_dealer_account_id:dealerAccountId,p_branch_id:scope.branchId,p_active_version_id:activeVersionId,p_candidate_version_id:candidateVersionId,p_scenario:scenario},'finance_api');}
  return Object.freeze({ authenticate, authorizeScope, authorizeHeadquartersScope, readOperationalHealth,readHeadquartersSummary,readExpenses,readExpense,readExportPackages,readExportPackage,readIntegrationErrors,readIntegrationError,readApprovalWorkItems,readApprovalWorkItem,readAuditEvents,exportAuditEvents,readAuditCorrelationTrace,readDisputes,readDispute, readSummary, readStatement,readStatementControl,exportDealerStatement, readPayments, readPayment, readAccrualDetail, readRoyaltyRefunds,readServiceUsages, readRefundTrace, readCurrentPeriod,readPeriodReconciliations, readCurrentContract,readContractVersions, readContractFeeRules,readContractFeeRule,readContractVersionComparison,simulateContractVersionImpact });
}
