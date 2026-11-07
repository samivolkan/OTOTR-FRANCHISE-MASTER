const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const APPROVED=Object.freeze({
  TRAMER_QUERY:Object.freeze({family:'QUERY',serviceCode:'TRAMER_QUERY',label:'TRAMER sorgusu'}),
  KM_QUERY:Object.freeze({family:'QUERY',serviceCode:'KM_QUERY',label:'KM sorgusu'}),
  TRAMER_360_QUERY:Object.freeze({family:'QUERY',serviceCode:'TRAMER_360_QUERY',label:'TRAMER 360 sorgusu'}),
  PASS_THROUGH_EXPENSE:Object.freeze({family:'PASS_THROUGH_EXPENSE',label:'GM masraf yansıtma'}),
});
const form=document.querySelector('[data-finance-contract-rule-edit]');
const state=document.querySelector('[data-finance-contract-rule-edit-state]');
const submit=document.querySelector('[data-finance-contract-rule-edit-submit]');
let loadedRule=null;
let mode='MANUAL';

const field=name=>form?.elements.namedItem(name);
const context=()=>{const value=globalThis.OTOTR_FINANCE_CONTEXT;if(!value||![value.legalEntityId,value.dealerAccountId,value.branchId].every(id=>UUID.test(id||'')))throw new Error('FINANCE_SCOPE_UNAVAILABLE');return value;};
const config=()=>{const value=globalThis.OTOTR_SUPABASE_CONFIG,url=new URL(value?.url);if(url.protocol!=='https:'&&!(['localhost','127.0.0.1'].includes(url.hostname)&&url.protocol==='http:'))throw new Error('FINANCE_CONFIG_UNAVAILABLE');if(typeof value.publishableKey!=='string'||!value.publishableKey.startsWith('sb_publishable_'))throw new Error('FINANCE_CONFIG_UNAVAILABLE');return {url:url.origin,publishableKey:value.publishableKey};};
const parseObject=(name,label)=>{let value;try{value=JSON.parse(field(name).value);}catch{throw new Error(`${label} geçerli JSON olmalıdır.`);}if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(`${label} JSON nesnesi olmalıdır.`);return value;};

if(form){
  const label=document.createElement('label');
  label.textContent='Ticari hesaplama kaynağı';
  const select=document.createElement('select');
  select.name='commercialRuleSource';
  select.dataset.financeCommercialRuleSource='';
  select.append(new Option('Manuel kural','MANUAL'));
  for(const [value,item] of Object.entries(APPROVED))select.append(new Option(`${item.label} · sunucu ayarı`,value));
  label.append(select);
  form.querySelector('.finance-rule-edit-grid')?.prepend(label);
  const sync=()=>{mode=select.value;const server=mode!=='MANUAL';for(const name of ['calculationMethod','calculationParameters','currency','decimalScale','roundingMode'])field(name).disabled=server;if(server){field('code').value=mode;state.textContent='Tutar ve oran tarayıcıdan gönderilmez; seçilen hizmet kodu sunucudaki güvenli ticari ayardan hesaplanır.';}else if(loadedRule)state.textContent=`Taslak v${loadedRule.version} düzenleniyor. Kaydetme sonrası v${Number(loadedRule.version)+1} oluşur.`;};
  select.addEventListener('change',sync);
  globalThis.addEventListener('ototr:finance-contract-rule-loaded',event=>{loadedRule=event.detail&&event.detail.status==='DRAFT'?structuredClone(event.detail):null;select.value=loadedRule&&APPROVED[loadedRule.code]?loadedRule.code:'MANUAL';sync();});
  form.addEventListener('submit',async event=>{
    if(mode==='MANUAL')return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!loadedRule||!UUID.test(loadedRule.feeRuleId||'')||!UUID.test(loadedRule.contractVersionId||''))return;
    const selected=APPROVED[mode];
    let rule;
    try{
      const conditions=JSON.parse(field('triggerConditions').value);if(!Array.isArray(conditions))throw new Error('Tetikleyici koşulları JSON dizisi olmalıdır.');
      const calculation=selected.family==='QUERY'?{source:'SERVER_COMMERCIAL_CONFIG',family:selected.family,serviceCode:selected.serviceCode}:{source:'SERVER_COMMERCIAL_CONFIG',family:selected.family};
      rule={basis:parseObject('basis','Matrah tanımı'),calculation,cancellationPolicy:parseObject('cancellationPolicy','İptal / iade politikası'),code:mode,configurationStatus:'CONFIGURED',evidenceDocumentId:loadedRule.evidenceDocumentId??null,exceptions:[],feeDefinitionId:loadedRule.feeDefinitionId,tax:{taxCodeVersionId:field('taxCodeVersionId').value.trim(),priceIncludesTax:field('priceIncludesTax').checked},trigger:{eventType:field('triggerEventType').value.trim(),conditions},due:parseObject('due','Vade kuralı')};
    }catch(error){state.textContent=error.message;return;}
    if(!globalThis.confirm(`${selected.label} kuralı güvenli sunucu ayarıyla yeni taslak sürüme kaydedilsin mi?`))return;
    submit.disabled=true;state.textContent='Yetki, kapsam, sürüm ve sunucu ticari ayarı doğrulanıyor…';
    try{
      const scope=context(),settings=config(),token=await globalThis.OTOTR_FINANCE_AUTH?.getAccessToken?.();if(typeof token!=='string'||token.length<20)throw new Error('AUTH_REQUIRED');
      const response=await fetch(`${settings.url}/functions/v1/finance-command`,{method:'POST',headers:{apikey:settings.publishableKey,Authorization:`Bearer ${token}`,'Content-Type':'application/json; charset=utf-8','Correlation-Id':crypto.randomUUID(),'X-Client-Info':'ototr-finance-web/0.1'},body:JSON.stringify({operationId:'materializeCommercialFeeRule',scope,command:{contractVersionId:loadedRule.contractVersionId,feeRuleId:loadedRule.feeRuleId,expectedVersion:loadedRule.version,rule,idempotencyKey:`fee-rule:commercial:${loadedRule.feeRuleId}:${loadedRule.version}:${crypto.randomUUID()}`}})});
      const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.error?.message||'Ticari kural sunucu ayarından üretilemedi.');
      form.dataset.outcome=payload.data.outcome;state.textContent='Taslak kural güvenli sunucu ayarından üretildi; yayınlama için maker-checker onayı gerekir.';
      const ids={contractVersionId:loadedRule.contractVersionId,feeRuleId:loadedRule.feeRuleId};globalThis.dispatchEvent(new CustomEvent('ototr:finance-contract-rule-updated',{detail:payload.data}));globalThis.dispatchEvent(new CustomEvent('ototr:finance-contract-rule-requested',{detail:ids}));
    }catch(error){form.dataset.outcome='ERROR';state.textContent=error.message==='AUTH_REQUIRED'?'Geçerli kullanıcı oturumu bulunamadı.':(error.message||'Ticari kural kaydedilemedi.');}
    finally{submit.disabled=false;}
  },true);
}
