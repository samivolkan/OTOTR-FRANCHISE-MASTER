const EVENT_TYPE = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FORBIDDEN_RESULT_KEYS = new Set(['royaltyAmount', 'calculatedFee', 'calculatedFeeAmount', 'accrualAmount', 'journalEntries', 'openItemAmount', 'financeResult']);
const EVENT_KEYS = new Set(['eventId', 'eventType', 'schemaVersion', 'businessDate', 'occurredAtUtc', 'receivedAtUtc', 'sourceSystem', 'aggregateType', 'aggregateId', 'aggregateVersion', 'scope', 'trace', 'actor', 'payload', 'metadata']);
const COLLECTION_KEYS = new Set(['collectionId','branchId','collectionStatus','transactionType','collectionCompleteness','collectedGrossAmount','currency','settledAtUtc','workOrderId','customerInvoiceRef','paymentChannel','sourceEvidenceRef']);
const REFUND_KEYS = new Set(['refundId','originalCollectionId','branchId','refundStatus','transactionType','refundCompleteness','refundedGrossAmount','currency','refundedAtUtc','reasonCode','sourceEvidenceRef']);
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const POSITIVE_DECIMAL = /^(?:[1-9]\d*(?:\.\d{1,8})?|0\.(?=\d{1,8}$)(?=\d*[1-9])\d{1,8})$/;

function ingestionError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function required(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw ingestionError('INVALID_SOURCE_EVENT', `${field} zorunludur.`);
  return value.trim();
}

function assertNoCalculatedResult(value, path = 'payload') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, index) => assertNoCalculatedResult(item, `${path}[${index}]`));
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_RESULT_KEYS.has(key)) throw ingestionError('CALCULATED_RESULT_FORBIDDEN', `${path}.${key} ERP tarafından dayatılamaz.`);
    assertNoCalculatedResult(child, `${path}.${key}`);
  }
}

function validateSettledCollectionPayload(payload,scope,input){
  for(const key of Object.keys(payload))if(!COLLECTION_KEYS.has(key))throw ingestionError('UNKNOWN_FIELD',`Bilinmeyen tahsilat alanı: payload.${key}`);
  const collectionId=required(payload.collectionId,'payload.collectionId');if(!UUID.test(collectionId))throw ingestionError('INVALID_SOURCE_EVENT','payload.collectionId UUID olmalıdır.');
  const branchId=required(payload.branchId,'payload.branchId');if(!UUID.test(branchId)||branchId!==scope.branchId)throw ingestionError('INVALID_SCOPE','Tahsilat şubesi olay kapsamıyla eşleşmelidir.');
  if(payload.collectionStatus!=='SETTLED'||payload.transactionType!=='COLLECTION')throw ingestionError('INVALID_SOURCE_EVENT','Yalnız kesinleşmiş COLLECTION olayı kabul edilir.');
  if(!['PARTIAL','FULL'].includes(payload.collectionCompleteness))throw ingestionError('INVALID_SOURCE_EVENT','collectionCompleteness PARTIAL veya FULL olmalıdır.');
  if(typeof payload.collectedGrossAmount!=='string'||!POSITIVE_DECIMAL.test(payload.collectedGrossAmount))throw ingestionError('INVALID_SOURCE_EVENT','collectedGrossAmount pozitif kesin ondalık metin olmalıdır.');
  if(typeof payload.currency!=='string'||!/^[A-Z]{3}$/.test(payload.currency))throw ingestionError('INVALID_SOURCE_EVENT','currency ISO 4217 biçiminde olmalıdır.');
  if(typeof payload.settledAtUtc!=='string'||!Number.isFinite(Date.parse(payload.settledAtUtc)))throw ingestionError('INVALID_SOURCE_EVENT','settledAtUtc geçerli UTC zaman olmalıdır.');
  if(input.aggregateType!=='CUSTOMER_PAYMENT'||input.aggregateId!==collectionId)throw ingestionError('INVALID_SOURCE_EVENT','Tahsilat aggregate kimliği collectionId ile eşleşmelidir.');
}

function validateRefundedCollectionPayload(payload,scope,input){
  for(const key of Object.keys(payload))if(!REFUND_KEYS.has(key))throw ingestionError('UNKNOWN_FIELD',`Bilinmeyen iade alanı: payload.${key}`);
  const refundId=required(payload.refundId,'payload.refundId');if(!UUID.test(refundId))throw ingestionError('INVALID_SOURCE_EVENT','payload.refundId UUID olmalıdır.');
  const originalCollectionId=required(payload.originalCollectionId,'payload.originalCollectionId');if(!UUID.test(originalCollectionId)||originalCollectionId===refundId)throw ingestionError('INVALID_SOURCE_EVENT','payload.originalCollectionId geçerli ve refundId değerinden farklı UUID olmalıdır.');
  const branchId=required(payload.branchId,'payload.branchId');if(!UUID.test(branchId)||branchId!==scope.branchId)throw ingestionError('INVALID_SCOPE','İade şubesi olay kapsamıyla eşleşmelidir.');
  if(payload.refundStatus!=='SETTLED'||payload.transactionType!=='REFUND')throw ingestionError('INVALID_SOURCE_EVENT','Yalnız kesinleşmiş REFUND olayı kabul edilir.');
  if(!['PARTIAL','FULL'].includes(payload.refundCompleteness))throw ingestionError('INVALID_SOURCE_EVENT','refundCompleteness PARTIAL veya FULL olmalıdır.');
  if(typeof payload.refundedGrossAmount!=='string'||!POSITIVE_DECIMAL.test(payload.refundedGrossAmount))throw ingestionError('INVALID_SOURCE_EVENT','refundedGrossAmount pozitif kesin ondalık metin olmalıdır.');
  if(typeof payload.currency!=='string'||!/^[A-Z]{3}$/.test(payload.currency))throw ingestionError('INVALID_SOURCE_EVENT','currency ISO 4217 biçiminde olmalıdır.');
  if(typeof payload.refundedAtUtc!=='string'||!Number.isFinite(Date.parse(payload.refundedAtUtc)))throw ingestionError('INVALID_SOURCE_EVENT','refundedAtUtc geçerli UTC zaman olmalıdır.');
  if(input.aggregateType!=='CUSTOMER_PAYMENT_REFUND'||input.aggregateId!==refundId)throw ingestionError('INVALID_SOURCE_EVENT','İade aggregate kimliği refundId ile eşleşmelidir.');
}

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
}

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function normalizeEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw ingestionError('INVALID_SOURCE_EVENT', 'Kaynak olay nesnesi zorunludur.');
  for (const key of Object.keys(input)) if (!EVENT_KEYS.has(key)) throw ingestionError('UNKNOWN_FIELD', `Bilinmeyen kaynak olay alanı: ${key}`);
  const eventType = required(input.eventType, 'eventType');
  if (!EVENT_TYPE.test(eventType) || eventType.length > 150) throw ingestionError('INVALID_SOURCE_EVENT', 'eventType sözleşmeye uymuyor.');
  if (!Number.isInteger(input.schemaVersion) || input.schemaVersion < 1) throw ingestionError('INVALID_SOURCE_EVENT', 'schemaVersion pozitif olmalıdır.');
  if (!Number.isInteger(input.aggregateVersion) || input.aggregateVersion < 0) throw ingestionError('INVALID_SOURCE_EVENT', 'aggregateVersion negatif olamaz.');
  const businessDate = required(input.businessDate, 'businessDate');
  if (!ISO_DATE.test(businessDate)) throw ingestionError('INVALID_SOURCE_EVENT', 'businessDate ISO tarih olmalıdır.');
  const occurredAtUtc = required(input.occurredAtUtc, 'occurredAtUtc');
  const receivedAtUtc = required(input.receivedAtUtc, 'receivedAtUtc');
  const occurredMs = Date.parse(occurredAtUtc);
  const receivedMs = Date.parse(receivedAtUtc);
  if (!Number.isFinite(occurredMs) || !Number.isFinite(receivedMs)) throw ingestionError('INVALID_SOURCE_EVENT', 'UTC zamanları geçersiz.');
  const scope = input.scope;
  if (!scope || typeof scope !== 'object') throw ingestionError('INVALID_SCOPE', 'Kaynak olay kapsamı zorunludur.');
  const normalizedScope = Object.freeze({
    headquartersLegalEntityId: required(scope.headquartersLegalEntityId, 'scope.headquartersLegalEntityId'),
    dealerLegalEntityId: required(scope.dealerLegalEntityId, 'scope.dealerLegalEntityId'),
    branchId: required(scope.branchId, 'scope.branchId'),
  });
  const trace = input.trace;
  if (!trace || typeof trace !== 'object') throw ingestionError('INVALID_SOURCE_EVENT', 'trace zorunludur.');
  const payload = input.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw ingestionError('INVALID_SOURCE_EVENT', 'payload nesne olmalıdır.');
  assertNoCalculatedResult(payload);
  if(eventType==='customer-payment.settled')validateSettledCollectionPayload(payload,normalizedScope,input);
  if(eventType==='customer-payment.refunded')validateRefundedCollectionPayload(payload,normalizedScope,input);
  return Object.freeze({
    eventId: required(input.eventId, 'eventId'), eventType, schemaVersion: input.schemaVersion,
    businessDate, occurredAtUtc, receivedAtUtc, sourceSystem: required(input.sourceSystem, 'sourceSystem'),
    aggregateType: required(input.aggregateType, 'aggregateType'), aggregateId: required(input.aggregateId, 'aggregateId'),
    aggregateVersion: input.aggregateVersion, scope: normalizedScope,
    trace: Object.freeze({ correlationId: required(trace.correlationId, 'trace.correlationId'), causationId: trace.causationId || null, idempotencyKey: required(trace.idempotencyKey, 'trace.idempotencyKey') }),
    actor: input.actor || null, payload: Object.freeze({ ...payload }), metadata: Object.freeze({ ...(input.metadata || {}) }),
    occurredMs, receivedMs,
  });
}

function immutableBusinessEvent(event) {
  return {
    eventId: event.eventId, eventType: event.eventType, schemaVersion: event.schemaVersion,
    businessDate: event.businessDate, occurredAtUtc: event.occurredAtUtc, sourceSystem: event.sourceSystem,
    aggregateType: event.aggregateType, aggregateId: event.aggregateId, aggregateVersion: event.aggregateVersion,
    scope: event.scope, payload: event.payload,
  };
}

export function createSourceEventIngestionService({ repository, hash = sha256Hex, maximumClockSkewMs = 300000 } = {}) {
  if (!repository || typeof repository.findBySourceAndEvent !== 'function' || typeof repository.insertInboxAndSourceEvent !== 'function') throw ingestionError('CONFIGURATION_ERROR', 'Atomik kaynak olay repository portu zorunludur.');
  if (typeof hash !== 'function') throw ingestionError('CONFIGURATION_ERROR', 'hash fonksiyonu zorunludur.');
  if (!Number.isInteger(maximumClockSkewMs) || maximumClockSkewMs < 0) throw ingestionError('CONFIGURATION_ERROR', 'maximumClockSkewMs geçersiz.');
  return Object.freeze({
    async ingest(input) {
      const event = normalizeEvent(input);
      if (event.receivedMs + maximumClockSkewMs < event.occurredMs) throw ingestionError('CLOCK_SKEW_EXCEEDED', 'receivedAtUtc izin verilen toleranstan erken.');
      const payloadHash = await hash(canonicalize(immutableBusinessEvent(event)));
      const existing = await repository.findBySourceAndEvent(event.sourceSystem, event.eventId, event.scope);
      if (existing) {
        if (existing.payloadHash !== payloadHash) throw ingestionError('IDEMPOTENCY_CONFLICT', 'Aynı kaynak ve eventId farklı iş içeriğiyle gönderildi.');
        return Object.freeze({ status: 'DUPLICATE', sourceEventId: existing.sourceEventId, payloadHash });
      }
      const persisted = await repository.insertInboxAndSourceEvent(Object.freeze({ event, payloadHash }));
      if (persisted?.status === 'DUPLICATE') {
        if (persisted.payloadHash !== payloadHash) throw ingestionError('IDEMPOTENCY_CONFLICT', 'Eşzamanlı tekrar farklı iş içeriği taşıyor.');
        return Object.freeze({ status: 'DUPLICATE', sourceEventId: persisted.sourceEventId, payloadHash });
      }
      if (persisted?.status === 'CONFLICT') throw ingestionError('IDEMPOTENCY_CONFLICT', 'Eşzamanlı tekrar farklı iş içeriği taşıyor.');
      if (!persisted?.sourceEventId) throw ingestionError('PERSISTENCE_ERROR', 'Kaynak olay atomik olarak kaydedilemedi.');
      return Object.freeze({ status: 'ACCEPTED', sourceEventId: persisted.sourceEventId, payloadHash });
    },
  });
}

export const SOURCE_EVENT_INGESTION_CONTRACT = Object.freeze({
  uniqueKey: Object.freeze(['sourceSystem', 'eventId']),
  transactionWrites: Object.freeze(['inbox_messages', 'source_events']),
  calculatedFinanceResultFromErp: 'FORBIDDEN',
  requiredScope: Object.freeze(['headquartersLegalEntityId', 'dealerLegalEntityId', 'branchId']),
});

