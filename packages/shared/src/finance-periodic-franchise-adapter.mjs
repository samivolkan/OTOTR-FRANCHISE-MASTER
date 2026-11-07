const DATE=/^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP=/^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED=new Set(['eventType','branchId','contractVersionId','feeRuleId','periodStart','periodEnd','occurredAtUtc']);
const istanbulDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul'});
const validDate=value=>{if(typeof value!=='string'||!DATE.test(value))return false;const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;};
const hex=bytes=>[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');
async function deterministicUuid(seed){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(seed))).slice(0,16);bytes[6]=(bytes[6]&0x0f)|0x50;bytes[8]=(bytes[8]&0x3f)|0x80;const value=hex(bytes);return`${value.slice(0,8)}-${value.slice(8,12)}-${value.slice(12,16)}-${value.slice(16,20)}-${value.slice(20)}`;}

// Trusted ERP/scheduler port. Commercial values are always resolved from the active contract rule.
export function createFinancePeriodicFranchiseAdapter({cutoverDate,ingest}){
  if(typeof ingest!=='function')throw new TypeError('Periodic franchise ingestion is required');
  return async function deliver(event,scope){
    if(!validDate(cutoverDate))return{outcome:'CUTOVER_NOT_CONFIGURED'};
    if(!event||typeof event!=='object'||Array.isArray(event)||Object.keys(event).some(key=>!ALLOWED.has(key))||event.eventType!=='franchise-period.due'||!UUID.test(event.branchId||'')||event.branchId!==scope?.branchId||!UUID.test(event.contractVersionId||'')||!UUID.test(event.feeRuleId||'')||!validDate(event.periodStart)||!validDate(event.periodEnd)||event.periodStart>event.periodEnd||typeof event.occurredAtUtc!=='string'||!TIMESTAMP.test(event.occurredAtUtc)||!Number.isFinite(Date.parse(event.occurredAtUtc))){return{outcome:'INVALID_PERIODIC_FRANCHISE_EVENT'};}
    const businessDate=istanbulDate.format(new Date(event.occurredAtUtc));
    if(businessDate<cutoverDate)return{outcome:'BEFORE_CUTOVER'};
    const normalized={branchId:event.branchId.toLowerCase(),contractVersionId:event.contractVersionId.toLowerCase(),feeRuleId:event.feeRuleId.toLowerCase(),periodStart:event.periodStart,periodEnd:event.periodEnd};
    const eventId=await deterministicUuid(`periodic-franchise|${normalized.contractVersionId}|${normalized.feeRuleId}|${normalized.branchId}|${normalized.periodStart}|${normalized.periodEnd}`);
    return ingest(scope,{eventId,eventType:'franchise-period.due',occurredAtUtc:new Date(event.occurredAtUtc).toISOString(),businessDate,payload:{contractVersionId:normalized.contractVersionId,feeRuleId:normalized.feeRuleId,periodStart:normalized.periodStart,periodEnd:normalized.periodEnd}});
  };
}
