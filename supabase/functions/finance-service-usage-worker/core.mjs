const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONEY = /^(0|[1-9]\d*)(?:\.\d{1,8})?$/;
const CODE = /^[A-Z][A-Z0-9_]{1,63}$/;
const PROVIDER = /^[A-Z0-9][A-Z0-9_.:-]{1,63}$/;
const TYPES = new Set(['query.completed', 'external-service.delivered']);
const QUERY_SERVICE_CODES = new Set(['TRAMER_QUERY', 'KM_QUERY', 'TRAMER_360_QUERY']);

const canonical = value => value === null || typeof value !== 'object'
  ? JSON.stringify(value)
  : Array.isArray(value)
    ? `[${value.map(canonical).join(',')}]`
    : `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
const digest = async value => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
const hex = bytes => [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');

async function same(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const [leftHash, rightHash] = await Promise.all([digest(left), digest(right)]);
  let mismatch = leftHash.length ^ rightHash.length;
  for (let index = 0; index < Math.max(leftHash.length, rightHash.length); index++) {
    mismatch |= (leftHash[index] || 0) ^ (rightHash[index] || 0);
  }
  return mismatch === 0;
}

const json = (status, correlationId, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'Correlation-Id': correlationId },
});

const uuid = (value, name) => {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw Object.assign(new Error(`${name} geçerli UUID olmalıdır.`), { status: 400, code: 'INVALID_EVENT' });
  }
  return value.toLowerCase();
};

export function createFinanceServiceUsageWorkerHandler({ serviceRoleKey, commitUsage, correlationFactory = () => crypto.randomUUID(), maxBodyBytes = 16384 } = {}) {
  if (typeof serviceRoleKey !== 'string' || serviceRoleKey.length < 40 || typeof commitUsage !== 'function') {
    throw new Error('Service usage worker yapılandırması geçersiz.');
  }
  return async request => {
    const correlationId = request.headers.get('correlation-id')?.match(UUID)?.[0]?.toLowerCase() || correlationFactory();
    try {
      if (request.method !== 'POST') return json(405, correlationId, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Yalnızca POST desteklenir.' } });
      if (!await same(request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''), serviceRoleKey)) return json(401, correlationId, { error: { code: 'WORKER_AUTH_REQUIRED', message: 'Güvenilir finans worker kimliği zorunludur.' } });
      if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return json(415, correlationId, { error: { code: 'CONTENT_TYPE_REQUIRED', message: 'application/json zorunludur.' } });
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > maxBodyBytes) return json(413, correlationId, { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Olay gövdesi sınırı aşıldı.' } });
      let body;
      try { body = JSON.parse(raw); } catch { return json(400, correlationId, { error: { code: 'INVALID_JSON', message: 'Geçerli JSON zorunludur.' } }); }
      const fields = ['actorId', 'legalEntityId', 'dealerLegalEntityId', 'dealerAccountId', 'branchId', 'sourceSystem', 'eventId', 'eventType', 'businessDate', 'occurredAtUtc', 'serviceCode', 'providerCode', 'externalReference', 'providerCostAmount', 'currency', 'freeEntitlementApplied', 'technicalRepeat'];
      const invalid = !body || typeof body !== 'object' || Array.isArray(body)
        || Object.keys(body).some(key => !fields.includes(key))
        || !PROVIDER.test(body.sourceSystem || '') || !TYPES.has(body.eventType)
        || !DATE.test(body.businessDate || '') || Number.isNaN(Date.parse(body.occurredAtUtc))
        || !CODE.test(body.serviceCode || '')
        || (body.eventType === 'query.completed' && !QUERY_SERVICE_CODES.has(body.serviceCode))
        || !PROVIDER.test(body.providerCode || '') || typeof body.externalReference !== 'string'
        || !body.externalReference.trim() || body.externalReference.length > 200
        || !MONEY.test(body.providerCostAmount || '') || !/^[A-Z]{3}$/.test(body.currency || '')
        || typeof body.freeEntitlementApplied !== 'boolean' || typeof body.technicalRepeat !== 'boolean';
      if (invalid) return json(400, correlationId, { error: { code: 'INVALID_EVENT', message: 'Sorgu/hizmet kullanım olayı geçersiz.' } });
      const payload = { serviceCode: body.serviceCode, providerCode: body.providerCode, externalReference: body.externalReference.trim(), providerCostAmount: body.providerCostAmount, currency: body.currency, freeEntitlementApplied: body.freeEntitlementApplied, technicalRepeat: body.technicalRepeat };
      const input = {
        actorId: uuid(body.actorId, 'actorId'), legalEntityId: uuid(body.legalEntityId, 'legalEntityId'),
        dealerLegalEntityId: uuid(body.dealerLegalEntityId, 'dealerLegalEntityId'), dealerAccountId: uuid(body.dealerAccountId, 'dealerAccountId'),
        branchId: uuid(body.branchId, 'branchId'), sourceSystem: body.sourceSystem, eventId: uuid(body.eventId, 'eventId'),
        eventType: body.eventType, businessDate: body.businessDate, occurredAtUtc: new Date(body.occurredAtUtc).toISOString(),
        payload, payloadHash: hex(await digest(canonical(payload))), correlationId,
      };
      const result = await commitUsage(input);
      if (!result || !['ACCEPTED', 'REPLAY', 'CONFLICT'].includes(result.outcome)) throw new Error('invalid service usage response');
      return json(result.outcome === 'CONFLICT' ? 409 : 200, correlationId, { data: { ...result, correlationId } });
    } catch (error) {
      const known = Number.isInteger(error?.status) && typeof error?.code === 'string';
      return json(known ? error.status : 500, correlationId, { error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Sorgu/hizmet worker işlemi tamamlanamadı.' } });
    }
  };
}
