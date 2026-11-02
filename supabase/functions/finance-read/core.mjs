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

function calendarDate(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new FinanceReadError(400, 'INVALID_QUERY', 'asOf geçerli YYYY-MM-DD tarihi olmalıdır.');
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new FinanceReadError(400, 'INVALID_QUERY', 'asOf geçerli YYYY-MM-DD tarihi olmalıdır.');
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
  if (parsed.operationId !== 'getDealerFinanceSummary') throw new FinanceReadError(403, 'OPERATION_DENIED', 'Finans okuma operasyonuna izin verilmiyor.');
  const scope = Object.freeze({
    legalEntityId: uuid(parsed.scope?.legalEntityId, 'legalEntityId'),
    dealerAccountId: uuid(parsed.scope?.dealerAccountId, 'dealerAccountId'),
    branchId: uuid(parsed.scope?.branchId, 'branchId'),
  });
  const pathKeys = parsed.pathParams && typeof parsed.pathParams === 'object' && !Array.isArray(parsed.pathParams) ? Object.keys(parsed.pathParams) : [];
  if (pathKeys.length !== 1 || pathKeys[0] !== 'dealerAccountId') throw new FinanceReadError(400, 'INVALID_PATH_PARAMS', 'dealerAccountId path parametresi zorunludur.');
  const dealerAccountId = uuid(parsed.pathParams.dealerAccountId, 'dealerAccountId');
  if (dealerAccountId !== scope.dealerAccountId) throw new FinanceReadError(403, 'SCOPE_DENIED', 'Bayi hesabı finans kapsamıyla uyuşmuyor.');
  const query = parsed.query && typeof parsed.query === 'object' && !Array.isArray(parsed.query) ? parsed.query : {};
  if (Object.keys(query).some(key => key !== 'asOf')) throw new FinanceReadError(400, 'INVALID_QUERY', 'Operasyon için geçersiz query parametresi.');
  return Object.freeze({ scope, dealerAccountId, asOf: calendarDate(query.asOf) });
}

export function createFinanceReadHandler({ allowedOrigins, authenticate, authorizeScope, readSummary, correlationFactory = () => crypto.randomUUID(), maxBodyBytes = 32768 } = {}) {
  const origins = new Set(allowedOrigins || []);
  const invalidOrigin = value => {
    try { const url = new URL(value); return value === '*' || url.origin !== value || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))); } catch { return true; }
  };
  if (!origins.size || [...origins].some(invalidOrigin)) throw new Error('HTTPS veya local HTTP açık origin allowlist zorunludur.');
  if (![authenticate, authorizeScope, readSummary].every(fn => typeof fn === 'function')) throw new Error('Finans sunucu portları zorunludur.');
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
      if (await authorizeScope({ actor, scope: input.scope, operationId: 'getDealerFinanceSummary' }) !== true) throw new FinanceReadError(403, 'SCOPE_DENIED', 'Şube finans kapsamına erişim reddedildi.');
      const data = await readSummary({ actor, ...input });
      return json(origin, correlationId, 200, { data });
    } catch (error) {
      const known = error instanceof FinanceReadError;
      return json(origins.has(origin) ? origin : 'null', correlationId, known ? error.status : 500, { error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Finans okuma servisi isteği tamamlanamadı.' } });
    }
  };
}
