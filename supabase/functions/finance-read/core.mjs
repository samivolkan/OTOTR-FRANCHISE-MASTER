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
  if (!['getDealerFinanceSummary','getDealerStatement','listPayments','getPayment','getAccrualDetail','listRoyaltyRefunds','getRoyaltyRefundTrace','getFinancePeriod','getCurrentFranchiseContract','listContractFeeRules'].includes(parsed.operationId)) throw new FinanceReadError(403, 'OPERATION_DENIED', 'Finans okuma operasyonuna izin verilmiyor.');
  const scope = Object.freeze({
    legalEntityId: uuid(parsed.scope?.legalEntityId, 'legalEntityId'),
    dealerAccountId: uuid(parsed.scope?.dealerAccountId, 'dealerAccountId'),
    branchId: uuid(parsed.scope?.branchId, 'branchId'),
  });
  const pathKeys = parsed.pathParams && typeof parsed.pathParams === 'object' && !Array.isArray(parsed.pathParams) ? Object.keys(parsed.pathParams) : [];
  const expectedPathKeys = parsed.operationId === 'getPayment'
    ? ['dealerAccountId','paymentId']
    : parsed.operationId === 'getAccrualDetail'
      ? ['dealerAccountId','accrualId']
      : parsed.operationId === 'getRoyaltyRefundTrace'
        ? ['dealerAccountId','reversalAccrualId']
      : parsed.operationId === 'listContractFeeRules'
        ? ['dealerAccountId','contractVersionId']
      : ['dealerAccountId'];
  if (pathKeys.length !== expectedPathKeys.length || expectedPathKeys.some(key => !pathKeys.includes(key))) throw new FinanceReadError(400, 'INVALID_PATH_PARAMS', `${expectedPathKeys.join(', ')} path parametreleri zorunludur.`);
  const dealerAccountId = uuid(parsed.pathParams.dealerAccountId, 'dealerAccountId');
  if (dealerAccountId !== scope.dealerAccountId) throw new FinanceReadError(403, 'SCOPE_DENIED', 'Bayi hesabı finans kapsamıyla uyuşmuyor.');
  const query = parsed.query && typeof parsed.query === 'object' && !Array.isArray(parsed.query) ? parsed.query : {};
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

export function createFinanceReadHandler({ allowedOrigins, authenticate, authorizeScope, readSummary, readStatement, readPayments, readPayment, readAccrualDetail, readRoyaltyRefunds, readRefundTrace, readCurrentPeriod, readCurrentContract, readContractFeeRules, correlationFactory = () => crypto.randomUUID(), maxBodyBytes = 32768 } = {}) {
  const origins = new Set(allowedOrigins || []);
  const invalidOrigin = value => {
    try { const url = new URL(value); return value === '*' || url.origin !== value || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))); } catch { return true; }
  };
  if (!origins.size || [...origins].some(invalidOrigin)) throw new Error('HTTPS veya local HTTP açık origin allowlist zorunludur.');
  if (![authenticate, authorizeScope, readSummary, readStatement, readPayments, readPayment, readAccrualDetail, readRoyaltyRefunds, readRefundTrace, readCurrentPeriod, readCurrentContract, readContractFeeRules].every(fn => typeof fn === 'function')) throw new Error('Finans sunucu portları zorunludur.');
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
      if (await authorizeScope({ actor, scope: input.scope, operationId: input.operationId }) !== true) throw new FinanceReadError(403, 'SCOPE_DENIED', 'Şube finans kapsamına erişim reddedildi.');
      const data = input.operationId === 'getDealerFinanceSummary'
        ? await readSummary({ actor, ...input })
        : input.operationId === 'getDealerStatement'
          ? await readStatement({ actor, ...input })
          : input.operationId === 'listPayments'
            ? await readPayments({ actor, ...input })
          : input.operationId === 'listRoyaltyRefunds'
            ? await readRoyaltyRefunds({ actor, ...input })
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
                    : await readContractFeeRules({actor,...input});
      return json(origin, correlationId, 200, { data });
    } catch (error) {
      const known = error instanceof FinanceReadError;
      return json(origins.has(origin) ? origin : 'null', correlationId, known ? error.status : 500, { error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Finans okuma servisi isteği tamamlanamadı.' } });
    }
  };
}
