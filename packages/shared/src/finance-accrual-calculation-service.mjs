import { createHash } from 'node:crypto';
function failure(code,message){const error=new Error(message);error.code=code;return error;}
function required(value,field){if(typeof value!=='string'||!value.trim())throw failure('INVALID_CALCULATION_COMMAND',`${field} zorunludur.`);return value.trim();}
function canonical(value){if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;if(value&&typeof value==='object')return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;return JSON.stringify(value);}
function hash(value){return createHash('sha256').update(canonical(value),'utf8').digest('hex');}
function assertContext(context,command){
  if(!context||typeof context!=='object')throw failure('CALCULATION_CONTEXT_NOT_FOUND','Hesaplama bağlamı bulunamadı.');
  const scope=context.scope||{};
  for(const field of ['legalEntityId','dealerLegalEntityId','dealerAccountId','branchId'])if(required(scope[field],`context.scope.${field}`)!==command[field])throw failure('SCOPE_MISMATCH',`Hesaplama ${field} kapsamı eşleşmiyor.`);
  if(!context.sourceEvent||!['RECEIVED','PROCESSING'].includes(context.sourceEvent.status))throw failure('SOURCE_EVENT_NOT_CALCULABLE','Kaynak olay hesaplanabilir durumda değil.');
  if(context.sourceEvent.branchId!==command.branchId)throw failure('SCOPE_MISMATCH','Kaynak olay başka şubeye ait.');
  if(context.financePeriod?.status!=='OPEN')throw failure('FINANCE_PERIOD_CLOSED','Açık finans dönemi zorunludur.');
  if(!context.taxVersion?.id||typeof context.taxVersion.rate!=='string'||!['APPROVED','ACTIVE'].includes(context.taxVersion.status))throw failure('TAX_VERSION_NOT_APPROVED','Onaylı veya aktif vergi sürümü zorunludur.');
  if(!Array.isArray(context.rules))throw failure('CALCULATION_CONTEXT_INVALID','Kural listesi zorunludur.');
  if(!context.calculationInput||typeof context.calculationInput!=='object')throw failure('CALCULATION_CONTEXT_INVALID','Sunucu hesaplama girdisi zorunludur.');
}

export function createAccrualCalculationService({repository,ruleEngine}={}){
  if(!repository||typeof repository.loadCalculationContext!=='function'||typeof repository.findCalculationIntent!=='function'||typeof repository.commitCalculation!=='function')throw failure('CONFIGURATION_ERROR','Hesaplama context, intent ve commit repository portları zorunludur.');
  if(!ruleEngine||typeof ruleEngine.selectEffectiveRule!=='function'||typeof ruleEngine.evaluateFeeRule!=='function'||typeof ruleEngine.resolveDueDate!=='function')throw failure('CONFIGURATION_ERROR','Kural seçme, hesaplama ve vade portları zorunludur.');
  return Object.freeze({async calculate(input){
    const command={
      legalEntityId:required(input?.legalEntityId,'legalEntityId'),dealerLegalEntityId:required(input?.dealerLegalEntityId,'dealerLegalEntityId'),dealerAccountId:required(input?.dealerAccountId,'dealerAccountId'),branchId:required(input?.branchId,'branchId'),
      sourceEventId:required(input?.sourceEventId,'sourceEventId'),feeDefinitionId:required(input?.feeDefinitionId,'feeDefinitionId'),calculationId:required(input?.calculationId,'calculationId'),idempotencyKey:required(input?.idempotencyKey,'idempotencyKey'),correlationId:required(input?.correlationId,'correlationId'),runType:required(input?.runType,'runType'),
    };
    if(!['LIVE','SHADOW'].includes(command.runType))throw failure('INVALID_RUN_TYPE','Yalnız LIVE veya SHADOW hesaplama desteklenir.');
    const context=await repository.loadCalculationContext(command);assertContext(context,command);
    const source=context.sourceEvent;
    const rule=ruleEngine.selectEffectiveRule(context.rules,{occurredOn:source.businessDate,eventType:source.eventType,feeDefinitionId:command.feeDefinitionId,headquartersLegalEntityId:command.legalEntityId,dealerLegalEntityId:command.dealerLegalEntityId,branchId:command.branchId,packageId:context.calculationInput.packageId,serviceId:context.calculationInput.serviceId,triggerVariables:context.calculationInput.triggerVariables||{}});
    const inputHash=hash({sourceEventId:source.id,sourcePayloadHash:source.payloadHash,feeRuleId:rule.feeRuleId,feeRuleVersion:rule.version,taxVersionId:context.taxVersion.id,scope:context.scope,calculationInput:context.calculationInput,runType:command.runType});
    const intent={sourceEventId:source.id,contractFeeRuleId:rule.feeRuleId,feeDefinitionId:rule.feeDefinitionId,runType:command.runType};
    const existing=await repository.findCalculationIntent(intent);
    if(existing){if(existing.inputHash!==inputHash)throw failure('CALCULATION_IDEMPOTENCY_CONFLICT','Aynı hesaplama niyeti farklı girdilerle kullanılamaz.');return Object.freeze({outcome:'REPLAY',calculationRunId:existing.calculationRunId,inputHash,resultHash:existing.resultHash,status:existing.status});}
    const engineInput={...context.calculationInput,calculationId:command.calculationId,occurredOn:source.businessDate,businessDate:source.businessDate,taxRate:context.taxVersion.rate,taxRateVersionId:context.taxVersion.id,taxRateSource:'APPROVED_TAX_VERSION',currency:context.calculationInput.currency,mode:command.runType==='SHADOW'?'PREVIEW':'LIVE',source:{sourceEventId:source.id,payloadHash:source.payloadHash},trace:{idempotencyKey:command.idempotencyKey,correlationId:command.correlationId}};
    const calculation=ruleEngine.evaluateFeeRule(rule,engineInput);const dueDate=ruleEngine.resolveDueDate(rule,{businessDate:source.businessDate,invoiceDate:context.calculationInput.invoiceDate});
    if(command.runType==='LIVE'&&calculation.status!=='CALCULATED')throw failure('NON_LIVE_RESULT','Canlı tahakkuk için CALCULATED sonuç zorunludur.');
    const resultHash=hash({calculation,dueDate});
    const committed=await repository.commitCalculation({command,context,rule,calculation,dueDate,inputHash,resultHash,intent});
    if(!committed||!['CREATED','REPLAY'].includes(committed.outcome))throw failure('INVALID_PERSISTENCE_RESULT','Hesaplama transaction sonucu tanınmıyor.');
    if(committed.inputHash!==inputHash||committed.resultHash!==resultHash)throw failure('CALCULATION_IDEMPOTENCY_CONFLICT','Kalıcılık sonucu hesaplama özetiyle eşleşmiyor.');
    return Object.freeze({...committed,inputHash,resultHash});
  }});
}

export const ACCRUAL_CALCULATION_CONTRACT=Object.freeze({scopeLevel:'BRANCH',erpMaySupplyCalculatedAmount:false,serverOwnedInputs:Object.freeze(['effectiveRule','taxVersion','financePeriod','calculationInput']),runTypes:Object.freeze(['LIVE','SHADOW']),liveAtomicWrites:Object.freeze(['source_events','calculation_runs','calculation_snapshots','journal_entries','journal_lines','accruals','open_items','audit_events','outbox_messages'])});

