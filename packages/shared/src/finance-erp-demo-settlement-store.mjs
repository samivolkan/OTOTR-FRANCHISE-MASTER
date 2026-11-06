/** Use the ERP transaction number constraint to make demo writes replay-safe. */
export function createErpDemoSettlementStore({request}) {
  function transactionNumber(scenario, operation) {
    return `FIN-DEMO-${scenario.erpBranchId}-${scenario.correlationId}-${operation}`;
  }

  async function loadOperation(scenario, operation) {
    const query = new URLSearchParams({
      transaction_no: `eq.${transactionNumber(scenario, operation)}`,
      branch_id: `eq.${scenario.erpBranchId}`,
      select: 'id,branch_id,transaction_type,direction,currency,status,paid_at,metadata'
    });
    const rows = await request(`finance_transactions?${query}`);
    return rows[0] ?? null;
  }

  async function saveOperation(scenario, operation, row) {
    await request('finance_transactions?on_conflict=transaction_no', {
      method: 'POST',
      headers: {Prefer: 'resolution=ignore-duplicates,return=minimal'},
      body: JSON.stringify({...row, transaction_no: transactionNumber(scenario, operation)})
    });
    return loadOperation(scenario, operation);
  }

  return {loadOperation, saveOperation};
}
