const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KEYS = new Set(['operationId', 'scope', 'pathParams', 'query']);

export class FinanceReadError extends Error {
  constructor(status, code, message) { super(message); this.name = 'FinanceReadError'; this.status = status; this.code = code; }
}

function uuid(value, field) {
  if (typeof value !== 'string' || !UUID.test(value)) throw new FinanceReadError(400, 'INVALID_SCOPE', `${field} geçerli UUID olmalıdır.`);
  return value.toLowerCase();
}

function correlation(value, factory) {
  if (typeof value === 'string' && UUID.test(value)) return value.toLowerCase();
  const generated = factory();
  if (!UUID.test(generated)) throw new FinanceReadError(503, 'CORRELATION_UNAVAILABLE', 'İstek izleme kimliği üretilemedi.');
  return generated.toLowerCase();
}

function headers(origin, correlationId) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, correlation-id, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '600',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Correlation-Id': correlationId,
    'Vary': 'Origin',
  };
}

function json(origin, correlationId, status, body) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin, correlationId) });
}

function calendarDate(value, field = 'asOf') {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new FinanceReadError(400, 'INVALID_QUERY', `${field} geçerli YYYY-MM-DD tarihi olmalıdır.`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new FinanceReadError(400, 'INVALID_QUERY', `${field} geçerli YYYY-MM-DD tarihi olmalıdır.`);
  return value;
}

async function body(request, maxBytes) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) throw new FinanceReadError(415, 'CONTENT_TYPE_REQUIRED', 'application/json zorunludur.');
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maxBytes) throw new FinanceReadError(413, 'PAYLOAD_TOO_LARGE', 'İstek gövdesi sınırı aşıldı.');
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new FinanceReadError(413, 'PAYLOAD_TOO_LARGE', 'İstek gövdesi sınırı aşıldı.');
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new FinanceReadError(400, 'INVALID_JSON', 'Geçerli JSON zorunludur.'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new FinanceReadError(400, 'INVALID_REQUEST', 'İstek nesne olmalıdır.');
  if (Object.keys(parsed).some(key => !KEYS.has(key))) throw new FinanceReadError(400, 'UNKNOWN_FIELD', 'İstek bilinmeyen alan içeriyor.');
  if (!['getFinanceOperationalHealth','getHeadquartersFinanceSummary','listPassThroughExpenses','getPassThroughExpense','listFinanceExportPackages','getFinanceExportPackage','listIntegrationErrors','getIntegrationError','listApprovalWorkItems','getApprovalWorkItem','listAuditEvents','getAuditCorrelationTrace','listDisputes','getDispute','getDealerFinanceSummary','getDealerStatement','listPayments','getPayment','getAccrualDetail','listRoyaltyRefunds','listServiceUsages','getRoyaltyRefundTrace','getFinancePeriod','getCurrentFranchiseContract','listContractFeeRules','getContractFeeRule','getContractVersionComparison','simulateContractVersionImpact'].includes(parsed.operationId)) throw new FinanceReadError(403, 'OPERATION_DENIED', 'Finans okuma operasyonuna izin verilmiyor.');
  const scope = Object.freeze({
    legalEntityId: uuid(parsed.scope?.legalEntityId, 'legalEntityId'),
    dealerAccountId: uuid(parsed.scope?.dealerAccountId, 'dealerAccountId'),
    branchId: uuid(parsed.scope?.branchId, 'branchId'),
  });
  const pathKeys = parsed.pathParams && typeof parsed.pathParams === 'object' && !Array.isArray(parsed.pathParams) ? Object.keys(parsed.pathParams) : [];
  const expectedPathKeys = ['getFinanceOperationalHealth','getHeadquartersFinanceSummary','listPassThroughExpenses','listFinanceExportPackages'].includes(parsed.operationId) ? [] : parsed.operationId==='getPassThroughExpense' ? ['expenseId'] : parsed.operationId==='getFinanceExportPackage' ? ['packageId'] : parsed.operationId === 'getPayment'
    ? ['dealerAccountId','paymentId']
    : parsed.operationId === 'getApprovalWorkItem'
      ? ['dealerAccountId','requestId']
    : parsed.operationId === 'getAuditCorrelationTrace'
      ? ['dealerAccountId','correlationId']
    : parsed.operationId === 'getIntegrationError'
      ? ['dealerAccountId','errorId']
    : parsed.operationId === 'getDispute'
      ? ['dealerAccountId','disputeId']
    : parsed.operationId === 'getAccrualDetail'
      ? ['dealerAccountId','accrualId']
      : parsed.operationId === 'getRoyaltyRefundTrace'
        ? ['dealerAccountId','reversalAccrualId']
      : parsed.operationId === 'getContractFeeRule'
        ? ['dealerAccountId','contractVersionId','feeRuleId']
      : ['getContractVersionComparison','simulateContractVersionImpact'].includes(parsed.operationId)
        ? ['dealerAccountId','activeVersionId','candidateVersionId']
      : parsed.operationId === 'listContractFeeRules'
        ? ['dealerAccountId','contractVersionId']
      : ['dealerAccountId'];
  if (pathKeys.length !== expectedPathKeys.length || expectedPathKeys.some(key => !pathKeys.includes(key))) throw new FinanceReadError(400, 'INVALID_PATH_PARAMS', `${expectedPathKeys.join(', ')} path parametreleri zorunludur.`);
  const dealerAccountId = ['getFinanceOperationalHealth','getHeadquartersFinanceSummary','listPassThroughExpenses','getPassThroughExpense','listFinanceExportPackages','getFinanceExportPackage'].includes(parsed.operationId) ? undefined : uuid(parsed.pathParams.dealerAccountId, 'dealerAccountId');
  if (dealerAccountId && dealerAccountId !== scope.dealerAccountId) throw new FinanceReadError(403, 'SCOPE_DENIED', 'Bayi hesabı finans kapsamıyla uyuşmuyor.');
  const query = parsed.query && typeof parsed.query === 'object' && !Array.isArray(parsed.query) ? parsed.query : {};
  if(parsed.operationId==='getFinanceOperationalHealth'){
    if(Object.keys(query).length) throw new FinanceReadError(400,'INVALID_QUERY','Operasyon sağlığı query parametresi kabul etmez.');
    return Object.freeze({operationId:parsed.operationId,scope});
  }
  if(parsed.operationId==='getHeadquartersFinanceSummary'){
    if(Object.keys(query).some(key=>!['asOf','currency'].includes(key))) throw new FinanceReadError(400,'INVALID_QUERY','Genel merkez özeti yalnız asOf ve currency kabul eder.');
    const asOf=calendarDate(query.asOf);if(!asOf) throw new FinanceReadError(400,'INVALID_QUERY','Genel merkez özeti için asOf zorunludur.');
    if(typeof query.currency!=='string'||!/^[A-Z]{3}$/.test(query.currency)) throw new FinanceReadError(400,'INVALID_QUERY','Genel merkez özeti için para birimi zorunludur.');
    return Object.freeze({operationId:parsed.operationId,scope,asOf,currency:query.currency});
  }
  if(parsed.operationId==='listPassThroughExpenses'){
    const allowed=new Set(['from','to','status','cursor','limit']);if(Object.keys(query).some(key=>!allowed.has(key))) throw new FinanceReadError(400,'INVALID_QUERY','Masraf listesi için geçersiz query parametresi.');const from=calendarDate(query.from,'from'),to=calendarDate(query.to,'to');if(from&&to&&from>to) throw new FinanceReadError(400,'INVALID_QUERY','Masraf tarih aralığı geçersiz.');if(query.status!==undefined&&!['DRAFT','CALCULATED','PENDING_APPROVAL','APPROVED','POSTED','REVERSED'].includes(query.status)) throw new FinanceReadError(400,'INVALID_QUERY','Masraf durumu geçersiz.');if(query.cursor!==undefined&&(typeof query.cursor!=='string'||!query.cursor.length||query.cursor.length>512)) throw new FinanceReadError(400,'INVALID_QUERY','Masraf cursor değeri geçersiz.');if(query.limit!==undefined&&(!Number.isInteger(query.limit)||query.limit<1||query.limit>200)) throw new FinanceReadError(400,'INVALID_QUERY','Masraf limit değeri geçersiz.');return Object.freeze({operationId:parsed.operationId,scope,from,to,status:query.status,cursor:query.cursor,limit:query.limit});
  }
  if(parsed.operationId==='getPassThroughExpense'){
    if(Object.keys(query).length) throw new FinanceReadError(400,'INVALID_QUERY','Masraf detayı query parametresi kabul etmez.');return Object.freeze({operationId:parsed.operationId,scope,expenseId:uuid(parsed.pathParams.expenseId,'expenseId')});
  }
  if(parsed.operationId==='listFinanceExportPackages'){
    const allowed=new Set(['packageType','status','cursor','limit']);if(Object.keys(query).some(key=>!allowed.has(key)))throw new FinanceReadError(400,'INVALID_QUERY','Export paketi listesi için geçersiz query parametresi.');if(query.packageType!==undefined&&!['BILLING','ACCOUNTING'].includes(query.packageType))throw new FinanceReadError(400,'INVALID_QUERY','Export paketi türü geçersiz.');if(query.status!==undefined&&!['DRAFT','READY','EXPORT_QUEUED','EXPORTED','INVOICED','PARTIALLY_ACCEPTED','ACCEPTED','REJECTED'].includes(query.status))throw new FinanceReadError(400,'INVALID_QUERY','Export paketi durumu geçersiz.');if(query.cursor!==undefined&&(typeof query.cursor!=='string'||!query.cursor.length||query.cursor.length>512))throw new FinanceReadError(400,'INVALID_QUERY','Export paketi cursor değeri geçersiz.');if(query.limit!==undefined&&(!Number.isInteger(query.limit)||query.limit<1||query.limit>200))throw new FinanceReadError(400,'INVALID_QUERY','Export paketi limit değeri geçersiz.');return Object.freeze({operationId:parsed.operationId,scope,packageType:query.packageType,status:query.status,cursor:query.cursor,limit:query.limit});
  }
  if(parsed.operationId==='getFinanceExportPackage'){
    if(Object.keys(query).length!==1||!['BILLING','ACCOUNTING'].includes(query.packageType))throw new FinanceReadError(400,'INVALID_QUERY','Export paketi detayı için packageType zorunludur.');return Object.freeze({operationId:parsed.operationId,scope,packageId:uuid(parsed.pathParams.packageId,'packageId'),packageType:query.packageType});
  }
  if(parsed.operationId==='getIntegrationError'){
    if(Object.keys(query).length) throw new FinanceReadError(400,'INVALID_QUERY','Entegrasyon hata detayı query parametresi kabul etmez.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,errorId:uuid(parsed.pathParams.errorId,'errorId')});
  }
  if(parsed.operationId==='getApprovalWorkItem'){
    if(Object.keys(query).length) throw new FinanceReadError(400,'INVALID_QUERY','Onay detayı query parametresi kabul etmez.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,requestId:uuid(parsed.pathParams.requestId,'requestId')});
  }
  if(parsed.operationId==='getAuditCorrelationTrace'){
    if(Object.keys(query).length) throw new FinanceReadError(400,'INVALID_QUERY','Audit correlation izi query parametresi kabul etmez.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,correlationId:uuid(parsed.pathParams.correlationId,'correlationId')});
  }
  if(parsed.operationId==='listApprovalWorkItems'||parsed.operationId==='listAuditEvents'){
    const allowed=new Set(parsed.operationId==='listApprovalWorkItems'?['status','subjectType','cursor','limit']:['actionCode','subjectType','cursor','limit']);
    if(Object.keys(query).some(key=>!allowed.has(key))) throw new FinanceReadError(400,'INVALID_QUERY','Yönetişim listesi için geçersiz query parametresi.');
    if(query.status!==undefined&&!['PENDING','APPROVED','REJECTED','CANCELLED'].includes(query.status)) throw new FinanceReadError(400,'INVALID_QUERY','Onay durumu geçersiz.');
    for(const key of ['subjectType','actionCode'])if(query[key]!==undefined&&(typeof query[key]!=='string'||!/^[A-Z][A-Z0-9_]{1,63}$/.test(query[key])))throw new FinanceReadError(400,'INVALID_QUERY',`${key} geçersiz.`);
    if(query.cursor!==undefined&&(typeof query.cursor!=='string'||!query.cursor.length||query.cursor.length>512))throw new FinanceReadError(400,'INVALID_QUERY','Cursor geçersiz.');
    if(query.limit!==undefined&&(!Number.isInteger(query.limit)||query.limit<1||query.limit>200))throw new FinanceReadError(400,'INVALID_QUERY','Limit geçersiz.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,status:query.status,subjectType:query.subjectType,actionCode:query.actionCode,cursor:query.cursor,limit:query.limit});
  }
  if(parsed.operationId==='listIntegrationErrors'){
    const allowed=new Set(['status','sourceSystem','cursor','limit']);
    if(Object.keys(query).some(key=>!allowed.has(key))) throw new FinanceReadError(400,'INVALID_QUERY','Entegrasyon hata listesi için geçersiz query parametresi.');
    if(query.status!==undefined&&!['RETRYABLE','ACTION_REQUIRED','RESOLVED','IGNORED'].includes(query.status)) throw new FinanceReadError(400,'INVALID_QUERY','Entegrasyon hata durumu geçersiz.');
    if(query.sourceSystem!==undefined&&(typeof query.sourceSystem!=='string'||!/^[A-Z][A-Z0-9_-]{1,63}$/.test(query.sourceSystem))) throw new FinanceReadError(400,'INVALID_QUERY','Kaynak sistem filtresi geçersiz.');
    if(query.cursor!==undefined&&(typeof query.cursor!=='string'||!query.cursor.length||query.cursor.length>512)) throw new FinanceReadError(400,'INVALID_QUERY','Entegrasyon hata cursor değeri geçersiz.');
    if(query.limit!==undefined&&(!Number.isInteger(query.limit)||query.limit<1||query.limit>200)) throw new FinanceReadError(400,'INVALID_QUERY','Entegrasyon hata limit değeri geçersiz.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,status:query.status,sourceSystem:query.sourceSystem,cursor:query.cursor,limit:query.limit});
  }
  if(parsed.operationId==='getDispute'){
    if(Object.keys(query).length) throw new FinanceReadError(400,'INVALID_QUERY','İtiraz detayı query parametresi kabul etmez.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,disputeId:uuid(parsed.pathParams.disputeId,'disputeId')});
  }
  if(parsed.operationId==='listDisputes'){
    const allowed=new Set(['status','cursor','limit']);
    if(Object.keys(query).some(key=>!allowed.has(key))) throw new FinanceReadError(400,'INVALID_QUERY','İtiraz listesi için geçersiz query parametresi.');
    if(query.status!==undefined&&!['DRAFT','SUBMITTED','UNDER_REVIEW','ACCEPTED','PARTIALLY_ACCEPTED','REJECTED','CLOSED'].includes(query.status)) throw new FinanceReadError(400,'INVALID_QUERY','İtiraz durumu geçersiz.');
    if(query.cursor!==undefined&&(typeof query.cursor!=='string'||!query.cursor.length||query.cursor.length>512)) throw new FinanceReadError(400,'INVALID_QUERY','İtiraz cursor değeri geçersiz.');
    if(query.limit!==undefined&&(!Number.isInteger(query.limit)||query.limit<1||query.limit>200)) throw new FinanceReadError(400,'INVALID_QUERY','İtiraz limit değeri geçersiz.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,status:query.status,cursor:query.cursor,limit:query.limit});
  }
  if (parsed.operationId === 'getFinancePeriod') {
    if (Object.keys(query).some(key=>key!=='asOf')) throw new FinanceReadError(400,'INVALID_QUERY','getFinancePeriod yalnız asOf kabul eder.');
    const asOf=calendarDate(query.asOf);
    if (!asOf) throw new FinanceReadError(400,'INVALID_QUERY','getFinancePeriod için asOf zorunludur.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,asOf});
  }
  if (parsed.operationId === 'getCurrentFranchiseContract') {
    if (Object.keys(query).some(key=>key!=='asOf')) throw new FinanceReadError(400,'INVALID_QUERY','getCurrentFranchiseContract yalnız asOf kabul eder.');
    const asOf=calendarDate(query.asOf);
    if (!asOf) throw new FinanceReadError(400,'INVALID_QUERY','getCurrentFranchiseContract için asOf zorunludur.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,asOf});
  }
  if (parsed.operationId === 'listContractFeeRules') {
    const allowed=new Set(['status','cursor','limit']);
    if(Object.keys(query).some(key=>!allowed.has(key))) throw new FinanceReadError(400,'INVALID_QUERY','Kural listesi için geçersiz query parametresi.');
    if(query.status!==undefined&&!['DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','DISABLED'].includes(query.status)) throw new FinanceReadError(400,'INVALID_QUERY','Kural durum filtresi geçersiz.');
    const cursor=query.cursor===undefined?undefined:uuid(query.cursor,'cursor');
    if(query.limit!==undefined&&(!Number.isInteger(query.limit)||query.limit<1||query.limit>200)) throw new FinanceReadError(400,'INVALID_QUERY','Kural limit değeri geçersiz.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,contractVersionId:uuid(parsed.pathParams.contractVersionId,'contractVersionId'),status:query.status,cursor,limit:query.limit});
  }
  if(parsed.operationId==='getContractFeeRule'){
    if(Object.keys(query).length)throw new FinanceReadError(400,'INVALID_QUERY','Kural detayı query parametresi kabul etmez.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,contractVersionId:uuid(parsed.pathParams.contractVersionId,'contractVersionId'),feeRuleId:uuid(parsed.pathParams.feeRuleId,'feeRuleId')});
  }
  if(parsed.operationId==='getContractVersionComparison'){
    if(Object.keys(query).length)throw new FinanceReadError(400,'INVALID_QUERY','Sürüm karşılaştırması query parametresi kabul etmez.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,activeVersionId:uuid(parsed.pathParams.activeVersionId,'activeVersionId'),candidateVersionId:uuid(parsed.pathParams.candidateVersionId,'candidateVersionId')});
  }
  if(parsed.operationId==='simulateContractVersionImpact'){
    if(Object.keys(query).length!==1||!query.scenario||typeof query.scenario!=='object'||Array.isArray(query.scenario)||Object.keys(query.scenario).some(key=>key!=='items')||!Array.isArray(query.scenario.items)||query.scenario.items.length<1||query.scenario.items.length>100)throw new FinanceReadError(400,'INVALID_QUERY','Etki simülasyonu için 1–100 senaryo kalemi zorunludur.');
    const decimal=/^(0|[1-9]\d*)(?:\.\d{1,8})?$/;const items=query.scenario.items.map((item,index)=>{if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).length!==3||Object.keys(item).some(key=>!['feeDefinitionId','basisAmount','quantity'].includes(key))||typeof item.basisAmount!=='string'||!decimal.test(item.basisAmount)||typeof item.quantity!=='string'||!decimal.test(item.quantity))throw new FinanceReadError(400,'INVALID_QUERY',`Etki senaryosu ${index+1}. kalemi geçersiz.`);return Object.freeze({feeDefinitionId:uuid(item.feeDefinitionId,'feeDefinitionId'),basisAmount:item.basisAmount,quantity:item.quantity});});
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,activeVersionId:uuid(parsed.pathParams.activeVersionId,'activeVersionId'),candidateVersionId:uuid(parsed.pathParams.candidateVersionId,'candidateVersionId'),scenario:Object.freeze({items:Object.freeze(items)})});
  }
  if (parsed.operationId === 'getPayment') {
    if (Object.keys(query).length) throw new FinanceReadError(400, 'INVALID_QUERY', 'getPayment query parametresi kabul etmez.');
    return Object.freeze({ operationId: parsed.operationId, scope, dealerAccountId, paymentId: uuid(parsed.pathParams.paymentId, 'paymentId') });
  }
  if (parsed.operationId === 'getAccrualDetail') {
    if (Object.keys(query).length) throw new FinanceReadError(400, 'INVALID_QUERY', 'getAccrualDetail query parametresi kabul etmez.');
    return Object.freeze({ operationId: parsed.operationId, scope, dealerAccountId, accrualId: uuid(parsed.pathParams.accrualId, 'accrualId') });
  }
  if (parsed.operationId === 'getRoyaltyRefundTrace') {
    if (Object.keys(query).length) throw new FinanceReadError(400, 'INVALID_QUERY', 'getRoyaltyRefundTrace query parametresi kabul etmez.');
    return Object.freeze({ operationId:parsed.operationId, scope, dealerAccountId, reversalAccrualId:uuid(parsed.pathParams.reversalAccrualId,'reversalAccrualId') });
  }
  if(parsed.operationId==='listServiceUsages'){
    const allowed=new Set(['from','to','family','chargeStatus','cursor','limit']);if(Object.keys(query).some(key=>!allowed.has(key))) throw new FinanceReadError(400,'INVALID_QUERY','Kullanım listesi için geçersiz query parametresi.');
    const from=calendarDate(query.from,'from'),to=calendarDate(query.to,'to');if(from&&to&&from>to) throw new FinanceReadError(400,'INVALID_QUERY','Kullanım tarih aralığı geçersiz.');
    if(query.family!==undefined&&!['QUERY','EXTERNAL_SERVICE'].includes(query.family)) throw new FinanceReadError(400,'INVALID_QUERY','Kullanım ailesi geçersiz.');
    if(query.chargeStatus!==undefined&&!['CHARGED','NOT_CHARGED','FAILED'].includes(query.chargeStatus)) throw new FinanceReadError(400,'INVALID_QUERY','Ücret durumu geçersiz.');
    if(query.cursor!==undefined&&(typeof query.cursor!=='string'||!query.cursor.length||query.cursor.length>512)) throw new FinanceReadError(400,'INVALID_QUERY','Kullanım cursor değeri geçersiz.');
    if(query.limit!==undefined&&(!Number.isInteger(query.limit)||query.limit<1||query.limit>200)) throw new FinanceReadError(400,'INVALID_QUERY','Kullanım limit değeri geçersiz.');
    return Object.freeze({operationId:parsed.operationId,scope,dealerAccountId,from,to,family:query.family,chargeStatus:query.chargeStatus,cursor:query.cursor,limit:query.limit});
  }
  if (parsed.operationId === 'getDealerFinanceSummary') {
    if (Object.keys(query).some(key => key !== 'asOf')) throw new FinanceReadError(400, 'INVALID_QUERY', 'Operasyon için geçersiz query parametresi.');
    return Object.freeze({ operationId: parsed.operationId, scope, dealerAccountId, asOf: calendarDate(query.asOf) });
  }
  const allowed = new Set(parsed.operationId === 'listRoyaltyRefunds' ? ['from','to','cursor','limit'] : ['from','to','status','cursor','limit']);
  if (Object.keys(query).some(key => !allowed.has(key))) throw new FinanceReadError(400, 'INVALID_QUERY', 'Operasyon için geçersiz query parametresi.');
  const from = calendarDate(query.from, 'from');
  const to = calendarDate(query.to, 'to');
  if (from && to && from > to) throw new FinanceReadError(400, 'INVALID_QUERY', 'Finans tarih aralığı geçersiz.');
  const statuses = parsed.operationId === 'listRoyaltyRefunds' ? [] : parsed.operationId === 'listPayments'
    ? ['PENDING_VERIFICATION','VERIFIED','PARTIALLY_ALLOCATED','ALLOCATED','REVERSED','REJECTED']
    : ['OPEN','PARTIALLY_ALLOCATED','CLOSED','DISPUTED','REVERSED'];
  if (query.status !== undefined && !statuses.includes(query.status)) throw new FinanceReadError(400, 'INVALID_QUERY', 'Finans durum filtresi geçersiz.');
  if (query.cursor !== undefined && (typeof query.cursor !== 'string' || !query.cursor.length || query.cursor.length > 512)) throw new FinanceReadError(400, 'INVALID_QUERY', 'Ekstre cursor değeri geçersiz.');
  if (query.limit !== undefined && (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 200)) throw new FinanceReadError(400, 'INVALID_QUERY', 'Ekstre limit değeri 1–200 arasında olmalıdır.');
  return Object.freeze({ operationId: parsed.operationId, scope, dealerAccountId, from, to, status: query.status, cursor: query.cursor, limit: query.limit });
}

export function createFinanceReadHandler({ allowedOrigins, authenticate, authorizeScope, authorizeHeadquartersScope, readOperationalHealth,readHeadquartersSummary,readExpenses,readExpense,readExportPackages,readExportPackage,readIntegrationErrors,readIntegrationError,readApprovalWorkItems,readApprovalWorkItem,readAuditEvents,readAuditCorrelationTrace,readDisputes,readDispute, readSummary, readStatement, readPayments, readPayment, readAccrualDetail, readRoyaltyRefunds, readServiceUsages, readRefundTrace, readCurrentPeriod, readCurrentContract, readContractFeeRules,readContractFeeRule,readContractVersionComparison,simulateContractVersionImpact, correlationFactory = () => crypto.randomUUID(), maxBodyBytes = 32768 } = {}) {
  const origins = new Set(allowedOrigins || []);
  const invalidOrigin = value => {
    try { const url = new URL(value); return value === '*' || url.origin !== value || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))); } catch { return true; }
  };
  if (!origins.size || [...origins].some(invalidOrigin)) throw new Error('HTTPS veya local HTTP açık origin allowlist zorunludur.');
  if (![authenticate, authorizeScope, authorizeHeadquartersScope, readOperationalHealth,readHeadquartersSummary,readExpenses,readExpense,readExportPackages,readExportPackage,readIntegrationErrors,readIntegrationError,readApprovalWorkItems,readApprovalWorkItem,readAuditEvents,readAuditCorrelationTrace,readDisputes,readDispute, readSummary, readStatement, readPayments, readPayment, readAccrualDetail, readRoyaltyRefunds, readServiceUsages, readRefundTrace, readCurrentPeriod, readCurrentContract, readContractFeeRules,readContractFeeRule,readContractVersionComparison,simulateContractVersionImpact].every(fn => typeof fn === 'function')) throw new Error('Finans sunucu portları zorunludur.');
  if (!Number.isInteger(maxBodyBytes) || maxBodyBytes < 1024 || maxBodyBytes > 65536) throw new Error('maxBodyBytes 1024–65536 arasında olmalıdır.');
  return async request => {
    const correlationId = correlation(request.headers.get('correlation-id'), correlationFactory);
    const origin = request.headers.get('origin') || '';
    try {
      if (!origins.has(origin)) throw new FinanceReadError(403, 'ORIGIN_DENIED', 'İstek kaynağına izin verilmiyor.');
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(origin, correlationId) });
      if (request.method !== 'POST') throw new FinanceReadError(405, 'METHOD_NOT_ALLOWED', 'Yalnızca POST desteklenir.');
      const match = /^Bearer\s+([^\s]+)$/i.exec(request.headers.get('authorization') || '');
      if (!match || match[1].length < 20) throw new FinanceReadError(401, 'AUTH_REQUIRED', 'Geçerli kullanıcı oturumu gereklidir.');
      const actor = await authenticate(match[1]);
      if (!actor?.id) throw new FinanceReadError(401, 'AUTH_REQUIRED', 'Kullanıcı doğrulanamadı.');
      const input = await body(request, maxBodyBytes);
      const allowed=['getFinanceOperationalHealth','getHeadquartersFinanceSummary','listPassThroughExpenses','getPassThroughExpense','listFinanceExportPackages','getFinanceExportPackage'].includes(input.operationId)
        ? await authorizeHeadquartersScope({actor,legalEntityId:input.scope.legalEntityId,operationId:input.operationId})
        : await authorizeScope({ actor, scope: input.scope, operationId: input.operationId });
      if (allowed !== true) throw new FinanceReadError(403, 'SCOPE_DENIED', 'Finans kapsamına erişim reddedildi.');
      const data = input.operationId === 'getFinanceOperationalHealth'
        ? await readOperationalHealth({actor,...input})
        : input.operationId === 'getHeadquartersFinanceSummary'
        ? await readHeadquartersSummary({actor,...input})
        : input.operationId==='listPassThroughExpenses'
          ? await readExpenses({actor,...input})
          : input.operationId==='getPassThroughExpense'
            ? await readExpense({actor,...input})
          : input.operationId==='listFinanceExportPackages'
            ? await readExportPackages({actor,...input})
          : input.operationId==='getFinanceExportPackage'
            ? await readExportPackage({actor,...input})
          : input.operationId==='listIntegrationErrors'
            ? await readIntegrationErrors({actor,...input})
          : input.operationId==='getIntegrationError'
            ? await readIntegrationError({actor,...input})
          : input.operationId==='listApprovalWorkItems'
            ? await readApprovalWorkItems({actor,...input})
          : input.operationId==='getApprovalWorkItem'
            ? await readApprovalWorkItem({actor,...input})
          : input.operationId==='listAuditEvents'
            ? await readAuditEvents({actor,...input})
          : input.operationId==='getAuditCorrelationTrace'
            ? await readAuditCorrelationTrace({actor,...input})
          : input.operationId==='listDisputes'
            ? await readDisputes({actor,...input})
          : input.operationId==='getDispute'
            ? await readDispute({actor,...input})
        : input.operationId === 'getDealerFinanceSummary'
        ? await readSummary({ actor, ...input })
        : input.operationId === 'getDealerStatement'
          ? await readStatement({ actor, ...input })
          : input.operationId === 'listPayments'
            ? await readPayments({ actor, ...input })
          : input.operationId === 'listRoyaltyRefunds'
            ? await readRoyaltyRefunds({ actor, ...input })
          : input.operationId === 'listServiceUsages'
            ? await readServiceUsages({actor,...input})
          : input.operationId === 'getPayment'
            ? await readPayment({ actor, ...input })
            : input.operationId === 'getAccrualDetail'
              ? await readAccrualDetail({ actor, ...input })
              : input.operationId === 'getRoyaltyRefundTrace'
                ? await readRefundTrace({ actor, ...input })
                : input.operationId === 'getFinancePeriod'
                  ? await readCurrentPeriod({ actor, ...input })
                  : input.operationId === 'getCurrentFranchiseContract'
                    ? await readCurrentContract({actor,...input})
                    : input.operationId === 'listContractFeeRules'
                      ? await readContractFeeRules({actor,...input})
                      : input.operationId === 'getContractFeeRule'
                        ? await readContractFeeRule({actor,...input})
                        : input.operationId === 'getContractVersionComparison'
                          ? await readContractVersionComparison({actor,...input})
                          : await simulateContractVersionImpact({actor,...input});
      return json(origin, correlationId, 200, { data });
    } catch (error) {
      const known = error instanceof FinanceReadError;
      return json(origins.has(origin) ? origin : 'null', correlationId, known ? error.status : 500, { error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Finans okuma servisi isteği tamamlanamadı.' } });
    }
  };
}
