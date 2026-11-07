export function createFinanceRefundWorkerAdapter({supabaseUrl,serviceRoleKey,fetchImpl=fetch}={}){
  let base;try{base=new URL(supabaseUrl);}catch{throw new Error('SUPABASE_URL geçersiz.');}
  if(base.protocol!=='https:'&&!(['localhost','127.0.0.1'].includes(base.hostname)&&base.protocol==='http:'))throw new Error('SUPABASE_URL HTTPS olmalıdır.');
  if(typeof serviceRoleKey!=='string'||serviceRoleKey.length<40)throw new Error('SUPABASE_SERVICE_ROLE_KEY zorunludur.');
  return Object.freeze({async processRefund(input){
    const response=await fetchImpl(`${base.origin}/rest/v1/rpc/process_royalty_refund_reversal_v2`,{method:'POST',headers:{apikey:serviceRoleKey,Authorization:`Bearer ${serviceRoleKey}`,'Content-Type':'application/json','Accept-Profile':'finance_api','Content-Profile':'finance_api'},body:JSON.stringify({p_actor_id:input.actorId,p_legal_entity_id:input.legalEntityId,p_dealer_legal_entity_id:input.dealerLegalEntityId,p_dealer_account_id:input.dealerAccountId,p_branch_id:input.branchId,p_source_event_id:input.sourceEventId,p_refund_id:input.refundId,p_idempotency_key:input.idempotencyKey,p_correlation_id:input.correlationId})});
    const payload=(response.headers.get('content-type')||'').includes('application/json')?await response.json().catch(()=>null):null;
    if(!response.ok)throw new Error('refund processor database operation failed');
    return payload;
  }});
}
